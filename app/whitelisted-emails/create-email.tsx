"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateEmail() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("whitelisted_emails")
      .insert({
        email: email.trim().toLowerCase(),
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setEmail("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        Add whitelisted email
      </h2>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="person@example.com"
          className="min-w-72 flex-1 rounded-lg border border-gray-300 px-4 py-3"
        />

        <button
          onClick={handleCreate}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add email"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}