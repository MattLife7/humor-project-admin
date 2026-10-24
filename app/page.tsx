import Link from "next/link";
import LoginButton from "./login-button";
import LogoutButton from "./logout-button";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

type Vote = {
  id: string;
  user_id: string;
  caption_id: string;
  value: number;
};

type Caption = {
  id: string;
  caption: string;
  generation:
    | {
        id: string;
        image_url: string;
      }
    | {
        id: string;
        image_url: string;
      }[]
    | null;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

function getName(profile: Profile | undefined) {
  if (!profile) {
    return "Unnamed user";
  }

  return (
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || "Unnamed user"
  );
}

export default async function Home() {
  const {
    supabase,
    profile,
    authorized,
    reason,
  } = await requireSuperadmin();

  if (!authorized) {
    if (reason === "not_authenticated") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-400">
              Rate My Bite
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Admin Panel
            </h1>

            <p className="mt-3 leading-6 text-gray-600">
              Sign in with Google to access the administration area.
            </p>

            <div className="mt-6">
              <LoginButton />
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-500">
            Restricted
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Access denied
          </h1>

          <p className="mt-3 leading-6 text-gray-600">
            You are signed in, but this account does not have superadmin access.
          </p>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </main>
    );
  }

  const [
    profilesResult,
    captionsResult,
    votesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url"),

    supabase
      .from("captions")
      .select(`
        id,
        caption,
        generation:generations (
          id,
          image_url
        )
      `),

    supabase
      .from("votes")
      .select(`
        id,
        user_id,
        caption_id,
        value
      `),
  ]);

  if (
    profilesResult.error ||
    captionsResult.error ||
    votesResult.error
  ) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Could not load dashboard
          </h1>

          <p className="mt-3 text-red-600">
            {profilesResult.error?.message ??
              captionsResult.error?.message ??
              votesResult.error?.message}
          </p>
        </div>
      </main>
    );
  }

  const profiles = (profilesResult.data ?? []) as Profile[];

  const captions =
    (captionsResult.data ?? []) as unknown as Caption[];

  const votes = (votesResult.data ?? []) as Vote[];

  const totalUsers = profiles.length;
  const totalPosts = captions.length;
  const totalVotes = votes.length;

  const upvotes = votes.filter(
    (vote) => vote.value === 1
  ).length;

  const downvotes = votes.filter(
    (vote) => vote.value === -1
  ).length;

  const approvalRate =
    totalVotes > 0
      ? Math.round((upvotes / totalVotes) * 100)
      : 0;

  const averageVotesPerPost =
    totalPosts > 0
      ? (totalVotes / totalPosts).toFixed(1)
      : "0.0";

  const captionStats = captions.map((caption) => {
    const captionVotes = votes.filter(
      (vote) => vote.caption_id === caption.id
    );

    const positive = captionVotes.filter(
      (vote) => vote.value === 1
    ).length;

    const negative = captionVotes.filter(
      (vote) => vote.value === -1
    ).length;

    const generationRaw = caption.generation;

    const generation = Array.isArray(generationRaw)
      ? generationRaw[0]
      : generationRaw;

    return {
      id: caption.id,
      caption: caption.caption,
      imageUrl: generation?.image_url ?? null,
      totalVotes: captionVotes.length,
      positive,
      negative,
      score: positive - negative,
    };
  });

  const mostVotedPost =
    [...captionStats].sort(
      (a, b) => b.totalVotes - a.totalVotes
    )[0] ?? null;

  const mostPositivePost =
    [...captionStats].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.positive - a.positive;
    })[0] ?? null;

  const mostRejectedPost =
    [...captionStats].sort((a, b) => {
      if (b.negative !== a.negative) {
        return b.negative - a.negative;
      }

      return a.score - b.score;
    })[0] ?? null;

  const voterCounts = new Map<string, number>();

  for (const vote of votes) {
    voterCounts.set(
      vote.user_id,
      (voterCounts.get(vote.user_id) ?? 0) + 1
    );
  }

  const mostActiveVoterEntry =
    [...voterCounts.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];

  const mostActiveVoter = mostActiveVoterEntry
    ? profiles.find(
        (item) => item.id === mostActiveVoterEntry[0]
      )
    : undefined;

  const adminName =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") || "Admin";

  const sentimentTotal = upvotes + downvotes;

  const positiveWidth =
    sentimentTotal > 0
      ? (upvotes / sentimentTotal) * 100
      : 0;

  return (
    <main className="min-h-screen bg-gray-100 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-400">
              Rate My Bite
            </p>

            <h1 className="mt-1 text-4xl font-bold tracking-tight">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Overview of users, content, and community activity.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Signed in as {adminName}
            </p>
          </div>

          <LogoutButton />
        </header>

        {/* NAVIGATION */}
        <nav className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/profiles"
            className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">
                👥
              </span>

              <span className="text-gray-300 transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <h2 className="mt-4 font-bold">
              Profiles
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View all registered profiles.
            </p>
          </Link>

          <Link
            href="/content"
            className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">
                🤖
              </span>

              <span className="text-gray-300 transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <h2 className="mt-4 font-bold">
              AI Content
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create, edit, and delete posts.
            </p>
          </Link>

          <Link
            href="/votes"
            className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">
                🔥
              </span>

              <span className="text-gray-300 transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <h2 className="mt-4 font-bold">
              Votes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review community ratings.
            </p>
          </Link>
        </nav>

        {/* TOP STATS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Users
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Posts
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalPosts}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Votes
            </p>

            <p className="mt-2 text-4xl font-bold">
              {totalVotes}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Approval rate
            </p>

            <p className="mt-2 text-4xl font-bold">
              {approvalRate}%
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Votes / post
            </p>

            <p className="mt-2 text-4xl font-bold">
              {averageVotesPerPost}
            </p>
          </div>
        </section>

        {/* SENTIMENT + ACTIVE VOTER */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Community sentiment
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  How the feed is landing
                </h2>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                {totalVotes} ratings
              </span>
            </div>

            <div className="mt-7">
              <div className="flex justify-between text-sm font-semibold">
                <span>
                  🔥 Lit — {upvotes}
                </span>

                <span>
                  🍅 Tomato — {downvotes}
                </span>
              </div>

              <div className="mt-3 flex h-5 overflow-hidden rounded-full bg-red-100">
                <div
                  className="bg-green-500 transition-all"
                  style={{
                    width: `${positiveWidth}%`,
                  }}
                />

                <div
                  className="flex-1 bg-red-400"
                />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {totalVotes === 0
                  ? "No votes yet."
                  : `${approvalRate}% of all ratings are positive.`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Most active voter
            </p>

            {mostActiveVoterEntry ? (
              <>
                <div className="mt-5 flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                    {mostActiveVoter?.avatar_url ? (
                      <img
                        src={mostActiveVoter.avatar_url}
                        alt={getName(mostActiveVoter)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-bold">
                      {getName(mostActiveVoter)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {mostActiveVoterEntry[1]} votes cast
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Activity share
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {totalVotes > 0
                      ? Math.round(
                          (mostActiveVoterEntry[1] /
                            totalVotes) *
                            100
                        )
                      : 0}
                    %
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    of all community votes
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-5 text-gray-500">
                No voting activity yet.
              </p>
            )}
          </div>
        </section>

        {/* POST HIGHLIGHTS */}
        <section className="mt-6">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Content highlights
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Posts worth watching
            </h2>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <PostHighlight
              title="Most voted"
              emoji="📣"
              post={mostVotedPost}
              stat={
                mostVotedPost
                  ? `${mostVotedPost.totalVotes} votes`
                  : "No data"
              }
            />

            <PostHighlight
              title="Most positive"
              emoji="🔥"
              post={mostPositivePost}
              stat={
                mostPositivePost
                  ? `${mostPositivePost.positive} Lit`
                  : "No data"
              }
            />

            <PostHighlight
              title="Most rejected"
              emoji="🍅"
              post={mostRejectedPost}
              stat={
                mostRejectedPost
                  ? `${mostRejectedPost.negative} Tomatoes`
                  : "No data"
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function PostHighlight({
  title,
  emoji,
  post,
  stat,
}: {
  title: string;
  emoji: string;
  post:
    | {
        id: string;
        caption: string;
        imageUrl: string | null;
        totalVotes: number;
        positive: number;
        negative: number;
        score: number;
      }
    | null;
  stat: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {post?.imageUrl ? (
        <div className="h-44 bg-gray-100">
          <img
            src={post.imageUrl}
            alt={title}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center bg-gray-50 text-5xl">
          {emoji}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-500">
            {emoji} {title}
          </p>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {stat}
          </span>
        </div>

        {post ? (
          <>
            <p className="mt-4 line-clamp-3 font-semibold leading-6 text-gray-800">
              “{post.caption}”
            </p>

            <div className="mt-4 flex gap-4 text-xs font-semibold text-gray-500">
              <span>
                🔥 {post.positive}
              </span>

              <span>
                🍅 {post.negative}
              </span>

              <span>
                Total {post.totalVotes}
              </span>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Not enough data yet.
          </p>
        )}
      </div>
    </div>
  );
}