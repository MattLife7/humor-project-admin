import Link from "next/link";
import LogoutButton from "../logout-button";
import EditPost from "./edit-post";
import DeletePost from "./delete-post";
import CreatePost from "./create-post";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

type Author = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type ProfileOption = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type Generation = {
  id: string;
  user_id: string;
  image_url: string;
  prompt: string | null;
  created_at: string;
  profiles: Author | Author[] | null;
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

export default async function ContentPage() {
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

  const { data: captions, error: captionsError } = await supabase
    .from("captions")
    .select(`
      id,
      caption,
      created_at,
      generation:generations!inner (
        id,
        user_id,
        image_url,
        prompt,
        created_at,
        profiles (
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (captionsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Could not load posts
          </h1>

          <p className="mt-3 text-red-600">
            {captionsError.message}
          </p>
        </div>
      </main>
    );
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name
    `)
    .order("first_name", { ascending: true });

  if (profilesError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Could not load profiles
          </h1>

          <p className="mt-3 text-red-600">
            {profilesError.message}
          </p>
        </div>
      </main>
    );
  }

  const profileOptions =
    (profiles ?? []) as ProfileOption[];

  const adminName =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") || "Admin";

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rate My Bite Admin
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              AI Content
            </h1>

            <p className="mt-2 text-gray-600">
              Create, review, edit, and delete complete Rate My Bite posts.
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Posts
            </p>

            <p className="mt-1 text-3xl font-bold">
              {captions?.length ?? 0}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              FULL CRUD
            </div>

            <CreatePost profiles={profileOptions} />
          </div>
        </div>

        {captions && captions.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {captions.map((item) => {
              const generationRaw =
                item.generation as unknown as
                  | Generation
                  | Generation[];

              const generation = Array.isArray(generationRaw)
                ? generationRaw[0]
                : generationRaw;

              if (!generation) {
                return null;
              }

              const authorRaw = generation.profiles;

              const author = Array.isArray(authorRaw)
                ? authorRaw[0]
                : authorRaw;

              const authorName =
                [author?.first_name, author?.last_name]
                  .filter(Boolean)
                  .join(" ") || "Unnamed user";

              return (
                <article
                  key={generation.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="bg-gray-100">
                    <img
                      src={generation.image_url}
                      alt="Food submission"
                      className="h-72 w-full object-contain"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                          AI Generated Content
                        </p>

                        <h2 className="mt-2 text-xl font-bold leading-snug">
                          “{item.caption}”
                        </h2>
                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {formatDate(generation.created_at)}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <EditPost
                        generationId={generation.id}
                        captionId={item.id}
                        initialImageUrl={generation.image_url}
                        initialPrompt={generation.prompt}
                        initialCaption={item.caption}
                      />

                      <DeletePost
                        generationId={generation.id}
                      />
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                          {author?.avatar_url ? (
                            <img
                              src={author.avatar_url}
                              alt={authorName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              👤
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-semibold">
                            {authorName}
                          </p>

                          <p className="text-xs text-gray-500">
                            Post owner
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Prompt / context
                        </p>

                        <p className="mt-2 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                          {generation.prompt?.trim()
                            ? generation.prompt
                            : "No additional context provided."}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
                        <div>
                          <span className="font-semibold">
                            Post ID:
                          </span>{" "}
                          <span className="break-all font-mono">
                            {generation.id}
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold">
                            Caption ID:
                          </span>{" "}
                          <span className="break-all font-mono">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🤖</div>

            <h2 className="mt-4 text-2xl font-bold">
              No posts yet
            </h2>

            <p className="mt-2 text-gray-500">
              Rate My Bite posts will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}