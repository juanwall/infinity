import { NextResponse } from 'next/server';

import { createClient } from '@/utils/api';

export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/shopping-items:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, price } = body;

    const { error } = await supabase.from('shopping_items').insert([
      {
        name,
        price,
        created_at: new Date().toISOString(),
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error('Error inserting item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch and return updated list
    const { data: updatedData } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json(updatedData);
  } catch (error) {
    console.error('Error in POST /api/shopping-items:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
