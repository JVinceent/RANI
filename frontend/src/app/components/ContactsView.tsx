import React, { useState } from "react";
import { Search, UserPlus, Send, Copy, ExternalLink } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Header } from "./Header";
import { AddContactModal } from "./AddContactModal";
import { addContact } from "../../lib/api";

const FF = "'DM Sans', sans-serif";

const CONTACTS = [
  { id: "1", initials: "MD", name: "Maria Dela Cruz", handle: "@mariadelacruz", address: "GBXYZ4NP2WQMZ7A3JKL2A4A2M", tag: "Frequent", tagColor: "#EC4899", tagBg: "rgba(236,72,153,0.15)", avatarColor: "#EC4899", avatarBg: "rgba(236,72,153,0.15)", lastSent: "2h ago" },
  { id: "2", initials: "MS", name: "Maria Santos", handle: "@mariasantos", address: "GDABC9K7PQRS2NV3M8WXY1ZA4B", tag: "Family", tagColor: "#F97316", tagBg: "rgba(249,115,22,0.15)", avatarColor: "#F97316", avatarBg: "rgba(249,115,22,0.15)", lastSent: "1d ago" },
  { id: "3", initials: "JR", name: "Juan Reyes", handle: "@juanreyes", address: "GDABC9KLP3VNXQ8WM7Z9K7P2NR", tag: "Family", tagColor: "#4ADE80", tagBg: "rgba(34,197,94,0.15)", avatarColor: "#4ADE80", avatarBg: "rgba(34,197,94,0.15)", lastSent: "3d ago" },
  { id: "4", initials: "AC", name: "Ana Cruz", handle: "@anacruz", address: "GHABC3MN5PQRS7VW9XY1Z2AB4C", tag: "Work", tagColor: "#FCD34D", tagBg: "rgba(245,158,11,0.15)", avatarColor: "#FCD34D", avatarBg: "rgba(245,158,11,0.15)", lastSent: "2w ago" },
  { id: "5", initials: "PG", name: "Pedro Garcia", handle: "@pedrogarcia", address: "GIBCD4NO6QRST8WX1YZ3ABC5DE", tag: "Landlord", tagColor: "#A78BFA", tagBg: "rgba(139,92,246,0.15)", avatarColor: "#A78BFA", avatarBg: "rgba(139,92,246,0.15)", lastSent: "1mo ago" },
  { id: "6", initials: "LC", name: "Liza Corpuz", handle: "@lizacorpuz", address: "GJCDE5OP7RSTU9XY2ZA4BCD6EF", tag: "Friend", tagColor: "#60A5FA", tagBg: "rgba(37,99,235,0.15)", avatarColor: "#60A5FA", avatarBg: "rgba(37,99,235,0.15)", lastSent: "3mo ago" },
];

export function ContactsView() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(CONTACTS[0].id);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  const filtered = CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = CONTACTS.find(c => c.id === selectedId) || CONTACTS[0];

  const copy = (id: string, addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--background)", color: "var(--foreground)", transition: "background-color 0.3s ease" }}>
      <Header />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* LEFT PANE: Master List */}
        <div style={{ width: 340, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, backgroundColor: "var(--card)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 600, fontFamily: FF }}>Contacts</div>
              <button onClick={() => setShowAddContact(true)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#2563EB", display: "flex", alignItems: "center" }}>
                <UserPlus size={20} />
              </button>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "8px 12px", background: "var(--muted)", border: "1px solid var(--border)" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, outline: "none", background: "transparent", border: "none", color: "var(--foreground)", fontSize: 14, fontFamily: FF }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  backgroundColor: selectedId === c.id ? "var(--muted)" : "transparent",
                  border: selectedId === c.id ? "1px solid var(--border)" : "1px solid transparent",
                  transition: "all 150ms",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: c.avatarColor, fontSize: 14, fontWeight: 700 }}>{c.initials}</span>
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", color: "var(--foreground)" }}>{c.name}</div>
                  <div style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{c.tag || "No Tag"}</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
                No contacts found.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Detail View */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: "var(--background)" }}>
          {filtered.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 400, width: "100%" }}>
              
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: selectedContact.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: `2px solid ${selectedContact.tagBg}` }}>
                <span style={{ color: selectedContact.avatarColor, fontSize: 36, fontWeight: 700 }}>{selectedContact.initials}</span>
              </div>
              
              <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px 0", color: "var(--foreground)" }}>{selectedContact.name}</h2>
              <p style={{ color: "var(--muted-foreground)", margin: "0 0 24px 0", fontSize: 15 }}>{selectedContact.handle}</p>

              <div style={{ width: "100%", backgroundColor: "var(--card)", borderRadius: 16, padding: "20px", marginBottom: 32, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
                  <span style={{ color: "var(--muted-foreground)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Group Tag</span>
                  <span style={{ padding: "4px 12px", borderRadius: 20, background: selectedContact.tagBg, color: selectedContact.tagColor, fontSize: 12, fontWeight: 600 }}>{selectedContact.tag}</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ color: "var(--muted-foreground)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Stellar Address</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--muted)", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, fontFamily: "monospace", color: "var(--foreground)" }}>
                      {selectedContact.address.slice(0, 10)}...{selectedContact.address.slice(-8)}
                    </span>
                    <button onClick={() => copy(selectedContact.id, selectedContact.address)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}>
                      <Copy size={16} color={copied === selectedContact.id ? "#4ADE80" : "var(--muted-foreground)"} />
                    </button>
                  </div>
                </div>
              </div>

              <button style={{ width: "100%", padding: "16px", borderRadius: 12, background: "#2563EB", border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 150ms" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")} onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}>
                <Send size={16} />
                Send Payment
              </button>
            </div>
          ) : (
             <div style={{ color: "var(--muted-foreground)", fontSize: 16 }}>No contact selected</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddContact && (
          <AddContactModal
            onClose={() => setShowAddContact(false)}
            onSave={async (data) => {
              try {
                await addContact(data);
              } catch (e: any) {
                console.error("Failed to save contact:", e.message);
              }
              setShowAddContact(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}