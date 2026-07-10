import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Search, Filter, ExternalLink, Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Header } from "./Header";
import { HistoryFilterDropdown } from "./HistoryFilterDropdown";
import { getHistory } from "../../lib/api";

const FF = "'DM Sans', sans-serif";

type TxKind = "sent" | "received" | "swap";

// Shape of a row from GET /transactions/history (with embedded contact).
interface ApiTx {
  id: string;
  amount: string | number;
  asset_code: string | null;
  memo: string | null;
  status: string;
  stellar_tx_hash: string | null;
  created_at: string;
  contact?: { name?: string | null; address?: string | null } | null;
}

interface Row {
  id: string;
  date: string;
  kind: TxKind;
  name: string;
  initials: string;
  avatarColor: string;
  avatarBg: string;
  amount: number;
  asset: string;
  memo: string;
  status: string;
  hash: string | null;
}

// Deterministic avatar color from a string, so the same contact always looks the same.
const AVATARS = [
  { color: "#EC4899", bg: "rgba(236,72,153,0.14)" },
  { color: "#4ADE80", bg: "rgba(34,197,94,0.10)" },
  { color: "#38BDF8", bg: "rgba(14,165,233,0.10)" },
  { color: "#FCD34D", bg: "rgba(245,158,11,0.10)" },
  { color: "#C4B5FD", bg: "rgba(139,92,246,0.10)" },
  { color: "#F97316", bg: "rgba(249,115,22,0.14)" },
];
function avatarFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}
function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function shortKey(addr?: string | null) {
  if (!addr) return "Unknown";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Map DB status → a display label + color the eye can scan.
function statusMeta(status: string): { label: string; color: string } {
  switch (status) {
    case "SUCCESS":
      return { label: "Settled", color: "#22C55E" };
    case "FAILED":
      return { label: "Failed", color: "#F87171" };
    default:
      // PENDING / BUILDING / AWAITING_SIGNATURE / SUBMITTING / POLLING
      return { label: "Pending", color: "#FBBF24" };
  }
}

function toRow(t: ApiTx): Row {
  const isSwap = (t.memo ?? "").toLowerCase().startsWith("swap");
  const name = isSwap
    ? (t.memo || "Swap")
    : (t.contact?.name ?? shortKey(t.contact?.address));
  const av = avatarFor(name || t.id);
  return {
    id: t.id,
    date: fmtDate(t.created_at),
    kind: isSwap ? "swap" : "sent",
    name,
    initials: isSwap ? "⇄" : initialsFrom(name),
    avatarColor: av.color,
    avatarBg: av.bg,
    amount: Math.abs(parseFloat(String(t.amount)) || 0),
    asset: t.asset_code || "XLM",
    memo: t.memo || "",
    status: t.status,
    hash: t.stellar_tx_hash,
  };
}

export function HistoryView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await getHistory()) as ApiTx[];
        if (!cancelled) setRows(data.map(toRow));
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Could not load transactions");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = rows ?? [];
    const q = search.toLowerCase();
    return list.filter((t) => t.name.toLowerCase().includes(q) || t.memo.toLowerCase().includes(q));
  }, [rows, search]);

  const stats = useMemo(() => {
    const list = rows ?? [];
    const settled = list.filter((t) => t.status === "SUCCESS").length;
    const pending = list.filter((t) => t.status !== "SUCCESS" && t.status !== "FAILED").length;
    return { total: list.length, settled, pending };
  }, [rows]);

  const loading = rows === null && !error;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--background)", color: "var(--foreground)", transition: "background-color 0.3s ease, color 0.3s ease" }}>
      <Header />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 18, fontWeight: 600, fontFamily: FF }}>Transaction History</div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, marginTop: 3 }}>
            {loading ? "Loading…" : `${stats.total} transaction${stats.total === 1 ? "" : "s"} · On-chain`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "8px 12px", background: "var(--muted)", border: "1px solid var(--border)", width: 210 }}>
            <Search size={13} color="var(--muted-foreground)" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, outline: "none", background: "transparent", border: "none", color: "var(--foreground)", fontSize: 13, fontFamily: FF }}
            />
          </div>
          <div style={{ position: "relative" }}>
            {showFilter && (
              <div style={{ position: "fixed", inset: 0, zIndex: 39 }} onClick={() => setShowFilter(false)} />
            )}
            <button
              onClick={() => setShowFilter((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 10, padding: "8px 12px",
                background: showFilter ? "rgba(37,99,235,0.12)" : "var(--muted)",
                border: showFilter ? "1px solid rgba(37,99,235,0.3)" : "1px solid var(--border)",
                cursor: "pointer",
                color: showFilter ? "#60A5FA" : "var(--muted-foreground)",
                fontSize: 13, fontFamily: FF, transition: "all 150ms",
              }}
            >
              <Filter size={13} color={showFilter ? "#60A5FA" : "var(--muted-foreground)"} />
              Filter
            </button>
            <AnimatePresence>
              {showFilter && <HistoryFilterDropdown onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 10, padding: "14px 28px", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
        {[
          { label: "Transactions", value: String(stats.total), color: "var(--foreground)" },
          { label: "Settled", value: String(stats.settled), color: "#4ADE80" },
          { label: "Pending", value: String(stats.pending), color: stats.pending > 0 ? "#FBBF24" : "var(--muted-foreground)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "10px 16px", borderRadius: 10, background: "var(--muted)", border: "1px solid var(--border)", minWidth: 136 }}>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ color, fontSize: 18, fontWeight: 700, fontFamily: FF, letterSpacing: "-0.01em" }}>{loading ? "—" : value}</div>
          </div>
        ))}
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "130px 1.8fr 120px 1fr 110px", padding: "10px 28px", flexShrink: 0 }}>
        {["Date", "Recipient", "Amount", "Memo", "Status"].map((col) => (
          <div key={col} style={{ color: "var(--muted-foreground)", fontSize: 10, fontWeight: 700, fontFamily: FF, letterSpacing: "0.09em", textTransform: "uppercase" }}>
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "60px 0", color: "var(--muted-foreground)", fontFamily: FF, fontSize: 13 }}>
            <Loader2 size={16} className="animate-spin" />
            Loading your transactions…
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted-foreground)", fontFamily: FF }}>
            <div style={{ fontSize: 14, color: "#F87171", marginBottom: 6 }}>Couldn't load history</div>
            <div style={{ fontSize: 12 }}>{error}</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--muted-foreground)", fontFamily: FF }}>
            <div style={{ fontSize: 15, color: "var(--foreground)", fontWeight: 600, marginBottom: 6 }}>
              {rows && rows.length > 0 ? "No matches" : "No transactions yet"}
            </div>
            <div style={{ fontSize: 13 }}>
              {rows && rows.length > 0
                ? "Try a different search."
                : "Send your first payment from the chat and it'll show up here."}
            </div>
          </div>
        )}

        {!loading && !error && filtered.map((tx) => {
          const st = statusMeta(tx.status);
          const explorer = tx.hash ? `https://stellar.expert/explorer/testnet/tx/${tx.hash}` : null;
          return (
            <div
              key={tx.id}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1.8fr 120px 1fr 110px",
                alignItems: "center",
                padding: "12px 8px",
                borderRadius: 12,
                background: hovered === tx.id ? "var(--muted)" : "transparent",
                border: `1px solid ${hovered === tx.id ? "rgba(37,99,235,0.15)" : "var(--border)"}`,
                transition: "all 150ms",
              }}
              onMouseEnter={() => setHovered(tx.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Date */}
              <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>{tx.date}</div>

              {/* Recipient */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: tx.avatarBg, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: tx.avatarColor, fontSize: 11, fontWeight: 700, fontFamily: FF }}>{tx.initials}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: tx.kind === "swap" ? "rgba(139,92,246,0.18)" : tx.kind === "received" ? "rgba(34,197,94,0.15)" : "rgba(37,99,235,0.15)", border: "1px solid var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {tx.kind === "swap"
                      ? <ArrowLeftRight size={7} color="#A78BFA" strokeWidth={2.5} />
                      : tx.kind === "received"
                        ? <ArrowDownLeft size={7} color="#4ADE80" strokeWidth={2.5} />
                        : <ArrowUpRight size={7} color="#60A5FA" strokeWidth={2.5} />}
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 500, fontFamily: FF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.name}</div>
                  <div style={{ color: "var(--muted-foreground)", fontSize: 10, fontFamily: FF }}>{tx.kind === "swap" ? "swap · Stellar" : "to · Stellar"}</div>
                </div>
              </div>

              {/* Amount */}
              <div style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600, fontFamily: FF, fontVariantNumeric: "tabular-nums" }}>
                −{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 7 })} {tx.asset}
              </div>

              {/* Memo */}
              <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tx.memo || "—"}
              </div>

              {/* Status + explorer link */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.color, boxShadow: `0 0 6px ${st.color}80` }} />
                  <span style={{ color: st.color, fontSize: 12, fontFamily: FF, fontWeight: 500 }}>{st.label}</span>
                </span>
                {explorer && (
                  <a
                    href={explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Stellar Explorer"
                    style={{ display: "flex", alignItems: "center", color: "var(--muted-foreground)", opacity: hovered === tx.id ? 1 : 0.45, transition: "opacity 150ms" }}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
