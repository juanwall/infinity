import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/auth:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
