import Link from "next/link";
import LogoutButton from "../logout-button";
import CreateProvider from "./create-provider";
import ProviderActions from "./provider-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function LlmProvidersPage() {
  const {
    supabase,
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

  const { data: providers, error } = await supabase
    .from("llm_providers")
    .select("id, name, base_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              LLM Providers
            </h1>

            <p className="mt-2 text-gray-600">
              Manage AI model providers used by the platform.
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
          <CreateProvider />
        </div>

        <section className="mt-8 space-y-4">
          {providers?.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No LLM providers found.
              </p>
            </div>
          ) : (
            providers?.map((provider) => (
              <article
                key={provider.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">
                  {provider.name}
                </h2>

                <p className="mt-2 text-gray-600">
                  {provider.base_url || "No base URL."}
                </p>

                <p className="mt-3 font-mono text-xs text-gray-400">
                  {provider.id}
                </p>

                <div className="mt-4">
                  <ProviderActions
                    id={provider.id}
                    initialName={provider.name}
                    initialBaseUrl={provider.base_url}
                  />
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}