"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Provider = {
  id: string;
  name: string;
};

type Props = {
  providers: Provider[];
};

export default function CreateModel({ providers }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [modelKey, setModelKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!providerId || !name.trim() || !modelKey.trim()) {
      setError("Provider, model name, and model key are required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase.from("llm_models").insert({
      provider_id: providerId,
      name: name.trim(),
      model_key: modelKey.trim(),
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setName("");
    setModelKey("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Create LLM model</h2>

      <div className="mt-4 grid gap-4">
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3"
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
          placeholder="Model name"
          className="rounded-lg border border-gray-300 px-4 py-3"
        />

        <input
          value={modelKey}
          onChange={(e) => setModelKey(e.target.value)}
          placeholder="Model key"
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
          {saving ? "Creating..." : "Create model"}
        </button>
      </div>
    </div>
  );
}