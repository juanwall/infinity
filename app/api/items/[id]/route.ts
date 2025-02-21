import { NextResponse } from 'next/server';

import { createClient } from '@/utils/api';

interface IDeleteParams {
  id: string;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<IDeleteParams> },
) {
  const { id } = await params;

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/items/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
