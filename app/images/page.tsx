import Link from "next/link";
import LogoutButton from "../logout-button";
import ImageManager from "./image-manager";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function ImagesPage() {
  const {
    authorized,
    reason,
  } = await requireSuperadmin();

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold">
            {reason === "not_authenticated"
              ? "Admin login required"
              : "Access denied"}
          </h1>

          <div className="mt-6">
            <Link
              href="/"
              className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Images
            </h1>

            <p className="mt-2 text-gray-600">
              Manage food images and profile avatars stored in Supabase.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </div>
        </header>

        <div className="mt-8">
          <ImageManager />
        </div>

      </div>
    </main>
  );
}