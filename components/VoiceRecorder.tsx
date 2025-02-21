'use client';

import { useState, useRef } from 'react';
import { processWithLLM } from '@/utils/llmProcessor';
import { StopIcon, MicrophoneIcon } from '@heroicons/react/24/solid';

interface VoiceRecorderProps {
  onItemConfirmed: (item: { name: string; price: number }) => void;
}

export default function VoiceRecorder({ onItemConfirmed }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentItem, setCurrentItem] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) =>
        chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);

        // Create form data for the audio file
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          // Send audio for transcription
          const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          const { text } = await transcribeResponse.json();

          console.log('Transcript:', text);
          setTranscript(text);

          // Process transcribed text with LLM
          const result = await processWithLLM(text);
          setCurrentItem(result);
        } catch (error) {
          console.error('Error processing audio:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks in the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed && currentItem) {
      onItemConfirmed(currentItem);
    }
    setCurrentItem(null);
    setTranscript('');
    setAudioUrl(null);
  };

  const onReset = () => {
    setTranscript('');
    setAudioUrl(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`
            px-6 py-3 rounded-full font-medium text-white
            transition-all duration-200 transform hover:scale-105
            flex items-center gap-2
            ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }
          `}
        >
          {isRecording ? (
            <>
              <StopIcon className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <MicrophoneIcon className="w-5 h-5" />
              Start Recording
            </>
          )}
        </button>

        {audioUrl && (
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-full text-gray-600 hover:text-gray-800 
              dark:text-gray-300 dark:hover:text-white
              transition-colors duration-200"
          >
            Reset
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="flex justify-center">
          <audio
            src={audioUrl}
            controls
            className="w-full max-w-md rounded-lg shadow"
          />
        </div>
      )}

      {isProcessing && (
        <div className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
          <span>Processing your recording...</span>
        </div>
      )}

      {transcript && currentItem && (
        <div className="mt-4 space-y-4">
          <p>Is this correct?</p>
          <div className="flex items-center gap-2">
            <span>Item: </span>
            <input
              type="text"
              value={currentItem.name}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  name: e.target.value,
                })
              }
              className="border rounded px-2 py-2 w-48 bg-gray-800 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Price: $</span>
            <input
              type="number"
              value={currentItem.price || ''}
              onChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  price: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              className="border rounded px-2 py-2 w-24 bg-gray-800 text-white"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => handleConfirmation(true)}
            >
              Confirm
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => handleConfirmation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
