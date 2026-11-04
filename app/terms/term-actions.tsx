"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  initialTerm: string;
  initialDefinition: string | null;
};

export default function TermActions({
  id,
  initialTerm,
  initialDefinition,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [term, setTerm] = useState(initialTerm);
  const [definition, setDefinition] = useState(
    initialDefinition ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!term.trim()) {
      setError("Term is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("terms")
      .update({
        term: term.trim(),
        definition: definition.trim() || null,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    const confirmed = window.confirm(
      `Delete "${initialTerm}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("terms")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"
        >
          Edit
        </button>

        <button
          onClick={remove}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <textarea
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        rows={3}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => {
            setTerm(initialTerm);
            setDefinition(initialDefinition ?? "");
            setEditing(false);
            setError("");
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}