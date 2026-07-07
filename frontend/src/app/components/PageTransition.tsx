import { motion } from "motion/react";
import type { ReactNode } from "react";

export function PageTransition({ children, viewKey }: { children: ReactNode; viewKey: string }) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}