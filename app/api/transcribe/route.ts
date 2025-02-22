import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/api';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile } from 'fs/promises';

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

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const originalMimeType = formData.get('mimeType') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 },
      );
    }

    console.log('Received audio file type:', originalMimeType); // Debug log

    // Only convert if not already webm
    if (originalMimeType !== 'audio/webm') {
      const arrayBuffer = await audioFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create temporary file paths
      const tempInputPath = join(tmpdir(), `input-${Date.now()}`);
      const tempOutputPath = join(tmpdir(), `output-${Date.now()}.webm`);

      // Write the input file
      await writeFile(tempInputPath, buffer);

      // Convert to webm using fluent-ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .toFormat('webm')
          .outputOptions('-c:a libopus')
          .save(tempOutputPath)
          .on('end', resolve)
          .on('error', reject);
      });

      // Read the converted file
      const convertedBuffer = await readFile(tempOutputPath);

      // Create a new File object from the converted buffer
      const convertedFile = new File([convertedBuffer], 'audio.webm', {
        type: 'audio/webm',
      });

      // Use the converted file for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: convertedFile,
        model: 'whisper-1',
        response_format: 'json',
      });

      return NextResponse.json({ text: transcription.text });
    }

    // If already webm, proceed as normal
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'json',
    });

    console.log('Transcription:', transcription.text);

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Error processing audio: ' + (error as Error).message },
      { status: 500 },
    );
  }
}
