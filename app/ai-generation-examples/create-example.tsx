"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateExample() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("ai_generation_examples")
      .insert({
        title: title.trim(),
        prompt: prompt.trim() || null,
        output: output.trim() || null,
      });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setPrompt("");
    setOutput("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        Create generation example
      </h2>

      <div className="mt-4 grid gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example title"
          className="rounded-lg border border-gray-300 px-4 py-3"
        />

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt"
          rows={3}
          className="rounded-lg border border-gray-300 px-4 py-3"
        />

        <textarea
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="AI output"
          rows={4}
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
          {saving ? "Creating..." : "Create example"}
        </button>
      </div>
    </div>
  );
}