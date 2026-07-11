// Local (per-browser) storage for chat conversations — save many, reopen any,
// start new. Kept in localStorage so it survives reloads without a backend.

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  updatedAt: number;
}

const KEY = "rani_conversations_v1";

function read(): Conversation[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function write(list: Conversation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

/** Most-recently-updated first. */
export function listConversations(): Conversation[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | null {
  return read().find((c) => c.id === id) ?? null;
}

export function upsertConversation(conv: Conversation) {
  const list = read();
  const i = list.findIndex((c) => c.id === conv.id);
  if (i >= 0) list[i] = conv;
  else list.push(conv);
  write(list);
}

export function deleteConversation(id: string) {
  write(read().filter((c) => c.id !== id));
}

/** Title from the first user message, truncated. */
export function titleFrom(messages: StoredMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const t = (firstUser?.text ?? "").trim();
  if (!t) return "New conversation";
  return t.length > 42 ? t.slice(0, 42) + "…" : t;
}

export function newConversationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** "2:45 PM" / "Yesterday" / "Jul 4" — compact relative label for the list. */
export function relativeLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
