"use client";

import { useState, useRef } from "react";
import { processWithLLM } from "@/utils/llmProcessor";

interface VoiceRecorderProps {
  onItemConfirmed: (item: { name: string; price: number }) => void;
}

export default function VoiceRecorder({ onItemConfirmed }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentItem, setCurrentItem] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

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
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsProcessing(true);

        // Create form data for the audio file
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          // Send audio for transcription
          const transcribeResponse = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const { text } = await transcribeResponse.json();

          console.log("Transcript:", text);
          setTranscript(text);

          // Process transcribed text with LLM
          const result = await processWithLLM(text);
          setCurrentItem(result);
        } catch (error) {
          console.error("Error processing audio:", error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
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
    setTranscript("");
  };

  return (
    <div className="mb-8">
      <button
        className={`p-4 rounded-full ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white mb-4`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        disabled={isProcessing}
      >
        {isRecording
          ? "Recording..."
          : isProcessing
            ? "Processing..."
            : "Hold to Record"}
      </button>

      {transcript && <p className="mb-4">Transcript: {transcript}</p>}

      {currentItem && (
        <div className="mb-4">
          <p>Is this correct?</p>
          <p>Item: {currentItem.name}</p>
          <div className="flex items-center gap-2">
            <p>Price: $</p>
            {isEditingPrice ? (
              <input
                type="number"
                value={currentItem.price}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="border rounded px-2 py-1 w-24"
                autoFocus
                onBlur={() => setIsEditingPrice(false)}
              />
            ) : (
              <p
                className="cursor-pointer"
                onClick={() => setIsEditingPrice(true)}
              >
                {currentItem.price}
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => handleConfirmation(true)}
            >
              Yes
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => handleConfirmation(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
