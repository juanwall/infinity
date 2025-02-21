export async function processWithLLM(transcript: string) {
  const response = await fetch("/api/process-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: transcript }),
  });

  const data = await response.json();
  return data;
}
