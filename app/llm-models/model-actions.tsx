"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Provider = {
  id: string;
  name: string;
};

type Props = {
  id: string;
  initialProviderId: string | null;
  initialName: string;
  initialModelKey: string;
  providers: Provider[];
};

export default function ModelActions({
  id,
  initialProviderId,
  initialName,
  initialModelKey,
  providers,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [providerId, setProviderId] = useState(
    initialProviderId ?? providers[0]?.id ?? ""
  );
  const [name, setName] = useState(initialName);
  const [modelKey, setModelKey] = useState(initialModelKey);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!providerId || !name.trim() || !modelKey.trim()) {
      setError("Provider, model name, and model key are required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("llm_models")
      .update({
        provider_id: providerId,
        name: name.trim(),
        model_key: modelKey.trim(),
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
      `Delete model "${initialName}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("llm_models")
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
      <select
        value={providerId}
        onChange={(e) => setProviderId(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      >
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <input
        value={modelKey}
        onChange={(e) => setModelKey(e.target.value)}
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
            setProviderId(initialProviderId ?? providers[0]?.id ?? "");
            setName(initialName);
            setModelKey(initialModelKey);
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