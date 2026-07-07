import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { supabase } from "../db";
import { fundTestnetAccount } from "../lib/stellar";
import { Keypair } from "@stellar/stellar-sdk";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
});


authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email } = parsed.data;
  const keypair = Keypair.random();

  try {
    await fundTestnetAccount(keypair.publicKey());
  } catch (e) {
    return res.status(502).json({ error: "Friendbot funding failed, try again" });
  }

  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, stellar_public_key: keypair.publicKey() })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

  res.json({
    token,
    userId: user.id,
    stellarPublicKey: user.stellar_public_key,
  
    secretKeyWarning: "Store this secret securely, it will not be shown again.",
    secretKey: keypair.secret(),
  });
});

authRouter.post("/connect-freighter", async (req, res) => {
  const schema = z.object({ email: z.string().email(), publicKey: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, publicKey } = parsed.data;

  const { data: user, error } = await supabase
    .from("users")
    .upsert(
      { email, stellar_public_key: publicKey },
      { onConflict: "email" } // matches Prisma's upsert: update if email exists, insert if not
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (error) return res.status(500).json({ error: error.message });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({
    token,
    userId: user.id,
    stellarPublicKey: user.stellar_public_key,
    name: user.name ?? null,
  });

  authRouter.patch("/name", requireAuth, async (req: AuthedRequest, res) => {
  const schema = z.object({ name: z.string().min(1).max(50) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error } = await supabase
    .from("users")
    .update({ name: parsed.data.name })
    .eq("id", req.userId!)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ name: user.name });
  });
});