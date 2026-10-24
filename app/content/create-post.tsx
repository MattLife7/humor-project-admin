"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileOption = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export default function CreatePost({
  profiles,
}: {
  profiles: ProfileOption[];
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [userId, setUserId] = useState(profiles[0]?.id ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setUserId(profiles[0]?.id ?? "");
    setImageUrl("");
    setPrompt("");
    setCaption("");
    setMessage("");
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    resetForm();
    setOpen(false);
  };

  const handleCreate = async () => {
    const trimmedImageUrl = imageUrl.trim();
    const trimmedPrompt = prompt.trim();
    const trimmedCaption = caption.trim();

    if (!userId) {
      setMessage("Choose a post owner.");
      return;
    }

    if (!trimmedImageUrl) {
      setMessage("Image URL is required.");
      return;
    }

    if (!trimmedCaption) {
      setMessage("Caption is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { data: generation, error: generationError } =
      await supabase
        .from("generations")
        .insert({
          user_id: userId,
          image_url: trimmedImageUrl,
          prompt: trimmedPrompt || null,
        })
        .select("id")
        .single();

    if (generationError || !generation) {
      setMessage(
        generationError?.message ??
          "Could not create the post."
      );
      setSaving(false);
      return;
    }

    const { error: captionError } = await supabase
      .from("captions")
      .insert({
        generation_id: generation.id,
        caption: trimmedCaption,
      });

    if (captionError) {
      await supabase
        .from("generations")
        .delete()
        .eq("id", generation.id);

      setMessage(captionError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    resetForm();
    setOpen(false);

    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={profiles.length === 0}
        className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Create post
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close create post panel"
            onClick={handleClose}
            className="absolute inset-0 bg-black/30"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                  CREATE
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Create post
                </h2>
              </div>

              <button
                onClick={handleClose}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xl text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm leading-6 text-gray-500">
                Create a complete Rate My Bite post with an owner,
                image, context, and AI-generated caption.
              </p>

              <div className="mt-6">
                <label
                  htmlFor="post-owner"
                  className="text-sm font-semibold text-gray-700"
                >
                  Post owner
                </label>

                <select
                  id="post-owner"
                  value={userId}
                  onChange={(event) =>
                    setUserId(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
                >
                  {profiles.map((profile) => {
                    const name =
                      [profile.first_name, profile.last_name]
                        .filter(Boolean)
                        .join(" ") || "Unnamed user";

                    return (
                      <option
                        key={profile.id}
                        value={profile.id}
                      >
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="image-url"
                  className="text-sm font-semibold text-gray-700"
                >
                  Image URL
                </label>

                <input
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(event) =>
                    setImageUrl(event.target.value)
                  }
                  placeholder="https://..."
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="post-context"
                  className="text-sm font-semibold text-gray-700"
                >
                  Prompt / context
                </label>

                <textarea
                  id="post-context"
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(event.target.value)
                  }
                  rows={4}
                  placeholder="Optional context..."
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="post-caption"
                  className="text-sm font-semibold text-gray-700"
                >
                  AI-generated caption
                </label>

                <textarea
                  id="post-caption"
                  value={caption}
                  onChange={(event) =>
                    setCaption(event.target.value)
                  }
                  rows={5}
                  placeholder="Enter the AI-generated caption..."
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-black"
                />
              </div>

              {message && (
                <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {message}
                </div>
              )}

              <div className="mt-7 flex gap-3 border-t border-gray-200 pt-5">
                <button
                  onClick={handleCreate}
                  disabled={saving || profiles.length === 0}
                  className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creating post..." : "Create post"}
                </button>

                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}