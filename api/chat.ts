import { OpenAI } from 'openai';

export const config = {
  runtime: 'edge',
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();
    
    // Pobieramy ID Workflow z enviroment variables.
    // Zgodnie z Twoim wymaganiem, nie ustawiamy żadnego fallbacku (np. gpt-4o).
    // Agent ma działać wyłącznie na podstawie ID Workflow.
    const model = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;

    if (!model) {
      throw new Error("Brak zdefiniowanego Workflow ID (NEXT_PUBLIC_CHATKIT_WORKFLOW_ID)");
    }

    // Nie wstrzykujemy tutaj żadnego System Prompt.
    // Cała logika, instrukcje i zachowanie agenta są zdefiniowane w samym Workflow po stronie OpenAI.
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    // Konwersja strumienia OpenAI na ReadableStream dla frontendu
    const stream = response.toReadableStream();

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
