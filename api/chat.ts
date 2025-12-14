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
    
    // Retrieve the Workflow ID from env.
    // The user explicitly wants to use the Workflow ID (starting with 'wf_') 
    // to connect to their multi-agent setup.
    // Fallback to 'gpt-4o-mini' if no workflow ID is provided.
    const model = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || 'gpt-4o-mini';

    console.log(`[API] Using model/workflow: ${model}`);

    // Create the chat completion stream
    // We pass the 'wf_' ID directly as the model parameter.
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    // Convert the OpenAI stream to a readable stream for the frontend
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
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
