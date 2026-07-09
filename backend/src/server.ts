import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { contactsRouter } from "./routes/contacts";
import { parseRouter } from "./routes/parse";
import { transactionsRouter } from "./routes/transactions";
import voiceRoutes from './routes/voice';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/contacts", contactsRouter);
app.use("/parse", parseRouter);
app.use("/transactions", transactionsRouter);
app.use('/api/voice', voiceRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT ?? 4000;
app.listen(port, () => console.log(`Rani backend listening on :${port}`));
