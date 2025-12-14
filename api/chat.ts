export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check if a specific Workflow ID is provided to act as the model/agent context
    // If OpenAI releases 'chat/completions' support for workflows, this will work immediately.
    // Otherwise, it defaults to gpt-4o-mini.
    const model = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || 'gpt-4o-mini';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model, 
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Fallback: If 'wf_' fails as a model name, try forcing gpt-4o-mini
      if (model.startsWith('wf_') && (response.status === 404 || response.status === 400)) {
         console.warn("Workflow ID not supported as model name, falling back to gpt-4o-mini");
         const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini', 
              messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content
              })),
              stream: true,
            }),
          });
          
          if (!fallbackResponse.ok) {
             const fallbackError = await fallbackResponse.text();
             return new Response(JSON.stringify({ error: fallbackError }), { status: fallbackResponse.status });
          }
          return new Response(fallbackResponse.body, { headers: { 'Content-Type': 'text/event-stream' } });
      }

      return new Response(JSON.stringify({ error: errorText }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}