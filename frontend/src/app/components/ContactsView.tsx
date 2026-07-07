import { useState } from "react";
import { Search, UserPlus, Send, Copy, ExternalLink } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Header } from "./Header";
import { AddContactModal } from "./AddContactModal";
import { addContact } from "../../lib/api";

const FF = "'DM Sans', sans-serif";

const CONTACTS = [
  { id: "1", initials: "MD", name: "Maria Dela Cruz", handle: "@mariadelacruz", address: "GBXYZ4NP2WQMZ7A3JKL2A4A2M", tag: "Frequent", tagColor: "#EC4899", tagBg: "rgba(236,72,153,0.1)", avatarColor: "#EC4899", avatarBg: "rgba(236,72,153,0.14)", lastSent: "2h ago" },
  { id: "2", initials: "MS", name: "Maria Santos", handle: "@mariasantos", address: "GDABC9K7PQRS2NV3M8WXY1ZA4B", tag: "Family", tagColor: "#F97316", tagBg: "rgba(249,115,22,0.1)", avatarColor: "#F97316", avatarBg: "rgba(249,115,22,0.14)", lastSent: "1d ago" },
  { id: "3", initials: "JR", name: "Juan Reyes", handle: "@juanreyes", address: "GDABC9KLP3VNXQ8WM7Z9K7P2NR", tag: "Family", tagColor: "#4ADE80", tagBg: "rgba(34,197,94,0.1)", avatarColor: "#4ADE80", avatarBg: "rgba(34,197,94,0.1)", lastSent: "3d ago" },
  { id: "4", initials: "AC", name: "Ana Cruz", handle: "@anacruz", address: "GHABC3MN5PQRS7VW9XY1Z2AB4C", tag: "Work", tagColor: "#FCD34D", tagBg: "rgba(245,158,11,0.1)", avatarColor: "#FCD34D", avatarBg: "rgba(245,158,11,0.1)", lastSent: "2w ago" },
  { id: "5", initials: "PG", name: "Pedro Garcia", handle: "@pedrogarcia", address: "GIBCD4NO6QRST8WX1YZ3ABC5DE", tag: "Landlord", tagColor: "#C4B5FD", tagBg: "rgba(139,92,246,0.1)", avatarColor: "#C4B5FD", avatarBg: "rgba(139,92,246,0.1)", lastSent: "1mo ago" },
  { id: "6", initials: "LC", name: "Liza Corpuz", handle: "@lizacorpuz", address: "GJCDE5OP7RSTU9XY2ZA4BCD6EF", tag: "Friend", tagColor: "#60A5FA", tagBg: "rgba(37,99,235,0.12)", avatarColor: "#60A5FA", avatarBg: "rgba(37,99,235,0.12)", lastSent: "3mo ago" },
];

export function ContactsView() {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  const filtered = CONTACTS.filter(
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#090F1D" }}>
      <Header />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div>
          <div style={{ color: "#F0F6FF", fontSize: 18, fontWeight: 600, fontFamily: FF }}>Contacts</div>
          <div style={{ color: "#3A5070", fontSize: 12, fontFamily: FF, marginTop: 3 }}>{CONTACTS.length} saved on Stellar</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", width: 220 }}>
            <Search size={13} color="#4A6080" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, outline: "none", background: "transparent", border: "none", color: "#E2EEFF", fontSize: 13, fontFamily: FF }}
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
          <div key={col} style={{ color: "#2A3F5C", fontSize: 10, fontWeight: 700, fontFamily: FF, letterSpacing: "0.09em", textTransform: "uppercase" }}>
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
              background: hovered === c.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
              border: `1px solid ${hovered === c.id ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.04)"}`,
              transition: "all 150ms",
              cursor: "default",
            }}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: c.avatarBg, border: "1.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: c.avatarColor, fontSize: 12, fontWeight: 700, fontFamily: FF }}>{c.initials}</span>
              </div>
              <div>
                <div style={{ color: "#E2EEFF", fontSize: 13, fontWeight: 600, fontFamily: FF }}>{c.name}</div>
                <div style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}>{c.handle}</div>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#4A6080", fontSize: 11, fontFamily: "monospace", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.05)" }}>
                {c.address.slice(0, 8)}...{c.address.slice(-6)}
              </span>
              <button
                onClick={() => copy(c.id, c.address)}
                title="Copy"
                style={{ width: 24, height: 24, borderRadius: 6, background: copied === c.id ? "rgba(34,197,94,0.08)" : "transparent", border: copied === c.id ? "1px solid rgba(34,197,94,0.2)" : "1px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered === c.id ? 1 : 0, transition: "opacity 150ms" }}
              >
                <Copy size={11} color={copied === c.id ? "#4ADE80" : "#4A6080"} />
              </button>
              <a href="#" title="Explorer" style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered === c.id ? 1 : 0, transition: "opacity 150ms" }}>
                <ExternalLink size={11} color="#4A6080" />
              </a>
            </div>

            {/* Tag */}
            <div>
              {c.tag ? (
                <span style={{ padding: "3px 10px", borderRadius: 20, background: c.tagBg, color: c.tagColor, fontSize: 11, fontWeight: 500, fontFamily: FF }}>
                  {c.tag}
                </span>
              ) : (
                <span style={{ color: "#1A2B40", fontSize: 12, fontFamily: FF }}>—</span>
              )}
            </div>

            {/* Last sent */}
            <div style={{ color: "#4A6080", fontSize: 12, fontFamily: FF }}>{c.lastSent}</div>

            {/* Send */}
            <div style={{ display: "flex", justifyContent: "flex-end", opacity: hovered === c.id ? 1 : 0, transition: "opacity 150ms" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "#2563EB", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: FF }}>
                <Send size={11} color="#fff" />
                Send
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Search size={22} color="#2A3F5C" />
            </div>
            <div style={{ color: "#E2EEFF", fontSize: 15, fontWeight: 600, fontFamily: FF }}>No contacts found</div>
            <div style={{ color: "#2A3F5C", fontSize: 13, fontFamily: FF }}>Try a different search term.</div>
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
              } catch (e: any) {
                console.error("Failed to save contact:", e.message);
                // NOTE: the display list above (CONTACTS) is still static
                // demo data — swap it for a real fetch via getContacts()
                // once you're ready to replace the hardcoded array with
                // live data (needs Stellar addresses to be valid 56-char
                // keys, since the backend validates that).
              }
              setShowAddContact(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
