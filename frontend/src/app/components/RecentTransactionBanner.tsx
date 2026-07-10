import { ArrowUpRight } from "lucide-react";
import { useRecentTransactions } from "../../lib/recentTransactionsStore";

const FF = "'DM Sans', sans-serif";

export function RecentTransactionBanner() {
  const { recentTransactions } = useRecentTransactions();
  const latest = recentTransactions[0];

  if (!latest) return null;

  return (
    <div
      style={{
        margin: "16px 28px 0",
        padding: "14px 18px",
        borderRadius: 12,
        background: "rgba(37,99,235,0.08)",
        border: "1px solid rgba(37,99,235,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ArrowUpRight size={16} color="#60A5FA" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#F0F6FF", fontSize: 13, fontWeight: 600, fontFamily: FF }}>
          ₱{latest.amount} sent to {latest.recipientName}
        </div>
        <div style={{ color: "#4A6080", fontSize: 12, fontFamily: FF, marginTop: 2 }}>
          Just completed · {latest.txHash.slice(0, 10)}...
        </div>
      </div>
    </div>
  );
}