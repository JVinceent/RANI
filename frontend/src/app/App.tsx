import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthView } from "./components/AuthView";
import { OnboardingView } from "./components/OnboardingView";
import { Sidebar, type AppView } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { ContactsView } from "./components/ContactsView";
import { HistoryView } from "./components/HistoryView";
import { VoiceListeningView } from "./components/VoiceListeningView";
import { FullSettingsView } from "./components/FullSettingsView";
import { useWallet } from "../hooks/useWallet";
import { connectFreighter, saveName } from "../lib/api";

const FF = "'DM Sans', sans-serif";

type AppScreen = "auth" | "onboarding" | "main";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("auth");
  const [activeView, setActiveView] = useState<AppView>("chat");
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { connect, connecting } = useWallet();
  const [messages, setMessages] = useState<{ id: number; sender: "user" | "rani"; text: string }[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleConnect = async () => {
    setAuthError(null);

    try {
      const publicKey = await connect();

      let walletPublicKey = publicKey;
      if (!walletPublicKey) {
        const fallbackId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        walletPublicKey = `demo-wallet-${fallbackId}`;
      }

      const data = await connectFreighter(`${walletPublicKey.slice(0, 12).toLowerCase()}@rani.local`, walletPublicKey);

      if (data.name) {
        setUserName(data.name);
        setScreen("main");
      } else {
        setScreen("onboarding");
      }
    } catch (e: any) {
      setAuthError(e.message ?? "Could not reach the backend.");
    }
  };

  /* ── Auth frame ── */
  if (screen === "auth") {
    return (
      <>
        <AuthView onConnect={handleConnect} />
        {connecting && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "#fff", background: "#1D4ED8", padding: "8px 16px", borderRadius: 8, fontFamily: FF }}>
            Connecting to Freighter…
          </div>
        )}
        {authError && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "#fff", background: "#DC2626", padding: "8px 16px", borderRadius: 8, fontFamily: FF }}>
            {authError}
          </div>
        )}
      </>
    );
  }

  /* ── Onboarding frame ── */
  if (screen === "onboarding") {
    return (
      <OnboardingView
        onContinue={async (name) => {
          try {
            await saveName(name);
          } catch {
            // non-fatal — proceed even if saving the name fails
          }
          setUserName(name);
          setScreen("main");
        }}
      />
    );
  }

  /* ── Main app ── */
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: FF,
        overflow: "hidden",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100%",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          {activeView === "chat" && (
            <PageTransition key="chat">
              <ChatView 
                userName={userName ?? "there"} 
                onMicClick={() => setActiveView("voice")} 
              />
            </PageTransition>
          )}
          {activeView === "contacts" && (
            <PageTransition key="contacts">
              <ContactsView />
            </PageTransition>
          )}
          {activeView === "history" && (
            <PageTransition key="history">
              <HistoryView />
            </PageTransition>
          )}
          {activeView === "voice" && (
            <PageTransition key="voice">
              <VoiceListeningView 
                onCancel={() => setActiveView("chat")} 
                onSuccess={(userText, aiText) => {
                  console.log("SUCCESS CALLBACK REACHED");
                  setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", text: userText }]);
                  setTimeout(() => {
                    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", text: aiText }]);
                    setActiveView("chat");
                  }, 500);
                }} 
              />
            </PageTransition>
          )}
          {activeView === "settings" && (
            <PageTransition key="settings">
              <FullSettingsView defaultTab="profile" />
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Reusable Page Transition Wrapper ── */
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ 
        height: "100%", 
        width: "100%", 
        display: "flex", 
        flexDirection: "column" 
      }}
    >
      {children}
    </motion.div>
  );
}