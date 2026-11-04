import Link from "next/link";
import LogoutButton from "../logout-button";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function GenerationRequestsPage() {
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

  const { data: requests, error } = await supabase
    .from("generation_requests")
    .select(`
      id,
      status,
      created_at,
      user_id,
      prompt_chain_id,
      profiles (
        first_name,
        last_name
      ),
      prompt_chains (
        name
      )
    `)
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
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Generation Requests
            </h1>

            <p className="mt-2 text-gray-600">
              View AI generation requests submitted through the system.
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

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total requests
          </p>

          <p className="mt-2 text-4xl font-bold">
            {requests?.length ?? 0}
          </p>
        </div>

        <section className="mt-8">
          {requests?.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No generation requests yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        User
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Prompt chain
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Created
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Request ID
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {requests?.map((request) => {
                      const profile = Array.isArray(request.profiles)
                        ? request.profiles[0]
                        : request.profiles;

                      const chain = Array.isArray(request.prompt_chains)
                        ? request.prompt_chains[0]
                        : request.prompt_chains;

                      const userName =
                        [profile?.first_name, profile?.last_name]
                          .filter(Boolean)
                          .join(" ") || "Unknown user";

                      return (
                        <tr key={request.id}>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                              {request.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {userName}
                          </td>

                          <td className="px-6 py-4">
                            {chain?.name || "No chain"}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              request.created_at
                            ).toLocaleString()}
                          </td>

                          <td className="px-6 py-4 font-mono text-xs text-gray-400">
                            {request.id}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}