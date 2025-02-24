import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

import { createClient } from '@/utils/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 },
      );
    }

    let fileToTranscribe = audioFile;

    if (audioFile.type !== 'audio/webm') {
      if (!cloudinary.config().api_key) {
        return NextResponse.json(
          {
            error:
              'Cloudinary is not configured. Cannot convert audio to WebM.',
          },
          { status: 500 },
        );
      }

      fileToTranscribe = await convertToWebm(audioFile);
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fileToTranscribe,
      model: 'whisper-1',
      response_format: 'json',
    });

    console.log('transcription', transcription);

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Error processing audio: ' + (error as Error).message },
      { status: 500 },
    );
  }
}

const convertToWebm = async (file: File): Promise<File> => {
  try {
    console.log('Converting to WebM via Cloudinary');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'video',
            format: 'webm',
            audio_codec: 'opus',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    const webmResponse = await fetch((uploadResponse as any).secure_url);
    const webmBlob = await webmResponse.blob();
    const webmFile = new File([webmBlob], 'audio.webm', { type: 'audio/webm' });

    await cloudinary.uploader.destroy((uploadResponse as any).public_id, {
      resource_type: 'video',
    });

    return webmFile;
  } catch (error) {
    console.error('Error converting to WebM:', error);
    throw error;
  }
};
