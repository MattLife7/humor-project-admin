"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  initialTitle: string;
  initialPrompt: string | null;
  initialOutput: string | null;
};

export default function ExampleActions({
  id,
  initialTitle,
  initialPrompt,
  initialOutput,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [output, setOutput] = useState(initialOutput ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("ai_generation_examples")
      .update({
        title: title.trim(),
        prompt: prompt.trim() || null,
        output: output.trim() || null,
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
      `Delete "${initialTitle}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("ai_generation_examples")
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
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <textarea
        value={output}
        onChange={(e) => setOutput(e.target.value)}
        rows={4}
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
            setTitle(initialTitle);
            setPrompt(initialPrompt ?? "");
            setOutput(initialOutput ?? "");
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