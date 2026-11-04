"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateProvider() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Provider name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase.from("llm_providers").insert({
      name: name.trim(),
      base_url: baseUrl.trim() || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setName("");
    setBaseUrl("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Create LLM provider</h2>

      <div className="mt-4 grid gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Provider name"
          className="rounded-lg border border-gray-300 px-4 py-3"
        />

        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Base URL"
          className="rounded-lg border border-gray-300 px-4 py-3"
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={saving}
          className="w-fit rounded-lg bg-black px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create provider"}
        </button>
      </div>
    </div>
  );
}