import Link from "next/link";
import LogoutButton from "../logout-button";
import EditMix from "./edit-mix";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

type PromptChainStep = {
  id: string;
  step_order: number;
  prompt: string;
  created_at: string;
};

type PromptChainMix = {
  id: string;
  weight: number;
  enabled: boolean;
};

type PromptChain = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  prompt_chain_steps: PromptChainStep[] | null;
  prompt_chain_mix: PromptChainMix[] | null;
};

export default async function PromptChainsPage() {
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

          <p className="mt-3 text-gray-600">
            {reason === "not_authenticated"
              ? "You must sign in through the admin panel first."
              : "This account does not have superadmin access."}
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/"
              className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
            >
              Back home
            </Link>

            {reason === "not_superadmin" && <LogoutButton />}
          </div>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("prompt_chains")
    .select(`
      id,
      name,
      description,
      created_at,
      prompt_chain_steps (
        id,
        step_order,
        prompt,
        created_at
      ),
      prompt_chain_mix (
        id,
        weight,
        enabled
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Could not load prompt chains
          </h1>

          <p className="mt-3 text-red-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  const chains = (data ?? []) as PromptChain[];

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Prompt Chains
            </h1>

            <p className="mt-2 text-gray-600">
              View prompt chains, their steps, and current mix settings.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </div>
        </header>

        <div className="mt-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total prompt chains
            </p>

            <p className="mt-2 text-4xl font-bold">
              {chains.length}
            </p>
          </div>
        </div>

        <section className="mt-8 space-y-6">
          {chains.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No prompt chains found.
              </p>
            </div>
          ) : (
            chains.map((chain) => {
              const steps = [...(chain.prompt_chain_steps ?? [])]
                .sort((a, b) => a.step_order - b.step_order);

              const mix = chain.prompt_chain_mix?.[0] ?? null;

              return (
                <article
                  key={chain.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {chain.name}
                        </h2>

                        <p className="mt-2 max-w-3xl text-gray-600">
                          {chain.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            mix?.enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {mix?.enabled ? "Enabled" : "Disabled"}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                          Weight {mix?.weight ?? "—"}
                        </span>

                        <EditMix
                          mixId={mix?.id ?? null}
                          promptChainId={chain.id}
                          initialWeight={mix?.weight ?? 1}
                          initialEnabled={mix?.enabled ?? true}
                        />
                      </div>
                    </div>

                    <p className="mt-4 font-mono text-xs text-gray-400">
                      {chain.id}
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">
                        Prompt chain steps
                      </h3>

                      <span className="text-sm text-gray-500">
                        {steps.length}{" "}
                        {steps.length === 1 ? "step" : "steps"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {steps.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No steps in this chain.
                        </p>
                      ) : (
                        steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                              {step.step_order}
                            </div>

                            <div>
                              <p className="leading-6 text-gray-800">
                                {step.prompt}
                              </p>

                              <p className="mt-2 font-mono text-xs text-gray-400">
                                {step.id}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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