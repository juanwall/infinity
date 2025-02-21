import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [
        {
          role: 'system',
          content:
            "You are a helpful assistant that extracts shopping items and their prices from text. You should estimate the price in USD based on the item name. Return only a JSON object with 'name' and 'price' properties.",
        },
        {
          role: 'user',
          content: text.slice(0, 200),
        },
      ],
      response_format: { type: 'json_object' },
    });

    return NextResponse.json(
      JSON.parse(completion.choices[0].message.content || '{}'),
    );
  } catch (error) {
    console.error('Error in POST /api/process-text:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
