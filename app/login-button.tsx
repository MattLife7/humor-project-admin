"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Sign in with Google"}
    </button>
  );
}