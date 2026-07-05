import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const contactsRouter = Router();
contactsRouter.use(requireAuth);

contactsRouter.get("/", async (req: AuthedRequest, res) => {
  const contacts = await prisma.contact.findMany({ where: { userId: req.userId! } });
  res.json(contacts);
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

  const contact = await prisma.contact.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.status(201).json(contact);
});

contactsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  await prisma.contact.deleteMany({ where: { id: req.params.id, userId: req.userId! } });
  res.status(204).send();
});

/**
 * Local, per-user fuzzy name resolution — never a global directory.
 * Returns multiple matches if ambiguous, so /parse can trigger a
 * clarifying question instead of guessing.
 */
contactsRouter.get("/resolve", async (req: AuthedRequest, res) => {
  const name = String(req.query.name ?? "").toLowerCase();
  const contacts = await prisma.contact.findMany({ where: { userId: req.userId! } });
  const matches = contacts.filter((c: { name: string }) => c.name.toLowerCase().includes(name));
  res.json({ matches, ambiguous: matches.length > 1 });
});
