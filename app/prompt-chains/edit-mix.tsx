"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  mixId: string | null;
  promptChainId: string;
  initialWeight: number;
  initialEnabled: boolean;
};

export default function EditMix({
  mixId,
  promptChainId,
  initialWeight,
  initialEnabled,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(initialWeight);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveMix() {
    setSaving(true);
    setError("");

    if (mixId) {
      const { error } = await supabase
        .from("prompt_chain_mix")
        .update({
          weight,
          enabled,
        })
        .eq("id", mixId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("prompt_chain_mix")
        .insert({
          prompt_chain_id: promptChainId,
          weight,
          enabled,
        });

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Edit mix
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium text-gray-700">
          Weight
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="mt-1 block w-28 rounded-lg border border-gray-300 bg-white px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>

        <button
          onClick={saveMix}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => {
            setWeight(initialWeight);
            setEnabled(initialEnabled);
            setEditing(false);
            setError("");
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
        >
          Cancel
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