import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { parseCommand } from "../lib/nlp";

export const parseRouter = Router();
parseRouter.use(requireAuth);

const bodySchema = z.object({ text: z.string().min(1) });

parseRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const command = parseCommand(parsed.data.text);

  // Feeds ClarificationState.tsx directly when ambiguous
  if (command.needsClarification || command.intent === "unknown") {
    return res.json(command);
  }

  if (command.intent === "send_payment" && command.recipientName) {
    const { data: matches, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", req.userId!)
      .ilike("name", `%${command.recipientName}%`);

    if (error) return res.status(500).json({ error: error.message });

    if (matches.length === 0) {
      return res.json({
        ...command,
        needsClarification: true,
        clarificationReason: `No saved contact named "${command.recipientName}". Add them first?`,
      });
    }
    if (matches.length > 1) {
      return res.json({
        ...command,
        needsClarification: true,
        clarificationReason: `Multiple contacts match "${command.recipientName}" — which one?`,
        candidates: matches,
      });
    }

    return res.json({ ...command, resolvedContact: matches[0] });
  }

  res.json(command);
});