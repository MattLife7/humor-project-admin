import Link from "next/link";
import LogoutButton from "../logout-button";
import CreateDomain from "./create-domain";
import DomainActions from "./domain-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AllowedSignupDomainsPage() {
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

  const { data: domains, error } = await supabase
    .from("allowed_signup_domains")
    .select("id, domain, created_at")
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
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Allowed Signup Domains
            </h1>

            <p className="mt-2 text-gray-600">
              Manage domains permitted for account signup.
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
          <CreateDomain />
        </div>

        <section className="mt-8 space-y-4">
          {domains?.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <p className="text-xl font-bold">
                {item.domain}
              </p>

              <p className="mt-2 font-mono text-xs text-gray-400">
                {item.id}
              </p>

              <div className="mt-4">
                <DomainActions
                  id={item.id}
                  initialDomain={item.domain}
                />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}