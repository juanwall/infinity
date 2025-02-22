export async function processWithLLM(
  transcript: string,
): Promise<{ name: string; price: number } | null> {
  try {
    const response = await fetch('/api/process-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: transcript }),
    });

    const data = await response.json();

    if (!data?.name || !data?.price) {
      console.log('No name or price found:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error processing text:', error);
    return null;
  }
}
