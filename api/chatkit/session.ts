export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Get credentials from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const workflowId = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), { status: 500 });
    }
    
    if (!workflowId) {
      return new Response(JSON.stringify({ error: 'Missing NEXT_PUBLIC_CHATKIT_WORKFLOW_ID' }), { status: 500 });
    }

    // 2. We need to pass a "user" or "deviceId" usually, but for a simple wrapper we can mock it or generate one.
    // In a real app, this comes from the request body or auth session.
    const { deviceId } = await req.json().catch(() => ({ deviceId: 'default-user' }));

    // 3. Call OpenAI ChatKit Sessions API
    // This strictly follows the "Step 2" fetch implementation provided in instructions.
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: deviceId || 'anonymous-user', 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();

    // 4. Return the client_secret to the frontend
    return new Response(JSON.stringify({ client_secret: data.client_secret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}