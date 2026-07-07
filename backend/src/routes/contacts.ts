import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const contactsRouter = Router();
contactsRouter.use(requireAuth);

contactsRouter.get("/", async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", req.userId!);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Body shape matches AddContactModal's NewContactData { name, address, tag } exactly
const newContactSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(56).max(56), // Stellar public keys are always 56 chars
  tag: z.string().optional(),
});

contactsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = newContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...parsed.data, user_id: req.userId! })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

contactsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.userId!);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

/**
 * Local, per-user fuzzy name resolution — never a global directory.
 * Returns multiple matches if ambiguous, so /parse can trigger a
 * clarifying question instead of guessing.
 */
contactsRouter.get("/resolve", async (req: AuthedRequest, res) => {
  const name = String(req.query.name ?? "").toLowerCase();

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", req.userId!)
    .ilike("name", `%${name}%`); // case-insensitive partial match, done in the DB itself

  if (error) return res.status(500).json({ error: error.message });
  res.json({ matches: data, ambiguous: data.length > 1 });
});