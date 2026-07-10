import { createContext, useContext, useState, ReactNode } from "react";

export interface RecentTransaction {
  id: string;
  txHash: string;
  recipientName: string;
  amount: string;
  memo?: string;
  timestamp: number;
}

interface RecentTransactionsContextValue {
  recentTransactions: RecentTransaction[];
  addTransaction: (tx: Omit<RecentTransaction, "id" | "timestamp">) => void;
}

const RecentTransactionsContext = createContext<RecentTransactionsContextValue | null>(null);

export function RecentTransactionsProvider({ children }: { children: ReactNode }) {
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  const addTransaction = (tx: Omit<RecentTransaction, "id" | "timestamp">) => {
    setRecentTransactions((prev) => [
      { ...tx, id: crypto.randomUUID(), timestamp: Date.now() },
      ...prev,
    ]);
  };

  return (
    <RecentTransactionsContext.Provider value={{ recentTransactions, addTransaction }}>
      {children}
    </RecentTransactionsContext.Provider>
  );
}

export function useRecentTransactions() {
  const ctx = useContext(RecentTransactionsContext);
  if (!ctx) throw new Error("useRecentTransactions must be used within a RecentTransactionsProvider");
  return ctx;
}