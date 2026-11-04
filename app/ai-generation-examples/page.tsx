import Link from "next/link";
import LogoutButton from "../logout-button";
import CreateExample from "./create-example";
import ExampleActions from "./example-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AiGenerationExamplesPage() {
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

  const { data: examples, error } = await supabase
    .from("ai_generation_examples")
    .select("id, title, prompt, output, created_at")
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
              AI Generation Examples
            </h1>

            <p className="mt-2 text-gray-600">
              Manage example AI prompts and outputs.
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
          <CreateExample />
        </div>

        <section className="mt-8 space-y-4">
          {examples?.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No AI generation examples yet.
              </p>
            </div>
          ) : (
            examples?.map((example) => (
              <article
                key={example.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">
                  {example.title}
                </h2>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Prompt
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-gray-700">
                    {example.prompt || "No prompt."}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Output
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-gray-700">
                    {example.output || "No output."}
                  </p>
                </div>

                <p className="mt-4 font-mono text-xs text-gray-400">
                  {example.id}
                </p>

                <div className="mt-4">
                  <ExampleActions
                    id={example.id}
                    initialTitle={example.title}
                    initialPrompt={example.prompt}
                    initialOutput={example.output}
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