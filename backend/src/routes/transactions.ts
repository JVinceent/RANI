import { Router } from "express";
import { z } from "zod";
import { BASE_FEE } from "@stellar/stellar-sdk";
import { supabase } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { buildPaymentXDR, submitSignedTransaction, pollTransaction } from "../lib/payment";
import { simulatePathPayment } from "../lib/simulate";
import { fetchBalances } from "../lib/balances";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

transactionsRouter.get("/balance", async (req: AuthedRequest, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (error || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }
  const balances = await fetchBalances(user.stellar_public_key);
  res.json(balances);
});

const simulateSchema = z.object({
  destinationAssetCode: z.string(),
  destinationAssetIssuer: z.string().optional(),
  destinationAmount: z.string(),
});

transactionsRouter.post("/simulate", async (req: AuthedRequest, res) => {
  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (error || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }

  try {
    const result = await simulatePathPayment({
      sourcePublicKey: user.stellar_public_key,
      destinationAsset: { code: parsed.data.destinationAssetCode, issuer: parsed.data.destinationAssetIssuer },
      destinationAmount: parsed.data.destinationAmount,
    });
    res.json(result);
  } catch (e: any) {
    res.status(422).json({ error: e.message });
  }
});

const buildSchema = z.object({
  contactId: z.string(),
  amount: z.string(),
  assetCode: z.string(),
  assetIssuer: z.string().optional(),
  memo: z.string().max(28).optional(),
});

transactionsRouter.post("/build", async (req: AuthedRequest, res) => {
  const parsed = buildSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (userErr || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }

  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", parsed.data.contactId)
    .eq("user_id", req.userId!)
    .single();

  if (contactErr || !contact) return res.status(404).json({ error: "Contact not found" });

  // Server-side spending guardrail — independent of any client-side check,
  // per project doc section 7 ("second guardrail independent of the AI layer").
  const { data: limit } = await supabase
    .from("spending_limits")
    .select("per_tx_limit")
    .eq("user_id", req.userId!)
    .single();

  const amountNum = parseFloat(parsed.data.amount);
  if (limit && amountNum > limit.per_tx_limit) {
    return res.status(403).json({ error: `Amount exceeds your per-transaction limit of ${limit.per_tx_limit}` });
  }

  const xdr = await buildPaymentXDR({
    senderPublicKey: user.stellar_public_key,
    destinationPublicKey: contact.address,
    amount: parsed.data.amount,
    assetCode: parsed.data.assetCode,
    assetIssuer: parsed.data.assetIssuer,
    memoText: parsed.data.memo,
  });

  const feeXLM = (Number(BASE_FEE) / 10_000_000).toFixed(7);

  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      user_id: req.userId!,
      contact_id: contact.id,
      amount: parsed.data.amount,
      asset_code: parsed.data.assetCode,
      asset_issuer: parsed.data.assetIssuer,
      memo: parsed.data.memo,
      status: "AWAITING_SIGNATURE",
    })
    .select()
    .single();

  if (txErr) return res.status(500).json({ error: txErr.message });
  res.json({ transactionId: tx.id, xdr, feeXLM });
});

const submitSchema = z.object({
  transactionId: z.string(),
  signedXdr: z.string(),
});

transactionsRouter.post("/submit", async (req: AuthedRequest, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { transactionId, signedXdr } = parsed.data;
  const { data: tx, error: findErr } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", transactionId)
    .eq("user_id", req.userId!)
    .single();

  if (findErr || !tx) return res.status(404).json({ error: "Transaction not found" });

  try {
    await supabase.from("transactions").update({ status: "SUBMITTING" }).eq("id", tx.id);
    const hash = await submitSignedTransaction(signedXdr);

    await supabase.from("transactions").update({ status: "POLLING", stellar_tx_hash: hash }).eq("id", tx.id);
    await pollTransaction(hash); // throws on failure/timeout — polling per dev_setup gotcha

    const { data: updated, error: updateErr } = await supabase
      .from("transactions")
      .update({ status: "SUCCESS" })
      .eq("id", tx.id)
      .select()
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    // Memo IS the receipt — per project doc section 7, no separate DB needed
    // to answer "what was this for" later, but we log it anyway for the
    // in-app history view.
    await supabase.from("audit_log").insert({
      user_id: req.userId!,
      action: "transaction_success",
      payload: { transactionId: tx.id, hash }, // jsonb column — pass a real object, not a JSON string
    });

    res.json(updated);
  } catch (e: any) {
    await supabase
      .from("transactions")
      .update({ status: "FAILED", error_message: e.message })
      .eq("id", tx.id);
    res.status(502).json({ error: e.message });
  }
});

transactionsRouter.get("/history", async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, contact:contacts(*)") // embeds the related contact row, like Prisma's `include`
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});