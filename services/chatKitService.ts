import { Message } from "../types";

/**
 * SERVICE LAYER (REAL BACKEND)
 * 
 * Connects to the Vercel Edge Function at /api/chat
 * Parses server-sent events (SSE) from OpenAI.
 */

export async function* sendMessageToAgentStream(
  messages: Message[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No response body");

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const text = json.choices?.[0]?.delta?.content || '';
            if (text) yield text;
          } catch (e) {
            console.warn("Error parsing chunk", e);
          }
        }
      }
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    console.error("Stream error:", error);
    yield `\n[Błąd połączenia: ${error.message}]`;
  }
}