import { useState } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  Settings,
  Wallet,
  Bell,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const FF = "'DM Sans', sans-serif";

export type AppView =
  | "chat"
  | "contacts"
  | "history"
  | "voice"
  | "settings";

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const PRIMARY_NAV: { id: AppView; icon: React.ElementType; label: string }[] = [
    { id: "chat", icon: MessageSquare, label: t("nav.chat") },
    { id: "contacts", icon: Users, label: t("nav.contacts") },
    { id: "history", icon: Clock, label: t("nav.history") },
    { id: "voice", icon: Mic, label: t("nav.voice") },
  ];
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // starting badge count

  const handleBellClick = () => setShowNotifications((v) => !v);
  const handleCloseNotifications = () => setShowNotifications(false);
  const handleMarkAllRead = () => setUnreadCount(0);
  
  return (
    <>
      {/* ── Sidebar column ── */}
      <aside
        style={{
          width: 68,
          background: "#060C18",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "18px 0 12px",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 5,
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <Wallet size={18} color="#fff" strokeWidth={2} />
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 9,
              letterSpacing: "0.12em",
              fontFamily: FF,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            RANI
          </span>
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.05)",
            margin: "0 12px 12px",
          }}
        />

        {/* Primary nav */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            flex: 1,
            padding: "0 8px",
          }}
        >
          {PRIMARY_NAV.map(({ id, icon: Icon, label }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                title={label}
                style={{
                  width: 52,
                  height: 50,
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  background: active ? "rgba(37,99,235,0.14)" : "transparent",
                  border: active
                    ? "1px solid rgba(37,99,235,0.24)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 150ms",
                  position: "relative",
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 2,
                      height: 20,
                      background: "#3B82F6",
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                )}
                <Icon
                  size={18}
                  color={active ? "#60A5FA" : "rgba(255,255,255,0.26)"}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span
                  style={{
                    color: active ? "#60A5FA" : "rgba(255,255,255,0.18)",
                    fontSize: 9,
                    fontFamily: FF,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom utilities */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "0 8px 16px",
          }}
        >
          {/* ── Bell  →  notifications overlay ── */}
          <div style={{ position: "relative" }}>
            <button
              onClick={handleBellClick}
              title="Notifications"
              style={{
                width: 52,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showNotifications
                  ? "rgba(37,99,235,0.14)"
                  : "transparent",
                border: showNotifications
                  ? "1px solid rgba(37,99,235,0.24)"
                  : "none",
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <Bell
                size={17}
                color={
                  showNotifications ? "#60A5FA" : "rgba(255,255,255,0.22)"
                }
                strokeWidth={showNotifications ? 2 : 1.5}
              />
            </button>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 5,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border: "2px solid #060C18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: FF,
                    lineHeight: 1,
                  }}
                >
                  {unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Settings — navigable */}
          <button
            onClick={() => onNavigate("settings")}
            title="Settings"
            style={{
              width: 52,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                activeView === "settings"
                  ? "rgba(37,99,235,0.14)"
                  : "transparent",
              border:
                activeView === "settings"
                  ? "1px solid rgba(37,99,235,0.22)"
                  : "none",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            <Settings
              size={17}
              color={
                activeView === "settings"
                  ? "#60A5FA"
                  : "rgba(255,255,255,0.22)"
              }
              strokeWidth={activeView === "settings" ? 2 : 1.5}
            />
          </button>

          {/* ── Avatar  →  Settings > Profile ── */}
          <button
            onClick={() => onNavigate("settings")}
            title="Profile & Settings"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1E40AF, #2563EB)",
              border:
                activeView === "settings"
                  ? "2px solid rgba(96,165,250,0.55)"
                  : "2px solid rgba(59,130,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
              cursor: "pointer",
              transition: "border-color 150ms, box-shadow 150ms",
              boxShadow:
                activeView === "settings"
                  ? "0 0 14px rgba(37,99,235,0.4)"
                  : "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(96,165,250,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                activeView === "settings"
                  ? "rgba(96,165,250,0.55)"
                  : "rgba(59,130,246,0.3)";
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: FF,
              }}
            >
              R
            </span>
          </button>
        </div>
      </aside>

      {/* ── Notifications overlay (fixed, outside sidebar flow) ── */}
      {showNotifications && (
        /* Transparent backdrop to dismiss on outside click */
        <div
          style={{ position: "fixed", inset: 0, zIndex: 49 }}
          onClick={handleCloseNotifications}
        />
      )}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsDropdown
            onClose={handleCloseNotifications}
            onMarkAllRead={handleMarkAllRead}
          />
        )}
      </AnimatePresence>
    </>
  );
}
