import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost =
        request.headers.get("x-forwarded-host");

      if (
        process.env.NODE_ENV === "production" &&
        forwardedHost
      ) {
        return NextResponse.redirect(
          `https://${forwardedHost}/`
        );
      }

      return NextResponse.redirect(`${origin}/`);
    }

    console.error(
      "Admin OAuth code exchange failed:",
      error.message
    );
  }

  return NextResponse.redirect(`${origin}/`);
}