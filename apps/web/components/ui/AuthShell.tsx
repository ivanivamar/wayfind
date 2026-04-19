import type { ReactNode } from "react";

/**
 * Layout for auth pages. Renders the clean grid background
 * (thin, equally spaced vertical + horizontal lines, no shapes)
 * and centers its single child within the viewport.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen bg-grid flex items-center justify-center p-6">
      {children}
    </main>
  );
}
