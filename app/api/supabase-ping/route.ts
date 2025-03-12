// This keeps supabase from going to an inactive state on the free plan

import { NextResponse } from 'next/server';

import { createClient } from '@/utils/api';

export async function GET() {
  const supabase = await createClient();

  try {
    // Fetch the first row from shopping_items table
    const { error } = await supabase
      .from('shopping_items')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error pinging database:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database pinged successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in supabase-ping:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
