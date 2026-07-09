import { useState } from "react";
import { ArrowDownLeft, Shield, CheckCircle, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const FF = "'DM Sans', sans-serif";

interface Notification {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  titleKey: "notif.paymentReceivedTitle" | "notif.securityAlertTitle" | "notif.txSettledTitle";
  bodyKey: "notif.paymentReceivedBody" | "notif.securityAlertBody" | "notif.txSettledBody";
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: ArrowDownLeft,
    iconBg: "rgba(34,197,94,0.14)",
    iconColor: "#4ADE80",
    titleKey: "notif.paymentReceivedTitle",
    bodyKey: "notif.paymentReceivedBody",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    icon: Shield,
    iconBg: "rgba(245,158,11,0.14)",
    iconColor: "#F59E0B",
    titleKey: "notif.securityAlertTitle",
    bodyKey: "notif.securityAlertBody",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    icon: CheckCircle,
    iconBg: "rgba(37,99,235,0.14)",
    iconColor: "#60A5FA",
    titleKey: "notif.txSettledTitle",
    bodyKey: "notif.txSettledBody",
    time: "Just now",
    unread: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   DROPDOWN PANEL  – fixed-position, anchored to sidebar bell
═══════════════════════════════════════════════════════════════════ */

interface NotificationsDropdownProps {
  onClose: () => void;
  onMarkAllRead?: () => void;
}

export function NotificationsDropdown({
  onClose,
  onMarkAllRead,
}: NotificationsDropdownProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    onMarkAllRead?.();
  };

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: 76,
        bottom: 80,
        width: 388,
        zIndex: 50,
        borderRadius: 18,
        background: "rgba(9, 19, 38, 0.97)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(37,99,235,0.06)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              color: "#F0F6FF",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: FF,
            }}
          >
            {t("notifDropdown.title")}
          </div>
          {unreadCount > 0 && (
            <div
              style={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                background: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: FF,
                }}
              >
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={markAllRead}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2563EB",
              fontSize: 12,
              fontFamily: FF,
              fontWeight: 500,
              padding: 0,
              whiteSpace: "nowrap",
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
          >
            {t("notifDropdown.markAllRead")}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} color="#4A6080" />
          </button>
        </div>
      </div>

      {/* ── Notification items ── */}
      <div>
        {items.map((notif, i) => {
          const Icon = notif.icon;
          return (
            <motion.div
              key={notif.id}
              whileHover={{ background: "rgba(255,255,255,0.03)" }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 20px",
                borderBottom:
                  i < items.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
                cursor: "pointer",
              }}
              onClick={() =>
                setItems((prev) =>
                  prev.map((n) =>
                    n.id === notif.id ? { ...n, unread: false } : n
                  )
                )
              }
            >
              {/* Unread dot */}
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: notif.unread ? "#2563EB" : "transparent",
                  flexShrink: 0,
                  marginTop: 5,
                  boxShadow: notif.unread
                    ? "0 0 6px rgba(37,99,235,0.55)"
                    : "none",
                  transition: "background 200ms",
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: notif.iconBg,
                  border: `1px solid ${notif.iconColor}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} color={notif.iconColor} strokeWidth={2} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#7B92B0",
                    fontSize: 11,
                    fontFamily: FF,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  {t(notif.titleKey)}
                </div>
                <div
                  style={{
                    color: notif.unread ? "#E2EEFF" : "#7B92B0",
                    fontSize: 13,
                    fontFamily: FF,
                    fontWeight: notif.unread ? 500 : 400,
                    lineHeight: 1.4,
                    marginBottom: 5,
                    transition: "color 200ms",
                  }}
                >
                  {t(notif.bodyKey)}
                </div>
                <div
                  style={{
                    color: "#3A5070",
                    fontSize: 11,
                    fontFamily: FF,
                  }}
                >
                  {notif.time}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#4A6080",
            fontSize: 12,
            fontFamily: FF,
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#7B92B0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4A6080")}
        >
          {t("notifDropdown.viewAll")}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BELL BUTTON  – self-contained with dropdown wired in
═══════════════════════════════════════════════════════════════════ */

export function NotificationBell({
  onAvatarClick,
}: {
  onAvatarClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const UNREAD = 3;

  return (
    <>
      {/* Transparent backdrop (click-away) */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 39,
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: open
                ? "rgba(37,99,235,0.14)"
                : "rgba(255,255,255,0.05)",
              border: open
                ? "1px solid rgba(37,99,235,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms",
            }}
          >
            <Bell size={16} color={open ? "#60A5FA" : "#7B92B0"} strokeWidth={1.8} />
          </button>

          {/* Badge */}
          {UNREAD > 0 && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#EF4444",
                border: "2px solid #090F1D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: FF,
                }}
              >
                {UNREAD}
              </span>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button
          onClick={onAvatarClick}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1E40AF, #2563EB)",
            border: "2px solid rgba(59,130,246,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "border-color 150ms",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(96,165,250,0.6)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(59,130,246,0.35)")
          }
        >
          <span
            style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: FF }}
          >
            R
          </span>
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <NotificationsDropdown onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}