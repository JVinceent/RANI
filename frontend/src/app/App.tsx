import { useState } from "react";
import { AuthView } from "./components/AuthView";
import { OnboardingView } from "./components/OnboardingView";
import { Sidebar, type AppView } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { ContactsView } from "./components/ContactsView";
import { HistoryView } from "./components/HistoryView";
import { VoiceListeningView } from "./components/VoiceListeningView";
import { FullSettingsView } from "./components/FullSettingsView";
import { useWallet } from "../hooks/useWallet";
import { connectFreighter } from "../lib/api";

const FF = "'DM Sans', sans-serif";

type AppScreen = "auth" | "onboarding" | "main";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("auth");
  const [activeView, setActiveView] = useState<AppView>("chat");
  const [authError, setAuthError] = useState<string | null>(null);
  const { connect, connecting } = useWallet();

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

      // MVP simplification: derive a stable pseudo-email from the wallet
      // address so we don't need a separate signup step for the demo.
      // Replace with a real email/identity flow before shipping.
      await connectFreighter(`${walletPublicKey.slice(0, 12).toLowerCase()}@rani.local`, walletPublicKey);
      setScreen("onboarding");
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
    return <OnboardingView onContinue={() => setScreen("main")} />;
  }

  /* ── Main app ── */
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "#060C18",
        fontFamily: FF,
        overflow: "hidden",
      }}
    >
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100%",
        }}
      >
        {activeView === "chat" && <ChatView />}
        {activeView === "contacts" && <ContactsView />}
        {activeView === "history" && <HistoryView />}
        {activeView === "voice" && (
          <VoiceListeningView onCancel={() => setActiveView("chat")} />
        )}
        {activeView === "settings" && (
          <FullSettingsView defaultTab="profile" />
        )}
      </div>
    </div>
  );
}
