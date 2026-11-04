"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateTerm() {
  const supabase = createClient();
  const router = useRouter();

  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!term.trim()) {
      setError("Term is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase.from("terms").insert({
      term: term.trim(),
      definition: definition.trim() || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setTerm("");
    setDefinition("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Create term</h2>

      <div className="mt-4 grid gap-4">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Term"
          className="rounded-lg border border-gray-300 px-4 py-3"
        />

        <textarea
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          placeholder="Definition"
          rows={3}
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
          {saving ? "Creating..." : "Create term"}
        </button>
      </div>
    </div>
  );
}