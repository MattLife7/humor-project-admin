"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  initialDomain: string;
};

export default function DomainActions({
  id,
  initialDomain,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [domain, setDomain] = useState(initialDomain);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!domain.trim()) {
      setError("Domain is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("allowed_signup_domains")
      .update({
        domain: domain.trim().toLowerCase(),
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
      `Delete allowed domain "${initialDomain}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("allowed_signup_domains")
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
    <div className="mt-4">
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => {
            setDomain(initialDomain);
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