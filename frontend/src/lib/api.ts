const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function getToken(): string | null {
  return localStorage.getItem("rani_token");
}

function setToken(token: string) {
  localStorage.setItem("rani_token", token);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────
export async function connectFreighter(email: string, publicKey: string) {
  const data = await request<{
    token: string;
    userId: string;
    stellarPublicKey: string;
    name: string | null;
    email: string | null;
    language: string | null;
  }>(
    "/auth/connect-freighter",
    { method: "POST", body: JSON.stringify({ email, publicKey }) }
  );
  setToken(data.token);
  return data;
}

export async function saveName(name: string) {
  return request<{ name: string }>("/auth/name", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function saveEmail(email: string) {
  return request<{ email: string }>("/auth/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export async function saveLanguage(language: string) {
  return request<{ language: string }>("/auth/language", {
    method: "PATCH",
    body: JSON.stringify({ language }),
  });
}

export function logout() {
  localStorage.removeItem("rani_token");
}

export function isLoggedIn() {
  return !!getToken();
}

// ── Contacts ──────────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  address: string;
  tag?: string | null;
}

export const getContacts = () => request<Contact[]>("/contacts");

export const addContact = (data: { name: string; address: string; tag?: string }) =>
  request<Contact>("/contacts", { method: "POST", body: JSON.stringify(data) });

export const deleteContact = (id: string) =>
  request<void>(`/contacts/${id}`, { method: "DELETE" });

// ── Parse (NLP) ───────────────────────────────────────────────────
export interface ParsedCommand {
  intent: string;
  recipientName?: string;
  amount?: string;
  currency?: string;
  memo?: string;
  needsClarification: boolean;
  clarificationReason?: string;
  resolvedContact?: Contact;
  candidates?: Contact[];
}

export const parseCommand = (text: string) =>
  request<ParsedCommand>("/parse", { method: "POST", body: JSON.stringify({ text }) });

// ── Transactions ──────────────────────────────────────────────────
export const getBalance = () => request<{ xlm: string; usdc: string }>("/transactions/balance");

export const simulatePayment = (data: {
  destinationAssetCode: string;
  destinationAssetIssuer?: string;
  destinationAmount: string;
}) => request<{ sourceAmount: string; destinationAmount: string; path: string[] }>(
  "/transactions/simulate",
  { method: "POST", body: JSON.stringify(data) }
);

export const buildTransaction = (data: {
  contactId: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
}) => request<{ transactionId: string; xdr: string }>(
  "/transactions/build",
  { method: "POST", body: JSON.stringify(data) }
);

export const submitTransaction = (data: { transactionId: string; signedXdr: string }) =>
  request<{ id: string; status: string; stellarTxHash: string }>(
    "/transactions/submit",
    { method: "POST", body: JSON.stringify(data) }
  );

export const getHistory = () => request<any[]>("/transactions/history");
