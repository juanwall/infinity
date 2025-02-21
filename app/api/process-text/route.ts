import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text } = await req.json();

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
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return NextResponse.json(
    JSON.parse(completion.choices[0].message.content || '{}'),
  );
}
