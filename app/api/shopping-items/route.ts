import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

// GET endpoint to fetch items
export async function GET() {
  const supabase = createRouteHandlerClient<Database>(
    { cookies },
    {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
    },
  );

  try {
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/shopping-items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST endpoint to add new item
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>(
    { cookies },
    {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
    },
  );

  try {
    const body = await request.json();
    const { name, price } = body;

    const { error } = await supabase.from("shopping_items").insert([
      {
        name,
        price,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch and return updated list
    const { data: updatedData } = await supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: false });

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Error in POST /api/shopping-items:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
