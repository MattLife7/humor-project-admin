"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  initialEmail: string;
};

export default function EmailActions({
  id,
  initialEmail,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("whitelisted_emails")
      .update({
        email: email.trim().toLowerCase(),
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
      `Delete whitelisted email "${initialEmail}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("whitelisted_emails")
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
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
            setEmail(initialEmail);
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