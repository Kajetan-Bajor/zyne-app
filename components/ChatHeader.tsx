import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  isNewChat: boolean;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, isNewChat, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onRename(editValue.trim());
      setIsEditing(false);
    } else {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isNewChat) {
    return (
        <div className="w-full h-14 min-h-[56px] flex items-center px-6 md:px-8 bg-transparent shrink-0">
             {/* Empty placeholder to maintain layout height without text */}
        </div>
    );
  }

  return (
    <div className="w-full h-14 min-h-[56px] flex items-center px-6 md:px-8 bg-transparent shrink-0">
      {isEditing ? (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-gemini-surface text-white text-sm px-3 py-1.5 rounded-lg border border-white/20 outline-none focus:border-blue-400 min-w-[200px]"
          />
          <div className="flex items-center gap-1">
            <button 
              onClick={handleSave}
              className="p-1.5 text-green-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Check size={16} />
            </button>
            <button 
              onClick={handleCancel}
              className="p-1.5 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="group flex items-center gap-3">
          <span className="text-base font-medium text-gemini-text truncate max-w-xl">
            {title}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gemini-textSec hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Zmień nazwę"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gemini-textSec hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
              title="Usuń czat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;