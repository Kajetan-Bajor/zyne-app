import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip, Image as ImageIcon, X, Square } from 'lucide-react';
import { FileAttachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments: FileAttachment[]) => void;
  isLoading: boolean;
  onStop?: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading, onStop }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      setAttachments(prev => [...prev, { name: file.name, type }]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full bg-gemini-bg sticky bottom-0 z-10 px-4 pb-6 pt-2">
      <div className="w-full max-w-3xl mx-auto">
        
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gemini-surface px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-xs text-gemini-textSec max-w-[150px] truncate">{att.name}</span>
                      <button 
                        onClick={() => removeAttachment(idx)} 
                        className="text-white/40 hover:text-white"
                        title="Usuń załącznik"
                      >
                          <X size={14} />
                      </button>
                  </div>
              ))}
          </div>
        )}

        <div className="relative flex items-center gap-2 bg-gemini-surface rounded-3xl p-2 pl-4 border border-transparent focus-within:border-white/20 transition-colors shadow-lg">
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gemini-textSec hover:text-white hover:bg-gemini-hover rounded-full transition-colors"
            title="Dodaj załącznik"
            disabled={isLoading}
          >
            <Paperclip size={20} />
          </button>
          <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Wpisz wiadomość..."
            disabled={isLoading}
            className="flex-1 w-full bg-transparent text-gemini-text placeholder-white/40 resize-none py-3 pr-4 max-h-[200px] outline-none input-scrollbar disabled:opacity-50"
            rows={1}
          />

          {isLoading ? (
            <button 
              onClick={onStop}
              title="Zatrzymaj generowanie"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-200 shrink-0"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button 
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              title="Wyślij wiadomość"
              className={`
                flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shrink-0
                ${(text.trim() || attachments.length > 0) 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-[#3f3f3f] text-[#6b6b6b] cursor-not-allowed'}
              `}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="flex justify-center mt-3">
           <a href="https://www.zyne.chat" target="_blank" rel="noopener noreferrer">
               <img 
                  src="https://static.wixstatic.com/shapes/d25ad0_c3cce434facb4103b84b287fd4a0aa6f.svg" 
                  alt="Zyne Logo"
                  className="h-5 opacity-30 hover:opacity-50 transition-opacity duration-300"
               />
           </a>
        </div>
      </div>
    </div>
  );
};

export default InputArea;