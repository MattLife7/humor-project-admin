"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateDomain() {
  const supabase = createClient();
  const router = useRouter();

  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!domain.trim()) {
      setError("Domain is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("allowed_signup_domains")
      .insert({
        domain: domain.trim().toLowerCase(),
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setDomain("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        Add allowed signup domain
      </h2>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="min-w-72 flex-1 rounded-lg border border-gray-300 px-4 py-3"
        />

        <button
          onClick={handleCreate}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add domain"}
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