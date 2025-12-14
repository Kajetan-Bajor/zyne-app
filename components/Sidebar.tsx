import React from 'react';
import { SquarePen, MessageSquare, PanelLeft, Settings, HelpCircle, History } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  history: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
}

// Reusable component for consistent text animation
// Using a div ensures transform properties work correctly compared to inline spans
const AnimatedText = ({ 
  isOpen, 
  children, 
  className = "" 
}: { 
  isOpen: boolean; 
  children?: React.ReactNode; 
  className?: string; 
}) => (
  <div 
    className={`
      whitespace-nowrap transition-all duration-500 ease-in-out
      ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
      ${className}
    `}
  >
    {children}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  history, 
  currentChatId, 
  onSelectChat
}) => {
  // Common class for the icon container to ensure perfect vertical alignment
  const iconBoxClass = "w-12 h-10 flex items-center justify-center shrink-0";
  
  // Base class for all interactive rows
  const itemBaseClass = `
    group relative flex items-center w-full rounded-lg transition-colors cursor-pointer select-none mb-1
    overflow-hidden
  `;

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gemini-sidebar
        border-r border-white/15
        transition-all duration-500 ease-in-out
        px-2 pt-2 pb-6
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 md:w-16 md:translate-x-0 md:opacity-100'}
      `}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-2">
        {/* Toggle Button */}
        <button 
          onClick={onToggle}
          className={`${itemBaseClass} hover:bg-gemini-hover text-white/70 hover:text-white`}
          title={isOpen ? "Zwiń pasek" : "Rozwiń pasek"}
        >
          <div className={iconBoxClass}>
            <PanelLeft size={20} />
          </div>
          <AnimatedText isOpen={isOpen} className="text-sm">Zwiń pasek</AnimatedText>
        </button>
        
        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className={`${itemBaseClass} hover:bg-gemini-hover text-white/70 hover:text-white`}
          title="Nowy chat"
        >
           <div className={iconBoxClass}>
            <SquarePen size={20} />
          </div>
          <AnimatedText isOpen={isOpen} className="text-sm">Nowy chat</AnimatedText>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide -mx-2 px-2">
        <div className="py-2 overflow-hidden">
             <AnimatedText isOpen={isOpen} className="px-4 text-xs font-medium uppercase tracking-wider text-white/40">
                TWOJE CHATY
             </AnimatedText>
        </div>
        
        {history.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`
              ${itemBaseClass}
              ${currentChatId === chat.id 
                ? 'bg-gemini-surface text-white' 
                : 'hover:bg-gemini-hover text-white/70 hover:text-white'
              }
            `}
          >
            <div className={iconBoxClass}>
               <MessageSquare size={20} />
            </div>
            
            <div className="flex-1 min-w-0 pr-2 overflow-hidden">
                <AnimatedText isOpen={isOpen}>
                    <div className="relative">
                       <span 
                          /* 
                             removed 'truncate' (ellipsis) and used overflow-hidden + whitespace-nowrap 
                             to clip text cleanly during animation without jumping dots.
                          */
                          className="block text-sm whitespace-nowrap overflow-hidden" 
                          title={chat.title}
                       >
                          {chat.title || "Nowy chat"}
                      </span>
                    </div>
                </AnimatedText>
            </div>
          </div>
        ))}
        
        {history.length === 0 && isOpen && (
            <div className="text-center py-10 px-4 overflow-hidden">
                <AnimatedText isOpen={isOpen} className="flex flex-col items-center text-sm text-white/40">
                    <History className="mb-2 opacity-50" size={24}/>
                    <span>Brak historii</span>
                </AnimatedText>
            </div>
        )}
      </div>

      {/* Footer: Settings / Help */}
      <div className="mt-auto pt-2 space-y-1 border-t border-white/5">
        <button 
          className={`${itemBaseClass} hover:bg-gemini-hover text-white/70 hover:text-white`}
          title="Pomoc"
        >
          <div className={iconBoxClass}>
             <HelpCircle size={20} />
          </div>
          <AnimatedText isOpen={isOpen} className="text-sm">Pomoc</AnimatedText>
        </button>
        
        <button 
          className={`${itemBaseClass} hover:bg-gemini-hover text-white/70 hover:text-white`}
          title="Ustawienia"
        >
          <div className={iconBoxClass}>
             <Settings size={20} />
          </div>
          <AnimatedText isOpen={isOpen} className="text-sm">Ustawienia</AnimatedText>
        </button>
        
        {/* Footer Text */}
        <div className="mt-2 mb-2 px-4 overflow-hidden">
            <AnimatedText isOpen={isOpen} className="text-[10px] text-white/40 select-none">
                Agent Zyne.chat • Połączony
            </AnimatedText>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;