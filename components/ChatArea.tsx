import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { User, FileText, Image as ImageIcon } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Four-pointed star icon (Gemini-like)
  const GeminiStarIcon = ({ className = "" }: { className?: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );

  // Determine if we should show the loading skeleton
  // We only show it if isLoading is true AND the last message is NOT from the assistant.
  // If the last message IS from the assistant, it means we have already added the bubble 
  // and are streaming text into it, so the separate loading indicator is redundant (and causes the "double message" glitch).
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const showLoadingSkeleton = isLoading && (!lastMessage || lastMessage.role !== 'assistant');

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 animate-slide-up ${msg.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}
          >
            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden
              ${msg.role === 'assistant' ? 'bg-gradient-to-br from-green-400 to-cyan-400 p-1.5' : 'bg-white/20 text-white'}
            `}>
              {msg.role === 'assistant' ? (
                <GeminiStarIcon className="w-full h-full text-white" />
              ) : (
                <User size={16} />
              )}
            </div>

            {/* Bubble Container */}
            <div className={`
              flex flex-col max-w-[85%] md:max-w-[80%] min-w-0 space-y-1
              ${msg.role === 'user' ? 'items-end' : 'items-start'}
            `}>
              
              {/* Attachments if any */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className={`flex flex-wrap gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gemini-surface border border-white/10 text-xs text-gemini-text break-all">
                        {file.type === 'image' ? <ImageIcon size={12}/> : <FileText size={12}/>}
                        <span className="truncate max-w-[150px]">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Content */}
              <div className={`
                rounded-2xl text-base leading-relaxed text-left
                break-words [overflow-wrap:anywhere]
                ${msg.role === 'user' 
                  ? 'bg-gemini-surface text-white rounded-tr-sm px-4 py-2.5 md:px-5 md:py-3' 
                  : 'text-gemini-text w-full px-0 py-1 min-h-[24px]'
                }
              `}>
                <span className="whitespace-pre-wrap">{msg.content}</span>
                {/* Blinking cursor effect for active assistant message */}
                {msg.role === 'assistant' && isLoading && messages[messages.length - 1].id === msg.id && (
                    <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-white/70 animate-pulse rounded-sm"/>
                )}
              </div>
              
              {/* Time */}
              <div className={`text-xs text-white/40 ${msg.role === 'user' ? 'px-1' : 'px-0'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {showLoadingSkeleton && (
          <div className="flex gap-3 items-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center animate-pulse p-1.5">
                <GeminiStarIcon className="w-full h-full text-white opacity-90" />
             </div>
             <div className="px-0 py-3">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatArea;