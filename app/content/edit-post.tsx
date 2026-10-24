"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditPost({
  generationId,
  captionId,
  initialImageUrl,
  initialPrompt,
  initialCaption,
}: {
  generationId: string;
  captionId: string;
  initialImageUrl: string;
  initialPrompt: string | null;
  initialCaption: string;
}) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);

  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [caption, setCaption] = useState(initialCaption);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    const trimmedImageUrl = imageUrl.trim();
    const trimmedPrompt = prompt.trim();
    const trimmedCaption = caption.trim();

    if (!trimmedImageUrl) {
      setMessage("Image URL cannot be empty.");
      return;
    }

    if (!trimmedCaption) {
      setMessage("Caption cannot be empty.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error: generationError } = await supabase
      .from("generations")
      .update({
        image_url: trimmedImageUrl,
        prompt: trimmedPrompt || null,
      })
      .eq("id", generationId);

    if (generationError) {
      setMessage(generationError.message);
      setSaving(false);
      return;
    }

    const { error: captionError } = await supabase
      .from("captions")
      .update({
        caption: trimmedCaption,
      })
      .eq("id", captionId);

    if (captionError) {
      setMessage(captionError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);

    router.refresh();
  };

  const handleCancel = () => {
    setImageUrl(initialImageUrl);
    setPrompt(initialPrompt ?? "");
    setCaption(initialCaption);
    setMessage("");
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Edit post
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
        UPDATE
      </p>

      <h3 className="mt-1 text-lg font-bold">
        Edit post
      </h3>

      <div className="mt-4">
        <label
          htmlFor={`image-${generationId}`}
          className="text-sm font-semibold text-gray-700"
        >
          Image URL
        </label>

        <input
          id={`image-${generationId}`}
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor={`prompt-${generationId}`}
          className="text-sm font-semibold text-gray-700"
        >
          Prompt / context
        </label>

        <textarea
          id={`prompt-${generationId}`}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor={`caption-${captionId}`}
          className="text-sm font-semibold text-gray-700"
        >
          AI-generated caption
        </label>

        <textarea
          id={`caption-${captionId}`}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>

        <button
          onClick={handleCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
        >
          Cancel
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}