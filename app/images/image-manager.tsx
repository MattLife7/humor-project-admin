"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type BucketName = "bites" | "avatars";

type ImageFile = {
  name: string;
  path: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function ImageManager() {
  const supabase = createClient();

  const [bucket, setBucket] =
    useState<BucketName>("bites");
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] =
    useState(false);

  const [replacingPath, setReplacingPath] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  // Used only to force the browser to refresh an image
  // after replacing it at the same public URL.
  const [imageVersion, setImageVersion] =
    useState(Date.now());

  async function loadFiles() {
    setLoading(true);
    setError("");

    const { data: rootItems, error: rootError } =
      await supabase.storage
        .from(bucket)
        .list("", {
          limit: 100,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

    if (rootError) {
      setError(rootError.message);
      setFiles([]);
      setLoading(false);
      return;
    }

    const allFiles: ImageFile[] = [];

    for (const item of rootItems ?? []) {
      if (item.id) {
        allFiles.push({
          name: item.name,
          path: item.name,
          created_at: item.created_at,
          updated_at: item.updated_at,
        });

        continue;
      }

      const folderName = item.name;

      const {
        data: folderFiles,
        error: folderError,
      } = await supabase.storage
        .from(bucket)
        .list(folderName, {
          limit: 100,
          sortBy: {
            column: "created_at",
            order: "desc",
          },
        });

      if (folderError) {
        console.error(
          `Could not load folder ${folderName}:`,
          folderError
        );
        continue;
      }

      for (const file of folderFiles ?? []) {
        if (!file.id) {
          continue;
        }

        allFiles.push({
          name: file.name,
          path: `${folderName}/${file.name}`,
          created_at: file.created_at,
          updated_at: file.updated_at,
        });
      }
    }

    allFiles.sort((a, b) => {
      const dateA = a.created_at
        ? new Date(a.created_at).getTime()
        : 0;

      const dateB = b.created_at
        ? new Date(b.created_at).getTime()
        : 0;

      return dateB - dateA;
    });

    setFiles(allFiles);
    setLoading(false);
  }

  useEffect(() => {
    loadFiles();
  }, [bucket]);

  async function uploadFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const filePath =
      `admin/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      setError(error.message);
      setUploading(false);
      event.target.value = "";
      return;
    }

    setUploading(false);
    event.target.value = "";

    await loadFiles();
  }

  async function replaceFile(
    path: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      `Replace "${path}" with the selected image?`
    );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    setReplacingPath(path);
    setError("");

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      setError(error.message);
      setReplacingPath(null);
      event.target.value = "";
      return;
    }

    event.target.value = "";

    // Same path means same public URL, so force the browser
    // to request the updated file instead of using its cache.
    setImageVersion(Date.now());

    setReplacingPath(null);

    await loadFiles();
  }

  async function deleteFile(path: string) {
    const confirmed = window.confirm(
      `Delete "${path}" from ${bucket}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      setError(error.message);
      return;
    }

    await loadFiles();
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">
            Storage bucket
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose which image collection to manage.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBucket("bites")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              bucket === "bites"
                ? "bg-black text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            Bites
          </button>

          <button
            onClick={() => setBucket("avatars")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              bucket === "avatars"
                ? "bg-black text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            Avatars
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Upload image
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload a new image to the {bucket} bucket.
            </p>
          </div>

          <label className="cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
            {uploading
              ? "Uploading..."
              : "Choose image"}

            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={uploadFile}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <section className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading images...
            </p>
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              No images found in this bucket.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm font-semibold text-gray-500">
              {files.length}{" "}
              {files.length === 1
                ? "image"
                : "images"}
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {files.map((file) => (
                <article
                  key={file.path}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={`${getPublicUrl(
                        file.path
                      )}?v=${imageVersion}`}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>

                    <p className="mt-1 truncate font-mono text-xs text-gray-400">
                      {file.path}
                    </p>

                    {file.created_at && (
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(
                          file.created_at
                        ).toLocaleString()}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                        {replacingPath === file.path
                          ? "Replacing..."
                          : "Replace image"}

                        <input
                          type="file"
                          accept="image/*"
                          disabled={
                            replacingPath === file.path
                          }
                          onChange={(event) =>
                            replaceFile(
                              file.path,
                              event
                            )
                          }
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={() =>
                          deleteFile(file.path)
                        }
                        disabled={
                          replacingPath === file.path
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}