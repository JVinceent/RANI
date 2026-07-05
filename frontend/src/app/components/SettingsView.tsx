import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  AlertTriangle,
  LogOut,
  Lock,
  ChevronRight,
  Bell,
  Eye,
} from "lucide-react";
import { Header } from "./Header";

const FF = "'DM Sans', sans-serif";

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */

export function SettingsView() {
  const [requireConfirm, setRequireConfirm] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(true);
  const [limitAmount, setLimitAmount] = useState("5,000.00");
  const [biometrics, setBiometrics] = useState(false);
  const [hoverDisconnect, setHoverDisconnect] = useState(false);
  const [limitFocused, setLimitFocused] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#090F1D",
      }}
    >
      <Header />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px 40px",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 28, maxWidth: 660 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={17} color="#60A5FA" />
            </div>
            <div
              style={{
                color: "#F0F6FF",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.02em",
              }}
            >
              Security &amp; Limits
            </div>
          </div>
          <p
            style={{
              color: "#3A5070",
              fontSize: 13,
              fontFamily: FF,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Manage transaction guardrails, spending limits, and security
            preferences.
          </p>
        </div>

        <div style={{ maxWidth: 660, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Section 1: Transaction Security ──────────────────── */}
          <SettingsSection
            label="Transaction Security"
            icon={<Lock size={13} color="#60A5FA" />}
          >
            <SettingRow
              title="Require explicit confirmation for all transactions"
              description="Every payment will require a manual review step before processing."
              toggle={
                <Toggle
                  enabled={requireConfirm}
                  onToggle={() => setRequireConfirm((v) => !v)}
                />
              }
            />

            <Divider />

            <SettingRow
              title="Biometric authentication"
              description="Use Face ID or fingerprint to authorize each payment."
              toggle={
                <Toggle
                  enabled={biometrics}
                  onToggle={() => setBiometrics((v) => !v)}
                />
              }
            />
          </SettingsSection>

          {/* ── Section 2: Spending Limits ───────────────────────── */}
          <SettingsSection
            label="Spending Limits"
            icon={<Eye size={13} color="#60A5FA" />}
          >
            <SettingRow
              title="Enable daily spending limit"
              description="Transactions exceeding the daily threshold will be automatically blocked."
              toggle={
                <Toggle
                  enabled={dailyLimit}
                  onToggle={() => setDailyLimit((v) => !v)}
                />
              }
            />

            {/* Conditional limit input */}
            <AnimatePresence>
              {dailyLimit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding: "0 24px 22px",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      marginTop: 4,
                      paddingTop: 18,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        color: "#4A6080",
                        fontSize: 11,
                        fontFamily: FF,
                        fontWeight: 700,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      Daily Limit
                    </label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 13,
                        padding: "14px 18px",
                        background: "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${
                          limitFocused
                            ? "rgba(37,99,235,0.45)"
                            : "rgba(255,255,255,0.1)"
                        }`,
                        transition: "border-color 150ms",
                      }}
                    >
                      <span
                        style={{
                          color: "#60A5FA",
                          fontSize: 18,
                          fontFamily: FF,
                          fontWeight: 700,
                          marginRight: 8,
                        }}
                      >
                        ₱
                      </span>
                      <input
                        type="text"
                        value={limitAmount}
                        onChange={(e) => setLimitAmount(e.target.value)}
                        onFocus={() => setLimitFocused(true)}
                        onBlur={() => setLimitFocused(false)}
                        style={{
                          flex: 1,
                          outline: "none",
                          background: "transparent",
                          border: "none",
                          color: "#F0F6FF",
                          fontSize: 20,
                          fontWeight: 600,
                          fontFamily: FF,
                        }}
                      />
                      <span
                        style={{
                          color: "#3A5070",
                          fontSize: 12,
                          fontFamily: FF,
                          flexShrink: 0,
                        }}
                      >
                        PHP / day
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#2A3F5C",
                        fontSize: 12,
                        fontFamily: FF,
                        margin: "8px 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      Transactions that would push you over ₱{limitAmount} will
                      be blocked and require your explicit override.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SettingsSection>

          {/* ── Section 3: Notifications ─────────────────────────── */}
          <SettingsSection
            label="Notifications"
            icon={<Bell size={13} color="#60A5FA" />}
          >
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background 150ms",
                borderRadius: 8,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#E2EEFF",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: FF,
                    marginBottom: 2,
                  }}
                >
                  Transaction alerts
                </div>
                <div
                  style={{
                    color: "#4A6080",
                    fontSize: 12,
                    fontFamily: FF,
                  }}
                >
                  Receive a push notification for every payment
                </div>
              </div>
              <ChevronRight size={16} color="#3A5070" />
            </div>
          </SettingsSection>

          {/* ── Danger Zone ──────────────────────────────────────── */}
          <div
            style={{
              padding: "22px 24px",
              background: "rgba(239,68,68,0.03)",
              border: "1px solid rgba(239,68,68,0.14)",
              borderRadius: 18,
            }}
          >
            {/* Label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 10,
              }}
            >
              <AlertTriangle size={14} color="#F87171" />
              <span
                style={{
                  color: "#F87171",
                  fontSize: 11,
                  fontFamily: FF,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                }}
              >
                Danger Zone
              </span>
            </div>

            <p
              style={{
                color: "#4A6080",
                fontSize: 13,
                fontFamily: FF,
                margin: "0 0 18px",
                lineHeight: 1.55,
                maxWidth: 520,
              }}
            >
              Disconnecting will end your wallet session and clear all local
              data. You will need to reconnect via SEP-10 to use Rani again.
            </p>

            {/* Disconnect button */}
            <button
              onMouseEnter={() => setHoverDisconnect(true)}
              onMouseLeave={() => setHoverDisconnect(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "11px 22px",
                borderRadius: 11,
                background: hoverDisconnect
                  ? "rgba(239,68,68,0.1)"
                  : "transparent",
                border: "1.5px solid rgba(239,68,68,0.5)",
                cursor: "pointer",
                color: "#F87171",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: FF,
                transition: "background 150ms",
              }}
            >
              <LogOut size={15} color="#F87171" />
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOGGLE SWITCH
═══════════════════════════════════════════════════════════════════ */

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "relative",
        width: 52,
        height: 28,
        borderRadius: 14,
        background: enabled ? "#2563EB" : "rgba(255,255,255,0.09)",
        border: enabled
          ? "1px solid rgba(37,99,235,0.6)"
          : "1px solid rgba(255,255,255,0.14)",
        cursor: "pointer",
        transition: "background 220ms, border-color 220ms",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 5px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

import type { ReactNode } from "react";

function SettingsSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "12px 24px",
          background: "rgba(37,99,235,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        {icon}
        <span
          style={{
            color: "#4A6080",
            fontSize: 11,
            fontFamily: FF,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function SettingRow({
  title,
  description,
  toggle,
}: {
  title: string;
  description: string;
  toggle: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "#E2EEFF",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FF,
            marginBottom: 5,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#4A6080",
            fontSize: 13,
            fontFamily: FF,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
      {toggle}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(255,255,255,0.05)",
        margin: "0 24px",
      }}
    />
  );
}
