import { createContext, useContext, useState, ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Shield, CheckCircle } from "lucide-react";

export interface AppNotification {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  onClick?: () => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    icon: ArrowDownLeft,
    iconBg: "rgba(34,197,94,0.14)",
    iconColor: "#4ADE80",
    title: "Payment Received",
    body: "Received ₱500 from Juan Reyes",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    icon: Shield,
    iconBg: "rgba(245,158,11,0.14)",
    iconColor: "#F59E0B",
    title: "Security Alert",
    body: "Security: New device signed in.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    icon: CheckCircle,
    iconBg: "rgba(37,99,235,0.14)",
    iconColor: "#60A5FA",
    title: "Transaction Settled",
    body: "Transaction settled in 4.2s.",
    time: "Just now",
    unread: true,
  },
];

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "unread" | "time">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const addNotification = (n: Omit<AppNotification, "id" | "unread" | "time">) => {
    setNotifications((prev) => [
      { ...n, id: crypto.randomUUID(), unread: true, time: "Just now" },
      ...prev,

    ]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  
  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };
  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}