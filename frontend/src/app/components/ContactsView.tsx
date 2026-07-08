import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, Send, Copy, ExternalLink } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Header } from "./Header";
import { AddContactModal } from "./AddContactModal";
import { addContact, getContacts, streamContacts, type Contact } from "../../lib/api";


const FF = "'DM Sans', sans-serif";

// Deterministic palette so the same contact always gets the same
// avatar/tag color across reloads, instead of it changing every fetch.
const PALETTE = [
  { color: "#EC4899", bg: "rgba(236,72,153,0.1)" },
  { color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { color: "#4ADE80", bg: "rgba(34,197,94,0.1)" },
  { color: "#FCD34D", bg: "rgba(245,158,11,0.1)" },
  { color: "#C4B5FD", bg: "rgba(139,92,246,0.1)" },
  { color: "#60A5FA", bg: "rgba(37,99,235,0.12)" },
];

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// What the UI renders. Fields not in the DB (initials, colors, handle)
// are derived client-side from the real name/id — never stored.
interface DisplayContact {
  id: string;
  name: string;
  handle: string;
  address: string;
  tag?: string | null;
  initials: string;
  avatarColor: string;
  avatarBg: string;
  tagColor: string;
  tagBg: string;
  lastSent: string;
}

function toDisplay(c: Contact): DisplayContact {
  const palette = colorFor(c.id);
  return {
    id: c.id,
    name: c.name,
    handle: "@" + c.name.toLowerCase().replace(/\s+/g, ""),
    address: c.address,
    tag: c.tag,
    initials: initialsFor(c.name),
    avatarColor: palette.color,
    avatarBg: palette.bg,
    tagColor: palette.color,
    tagBg: palette.bg,
    lastSent: "—", // stub — needs a transactions join to be real
  };
}

export function ContactsView() {
  const [contacts, setContacts] = useState<DisplayContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts();
      setContacts(data.map(toDisplay));
    } catch (e: any) {
      setError(e.message ?? "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
  const unsubscribe = streamContacts((eventType, payload) => {
    setContacts((prev) => {
      if (eventType === "INSERT") {
        const incoming = toDisplay(payload.new as Contact);
        if (prev.some((c) => c.id === incoming.id)) return prev; // dedupe
        return [...prev, incoming];
      }
      if (eventType === "UPDATE") {
        const updated = toDisplay(payload.new as Contact);
        return prev.map((c) => (c.id === updated.id ? updated : c));
      }
      if (eventType === "DELETE") {
        return prev.filter((c) => c.id !== payload.old.id);
      }
      return prev;
    });
  });

  return unsubscribe;
}, []);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const copy = (id: string, addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--background)", color: "var(--foreground)", transition: "background-color 0.3s ease, color 0.3s ease" }}>
      <Header />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 18, fontWeight: 600, fontFamily: FF }}>Contacts</div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, marginTop: 3 }}>{contacts.length} saved on Stellar</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "8px 12px", background: "var(--muted)", border: "1px solid var(--border)", width: 220 }}>
            <Search size={13} color="var(--muted-foreground)" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, outline: "none", background: "transparent", border: "none", color: "var(--foreground)", fontSize: 13, fontFamily: FF }}
            />
          </div>
          <button
            onClick={() => setShowAddContact(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 10, padding: "9px 16px", background: "#2563EB", border: "none", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: FF, transition: "background 150ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
          >
            <UserPlus size={14} color="#fff" />
            Add New Contact
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 2.6fr 1fr 1fr 80px", padding: "10px 28px", flexShrink: 0 }}>
        {["Contact", "Stellar Address", "Tag", "Last Sent", ""].map((col) => (
          <div key={col} style={{ color: "var(--muted-foreground)", fontSize: 10, fontWeight: 700, fontFamily: FF, letterSpacing: "0.09em", textTransform: "uppercase" }}>
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((c) => (
          <div
            key={c.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2.6fr 1fr 1fr 80px",
              alignItems: "center",
              padding: "13px 8px",
              borderRadius: 12,
              background: hovered === c.id ? "var(--muted)" : "transparent",
              border: `1px solid ${hovered === c.id ? "rgba(37,99,235,0.18)" : "var(--border)"}`,
              transition: "all 150ms",
              cursor: "default",
            }}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.avatarBg, border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: c.avatarColor, fontSize: 12, fontWeight: 700, fontFamily: FF }}>{c.initials}</span>
              </div>
              <div>
                <div style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 600, fontFamily: FF }}>{c.name}</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: FF }}>{c.handle}</div>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: "monospace", background: "var(--muted)", padding: "2px 8px", borderRadius: 5, border: "1px solid var(--border)" }}>
                {c.address.slice(0, 8)}...{c.address.slice(-6)}
              </span>
              <button
                onClick={() => copy(c.id, c.address)}
                title="Copy"
                style={{ width: 24, height: 24, borderRadius: 6, background: copied === c.id ? "rgba(34,197,94,0.08)" : "transparent", border: copied === c.id ? "1px solid rgba(34,197,94,0.2)" : "1px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered === c.id ? 1 : 0, transition: "opacity 150ms" }}
              >
                <Copy size={11} color={copied === c.id ? "#4ADE80" : "var(--muted-foreground)"} />
              </button>
              <a href="#" title="Explorer" style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered === c.id ? 1 : 0, transition: "opacity 150ms" }}>
                <ExternalLink size={11} color="var(--muted-foreground)" />
              </a>
            </div>

            {/* Tag */}
            <div>
              {c.tag ? (
                <span style={{ padding: "3px 10px", borderRadius: 20, background: c.tagBg, color: c.tagColor, fontSize: 11, fontWeight: 500, fontFamily: FF }}>
                  {c.tag}
                </span>
              ) : (
                <span style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>—</span>
              )}
            </div>

            {/* Last sent */}
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>{c.lastSent}</div>

            {/* Send */}
            <div style={{ display: "flex", justifyContent: "flex-end", opacity: hovered === c.id ? 1 : 0, transition: "opacity 150ms" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "#2563EB", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: FF }}>
                <Send size={11} color="#fff" />
                Send
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ color: "var(--muted-foreground)", fontSize: 13, fontFamily: FF, padding: "40px 0", textAlign: "center" }}>
            Loading contacts…
          </div>
        )}

        {error && !loading && (
          <div style={{ color: "#F87171", fontSize: 13, fontFamily: FF, padding: "20px 0", textAlign: "center" }}>
            {error}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Search size={22} color="var(--muted-foreground)" />
            </div>
            <div style={{ color: "var(--foreground)", fontSize: 15, fontWeight: 600, fontFamily: FF }}>No contacts found</div>
            <div style={{ color: "var(--muted-foreground)", fontSize: 13, fontFamily: FF }}>Try a different search term.</div>
          </div>
        )}
      </div>

      {/* ── Add Contact Modal ── */}
      <AnimatePresence>
        {showAddContact && (
          <AddContactModal
            onClose={() => setShowAddContact(false)}
            onSave={async (data) => {
              try {
                await addContact(data);
                await loadContacts(); // refresh from DB so the new contact actually shows up
              } catch (e: any) {
                console.error("Failed to save contact:", e.message);
                setError(e.message ?? "Failed to save contact");
              }
              setShowAddContact(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}