import React, { useState } from 'react';
import { ArrowUp, Pencil, X } from 'lucide-react';
import { StarterPrompt } from '../types';

interface WelcomeScreenProps {
  onPromptSelect: (text: string) => void;
  prompts: StarterPrompt[];
  onUpdatePrompt: (prompt: StarterPrompt) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptSelect, prompts, onUpdatePrompt }) => {
  const [editingPrompt, setEditingPrompt] = useState<StarterPrompt | null>(null);

  const handleEditClick = (e: React.MouseEvent, prompt: StarterPrompt) => {
    e.stopPropagation(); // Prevent card click (sending message)
    setEditingPrompt({ ...prompt });
  };

  const handleSave = () => {
    if (editingPrompt) {
      onUpdatePrompt(editingPrompt);
      setEditingPrompt(null);
    }
  };

  const handleChange = (field: keyof StarterPrompt, value: string) => {
    if (editingPrompt) {
      setEditingPrompt({ ...editingPrompt, [field]: value });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-fade-in relative z-0">
        <div className="mb-12 text-left w-full">
          <h1 className="text-4xl md:text-5xl font-medium text-gemini-text mb-3">
            W czym mogę Ci dziś pomóc?
          </h1>
          <h2 className="text-xl md:text-2xl text-gemini-textSec font-light">
            Wybierz temat poniżej lub wpisz własne zapytanie.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => onPromptSelect(prompt.prompt || prompt.subtitle)}
              className="group relative flex flex-col justify-between p-5 h-48 rounded-2xl bg-gemini-surface hover:bg-gemini-hover transition-all duration-300 border border-transparent hover:border-white/10 text-left cursor-pointer"
            >
              <div className="space-y-2 overflow-hidden">
                  <span className="text-gemini-text font-medium line-clamp-2">{prompt.title}</span>
                  <p className="text-sm text-gemini-textSec leading-relaxed line-clamp-4">{prompt.subtitle}</p>
              </div>
              
              <div className="absolute bottom-4 right-4 flex gap-2">
                 {/* Edit Button */}
                 <button 
                   onClick={(e) => handleEditClick(e, prompt)}
                   className="
                    w-8 h-8
                    bg-gemini-surface border border-white/20 text-white
                    rounded-full 
                    flex items-center justify-center 
                    opacity-0 translate-y-2 scale-90
                    group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                    hover:bg-white hover:text-black hover:border-transparent
                    transition-all duration-300 ease-out 
                    shadow-lg
                    z-10
                   "
                   title="Edytuj"
                 >
                    <Pencil size={14} />
                 </button>

                 {/* Send Button */}
                 <div className="
                    w-8 h-8
                    bg-white text-black 
                    rounded-full 
                    flex items-center justify-center 
                    opacity-0 translate-y-2 scale-90
                    group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                    transition-all duration-300 ease-out 
                    shadow-lg
                  ">
                      <ArrowUp size={18} strokeWidth={2.5} />
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#1e1e1e] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-medium text-white">Edytuj kafelek</h3>
              <button 
                onClick={() => setEditingPrompt(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Tytuł</label>
                <input 
                  type="text"
                  value={editingPrompt.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Opis (widoczny na kafelku)</label>
                <textarea 
                  value={editingPrompt.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  rows={2}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none input-scrollbar"
                />
              </div>

              {/* Prompt Field */}
              <div className="space-y-1">
                 <label className="text-xs font-medium text-white/60 uppercase tracking-wide">Prompt (wysyłany do AI)</label>
                 <textarea 
                   value={editingPrompt.prompt}
                   onChange={(e) => handleChange('prompt', e.target.value)}
                   rows={6}
                   className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none input-scrollbar"
                 />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#1e1e1e]">
              <button 
                onClick={() => setEditingPrompt(null)}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Zamknij
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
              >
                Zapisz
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default WelcomeScreen;