import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { buildPaymentXDR, submitSignedTransaction, pollTransaction } from "../lib/payment";
import { simulatePathPayment } from "../lib/simulate";
import { fetchBalances } from "../lib/balances";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

transactionsRouter.get("/balance", async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.stellarPublicKey) return res.status(400).json({ error: "No linked Stellar account" });
  const balances = await fetchBalances(user.stellarPublicKey);
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

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.stellarPublicKey) return res.status(400).json({ error: "No linked Stellar account" });

  try {
    const result = await simulatePathPayment({
      sourcePublicKey: user.stellarPublicKey,
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

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.stellarPublicKey) return res.status(400).json({ error: "No linked Stellar account" });

  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, userId: req.userId! },
  });
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  // Server-side spending guardrail — independent of any client-side check,
  // per project doc section 7 ("second guardrail independent of the AI layer").
  const limit = await prisma.spendingLimit.findUnique({ where: { userId: req.userId! } });
  const amountNum = parseFloat(parsed.data.amount);
  if (limit && amountNum > limit.perTxLimit) {
    return res.status(403).json({ error: `Amount exceeds your per-transaction limit of ${limit.perTxLimit}` });
  }

  const xdr = await buildPaymentXDR({
    senderPublicKey: user.stellarPublicKey,
    destinationPublicKey: contact.address,
    amount: parsed.data.amount,
    assetCode: parsed.data.assetCode,
    assetIssuer: parsed.data.assetIssuer,
    memoText: parsed.data.memo,
  });

  const tx = await prisma.transaction.create({
    data: {
      userId: req.userId!,
      contactId: contact.id,
      amount: parsed.data.amount,
      assetCode: parsed.data.assetCode,
      assetIssuer: parsed.data.assetIssuer,
      memo: parsed.data.memo,
      status: "AWAITING_SIGNATURE",
    },
  });

  res.json({ transactionId: tx.id, xdr });
});

const submitSchema = z.object({
  transactionId: z.string(),
  signedXdr: z.string(),
});

transactionsRouter.post("/submit", async (req: AuthedRequest, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { transactionId, signedXdr } = parsed.data;
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: req.userId! },
  });
  if (!tx) return res.status(404).json({ error: "Transaction not found" });

  try {
    await prisma.transaction.update({ where: { id: tx.id }, data: { status: "SUBMITTING" } });
    const hash = await submitSignedTransaction(signedXdr);

    await prisma.transaction.update({ where: { id: tx.id }, data: { status: "POLLING", stellarTxHash: hash } });
    await pollTransaction(hash); // throws on failure/timeout — polling per dev_setup gotcha

    const updated = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "SUCCESS" },
    });

    // Memo IS the receipt — per project doc section 7, no separate DB needed
    // to answer "what was this for" later, but we log it anyway for the
    // in-app history view.
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: "transaction_success",
        payload: JSON.stringify({ transactionId: tx.id, hash }),
      },
    });

    res.json(updated);
  } catch (e: any) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "FAILED", errorMessage: e.message },
    });
    res.status(502).json({ error: e.message });
  }
});

transactionsRouter.get("/history", async (req: AuthedRequest, res) => {
  const txs = await prisma.transaction.findMany({
    where: { userId: req.userId! },
    include: { contact: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(txs);
});
