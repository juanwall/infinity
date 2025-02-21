import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteHandlerClient<Database>(
    { cookies },
    {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
    },
  );

  try {
    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/items/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
