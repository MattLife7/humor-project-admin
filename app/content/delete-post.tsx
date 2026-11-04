"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeletePost({
  generationId,
}: {
  generationId: string;
}) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setMessage("");

    const supabase = createClient();

    // 1. Load the generation first so we know which image to remove.
    const { data: generation, error: generationError } =
      await supabase
        .from("generations")
        .select("id, image_url")
        .eq("id", generationId)
        .single();

    if (generationError) {
      setMessage(generationError.message);
      setDeleting(false);
      return;
    }

    // 2. If this generation has an image stored in the "bites" bucket,
    // remove that file from Supabase Storage.
    if (generation?.image_url) {
      const marker = "/storage/v1/object/public/bites/";
      const markerIndex = generation.image_url.indexOf(marker);

      if (markerIndex !== -1) {
        const imagePath = decodeURIComponent(
          generation.image_url.slice(
            markerIndex + marker.length
          )
        );

        const { error: storageError } =
          await supabase.storage
            .from("bites")
            .remove([imagePath]);

        if (storageError) {
          setMessage(
            `Could not delete image from storage: ${storageError.message}`
          );
          setDeleting(false);
          return;
        }
      }
    }

    // 3. Delete the generation.
    // Existing cascade rules remove its caption and votes.
    const { error: deleteError } = await supabase
      .from("generations")
      .delete()
      .eq("id", generationId);

    if (deleteError) {
      setMessage(deleteError.message);
      setDeleting(false);
      return;
    }

    router.refresh();
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        Delete post
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">
        Delete this entire post?
      </p>

      <p className="mt-1 text-xs leading-5 text-red-700">
        This permanently removes the submission, its uploaded image,
        its AI caption, and all votes attached to it.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Yes, delete post"}
        </button>

        <button
          onClick={() => {
            setConfirming(false);
            setMessage("");
          }}
          disabled={deleting}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}