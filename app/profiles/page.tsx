import Link from "next/link";
import LogoutButton from "../logout-button";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function ProfilesPage() {
  const {
    supabase,
    profile,
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

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      avatar_url,
      is_superadmin
    `)
    .order("first_name", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Could not load profiles
          </h1>

          <p className="mt-3 text-red-600">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  const adminName =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") || "Admin";

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Profiles
            </h1>

            <p className="mt-2 text-gray-600">
              Signed in as {adminName}
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

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <p className="font-semibold">
              {profiles?.length ?? 0} profiles
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    User
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Profile ID
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {profiles?.map((userProfile) => {
                  const fullName =
                    [
                      userProfile.first_name,
                      userProfile.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Unnamed user";

                  return (
                    <tr
                      key={userProfile.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-200">
                            {userProfile.avatar_url ? (
                              <img
                                src={userProfile.avatar_url}
                                alt={fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg">
                                👤
                              </div>
                            )}
                          </div>

                          <span className="font-semibold">
                            {fullName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {userProfile.id}
                      </td>

                      <td className="px-6 py-4">
                        {userProfile.is_superadmin ? (
                          <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                            SUPERADMIN
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            USER
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}