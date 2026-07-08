import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, Send, Copy, ExternalLink, Clock, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./Header";
import { AddContactModal } from "./AddContactModal";
import { addContact, getContacts, getHistory, streamContacts, type Contact } from "../../lib/api";

const FF = "'DM Sans', sans-serif";

// Deterministic palette so the same contact always gets the same
// avatar/tag color across reloads, instead of it changing every fetch.
const PALETTE = [
  { color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
  { color: "#F97316", bg: "rgba(249,115,22,0.15)" },
  { color: "#4ADE80", bg: "rgba(34,197,94,0.15)" },
  { color: "#FCD34D", bg: "rgba(245,158,11,0.15)" },
  { color: "#A78BFA", bg: "rgba(139,92,246,0.15)" },
  { color: "#60A5FA", bg: "rgba(37,99,235,0.15)" },
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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

  // Live updates — Supabase realtime pushed through the backend SSE stream.
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

  // Keep a contact selected once the list loads, and fall back cleanly
  // if the selected one gets removed by a realtime DELETE event.
  useEffect(() => {
    if (contacts.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !contacts.some((c) => c.id === selectedId)) {
      setSelectedId(contacts[0].id);
    }
  }, [contacts, selectedId]);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = filtered.find((c) => c.id === selectedId) ?? filtered[0];

  const copy = (id: string, addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--background)", color: "var(--foreground)", transition: "background-color 0.3s ease, color 0.3s ease" }}>
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
            {loading && (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted-foreground)", fontSize: 13, fontFamily: FF }}>
                Loading contacts…
              </div>
            )}

            {error && !loading && (
              <div style={{ padding: 20, textAlign: "center", color: "#F87171", fontSize: 13, fontFamily: FF }}>
                {error}
              </div>
            )}

            {!loading && !error && filtered.map((c) => (
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

            {!loading && !error && filtered.length === 0 && (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
                No contacts found.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Detail View */}
        <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: "var(--background)" }}>
          {selectedContact ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedContact.id} /* tells framer-motion to animate when the contact changes */
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 400, width: "100%" }}
              >

                <div style={{ width: 100, height: 100, borderRadius: "50%", background: selectedContact.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: `2px solid ${selectedContact.tagBg}` }}>
                  <span style={{ color: selectedContact.avatarColor, fontSize: 36, fontWeight: 700 }}>{selectedContact.initials}</span>
                </div>

                <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px 0", color: "var(--foreground)" }}>{selectedContact.name}</h2>
                <p style={{ color: "var(--muted-foreground)", margin: "0 0 24px 0", fontSize: 15 }}>{selectedContact.handle}</p>

                <div style={{ width: "100%", backgroundColor: "var(--card)", borderRadius: 16, padding: "20px", marginBottom: 32, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
                    <span style={{ color: "var(--muted-foreground)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Group Tag</span>
                    {selectedContact.tag ? (
                      <span style={{ padding: "4px 12px", borderRadius: 20, background: selectedContact.tagBg, color: selectedContact.tagColor, fontSize: 12, fontWeight: 600 }}>{selectedContact.tag}</span>
                    ) : (
                      <span style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>—</span>
                    )}
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

                {/* ACTION BUTTONS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  <button style={{ width: "100%", padding: "16px", borderRadius: 12, background: "#2563EB", border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 150ms" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")} onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}>
                    <Send size={16} />
                    Send Payment
                  </button>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    style={{ width: "100%", padding: "16px", borderRadius: 12, background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 150ms" }}
                  >
                    <Clock size={16} />
                    View History
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div style={{ color: "var(--muted-foreground)", fontSize: 16, fontFamily: FF }}>
              {loading ? "Loading contacts…" : "No contact selected"}
            </div>
          )}

          {/* Contact History Modal */}
          <AnimatePresence>
            {showHistoryModal && selectedContact && (
              <ContactHistoryModal
                contactId={selectedContact.id}
                contactName={selectedContact.name}
                onClose={() => setShowHistoryModal(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Contact Modal stays fixed globally */}
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

/* ── Contact History Modal ── */
function ContactHistoryModal({ contactId, contactName, onClose }: { contactId: string; contactName: string; onClose: () => void }) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getHistory() returns the full transaction list (each row embeds its
    // related contact) — filter down to this contact client-side, since
    // the backend doesn't expose a per-contact history endpoint.
    getHistory()
      .then((data) => {
        const forContact = (data || []).filter((tx: any) => tx.contact?.id === contactId);
        setTxs(forContact);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [contactId]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose} />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "relative",
          background: "var(--card)",
          width: "100%",
          maxWidth: 500,
          maxHeight: "80vh",
          borderRadius: 24,
          zIndex: 51,
          boxShadow: "0 24px 50px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border)"
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: FF, color: "var(--foreground)" }}>History with {contactName}</h3>
          </div>
          <button onClick={onClose} style={{ background: "var(--muted)", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "40px 0", fontFamily: FF }}>Loading history...</div>
          ) : txs.length === 0 ? (
            <div style={{ color: "var(--muted-foreground)", textAlign: "center", padding: "40px 0", fontFamily: FF }}>No past transactions found.</div>
          ) : (
            txs.map((tx) => {
              const isOutgoing = String(tx.amount).startsWith("-");
              return (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--muted)", borderRadius: 16, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                      {isOutgoing ? <ArrowUpRight size={16} color="#60A5FA" /> : <ArrowDownLeft size={16} color="#4ADE80" />}
                    </div>
                    <div>
                      <div style={{ color: "var(--foreground)", fontSize: 14, fontWeight: 600, fontFamily: FF }}>{tx.memo || "No memo"}</div>
                      <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, marginTop: 2 }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: isOutgoing ? "var(--foreground)" : "#4ADE80", fontSize: 15, fontWeight: 700, fontFamily: FF }}>
                      {isOutgoing ? "" : "+"}₱{parseFloat(tx.amount).toLocaleString()}
                    </div>
                    <div style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: FF, textTransform: "uppercase", marginTop: 2 }}>{tx.status}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
