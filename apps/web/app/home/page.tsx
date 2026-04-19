"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Client-side guard. A server-side guard via middleware + session cookies
  // will be added when we build the real /home.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-fg-3">Loading…</p>
      </main>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg p-6">
      <Wordmark subtitle="You're in." />
      <p className="text-sm text-fg-2">
        Signed in as{" "}
        <span className="font-medium text-fg-1">
          {user.displayName || user.email}
        </span>
      </p>
      <div className="w-full max-w-[240px]">
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </main>
  );
}
