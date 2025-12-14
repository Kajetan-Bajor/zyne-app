export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  type: 'image' | 'file';
  url?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface StarterPrompt {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}