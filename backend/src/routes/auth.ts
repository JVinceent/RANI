import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db";
import { fundTestnetAccount } from "../lib/stellar";
import { Keypair } from "@stellar/stellar-sdk";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
});

/**
 * Simplified MVP auth: register with email, backend generates a fresh
 * testnet keypair and funds it via Friendbot. In production, the public
 * key would instead come from the user's own Freighter connection —
 * swap this for a "connect" endpoint that just verifies + stores the
 * public key Freighter returns client-side.
 */
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

  const user = await prisma.user.create({
    data: { email, stellarPublicKey: keypair.publicKey() },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

  res.json({
    token,
    userId: user.id,
    stellarPublicKey: user.stellarPublicKey,
    // Only returned once, at creation — the frontend must let the user
    // save this (or better: integrate real Freighter connect for prod).
    secretKeyWarning: "Store this secret securely, it will not be shown again.",
    secretKey: keypair.secret(),
  });
});

authRouter.post("/connect-freighter", async (req, res) => {
  const schema = z.object({ email: z.string().email(), publicKey: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, publicKey } = parsed.data;
  const user = await prisma.user.upsert({
    where: { email },
    update: { stellarPublicKey: publicKey },
    create: { email, stellarPublicKey: publicKey },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, userId: user.id, stellarPublicKey: user.stellarPublicKey });
});
