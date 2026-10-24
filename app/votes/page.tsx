import Link from "next/link";
import LogoutButton from "../logout-button";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

type Profile = {
  first_name: string | null;
  last_name: string | null;
};

type Generation = {
  image_url: string;
};

type Caption = {
  caption: string;
  generation: Generation | Generation[] | null;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default async function VotesPage() {
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

  const { data: votes, error } = await supabase
    .from("votes")
    .select(`
      id,
      value,
      created_at,
      user_id,
      profiles (
        first_name,
        last_name
      ),
      captions (
        caption,
        generation:generations (
          image_url
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Could not load votes
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

  const upvotes =
    votes?.filter((vote) => vote.value === 1).length ?? 0;

  const downvotes =
    votes?.filter((vote) => vote.value === -1).length ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Votes
            </h1>

            <p className="mt-2 text-gray-600">
              Review all ratings submitted across Rate My Bite.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Signed in as {adminName}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total votes
            </p>

            <p className="mt-2 text-4xl font-bold">
              {votes?.length ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              🔥 Lit
            </p>

            <p className="mt-2 text-4xl font-bold text-green-600">
              {upvotes}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              🍅 Tomato, boo
            </p>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {downvotes}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <p className="font-semibold">
              Vote history
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Voter
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Vote
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Post
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {votes?.map((vote) => {
                  const voterRaw =
                    vote.profiles as unknown as
                      | Profile
                      | Profile[]
                      | null;

                  const voter = Array.isArray(voterRaw)
                    ? voterRaw[0]
                    : voterRaw;

                  const voterName =
                    [voter?.first_name, voter?.last_name]
                      .filter(Boolean)
                      .join(" ") || "Unnamed user";

                  const captionRaw =
                    vote.captions as unknown as
                      | Caption
                      | Caption[]
                      | null;

                  const caption = Array.isArray(captionRaw)
                    ? captionRaw[0]
                    : captionRaw;

                  const generationRaw =
                    caption?.generation;

                  const generation =
                    Array.isArray(generationRaw)
                      ? generationRaw[0]
                      : generationRaw;

                  return (
                    <tr
                      key={vote.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {voterName}
                        </p>

                        <p className="mt-1 font-mono text-xs text-gray-400">
                          {vote.user_id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {vote.value === 1 ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            🔥 Lit
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            🍅 Tomato
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex max-w-md items-center gap-3">
                          {generation?.image_url && (
                            <img
                              src={generation.image_url}
                              alt="Rated post"
                              className="h-14 w-14 rounded-lg bg-gray-100 object-cover"
                            />
                          )}

                          <p className="line-clamp-2 text-sm text-gray-700">
                            {caption?.caption ??
                              "Post unavailable"}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(vote.created_at)}
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