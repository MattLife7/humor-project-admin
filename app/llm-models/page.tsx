import Link from "next/link";
import LogoutButton from "../logout-button";
import CreateModel from "./create-model";
import ModelActions from "./model-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function LlmModelsPage() {
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

  const [
    modelsResult,
    providersResult,
  ] = await Promise.all([
    supabase
      .from("llm_models")
      .select(`
        id,
        provider_id,
        name,
        model_key,
        created_at,
        llm_providers (
          name
        )
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("llm_providers")
      .select("id, name")
      .order("name"),
  ]);

  if (modelsResult.error || providersResult.error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">
          {modelsResult.error?.message ??
            providersResult.error?.message}
        </p>
      </main>
    );
  }

  const providers = providersResult.data ?? [];
  const models = modelsResult.data ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              LLM Models
            </h1>

            <p className="mt-2 text-gray-600">
              Manage AI models and their providers.
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
          <CreateModel providers={providers} />
        </div>

        <section className="mt-8 space-y-4">
          {models.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No LLM models found.
              </p>
            </div>
          ) : (
            models.map((model) => {
              const provider = Array.isArray(model.llm_providers)
                ? model.llm_providers[0]
                : model.llm_providers;

              return (
                <article
                  key={model.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {model.name}
                      </h2>

                      <p className="mt-2 text-gray-600">
                        Provider: {provider?.name || "Unknown"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Model key:{" "}
                        <span className="font-mono">
                          {model.model_key}
                        </span>
                      </p>

                      <p className="mt-3 font-mono text-xs text-gray-400">
                        {model.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ModelActions
                      id={model.id}
                      initialProviderId={model.provider_id}
                      initialName={model.name}
                      initialModelKey={model.model_key}
                      providers={providers}
                    />
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}