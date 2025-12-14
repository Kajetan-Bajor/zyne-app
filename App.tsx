import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import ChatHeader from './components/ChatHeader';
import { Message, ChatSession, FileAttachment, StarterPrompt } from './types';
import { STARTER_PROMPTS } from './constants';
import { sendMessageToAgentStream } from './services/chatKitService';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [prompts, setPrompts] = useState<StarterPrompt[]>(STARTER_PROMPTS);
  const [isLoading, setIsLoading] = useState(false);

  // Ref to hold the AbortController for the current request
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Ref to track the current chat ID for async operations (fixes state stale closure issues)
  const currentChatIdRef = useRef<string | null>(null);

  // Keep the ref in sync with state
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history from local storage", e);
      }
    }

    const savedPrompts = localStorage.getItem('starterPrompts');
    if (savedPrompts) {
      try {
        setPrompts(JSON.parse(savedPrompts));
      } catch (e) {
        console.error("Failed to parse starter prompts from local storage", e);
      }
    }
  }, []);

  // Save to LocalStorage on Change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('starterPrompts', JSON.stringify(prompts));
  }, [prompts]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    handleStop(); // Ensure any running generation is stopped
  };

  const handleSelectChat = (id: string) => {
    const selectedChat = history.find(chat => chat.id === id);
    if (selectedChat) {
        setCurrentChatId(id);
        setMessages(selectedChat.messages);
    }
  };

  const handleDeleteChat = (id: string) => {
    setHistory(prev => prev.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setHistory(prev => prev.map(chat => 
      chat.id === id ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleUpdatePrompt = (updatedPrompt: StarterPrompt) => {
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (text: string, attachments: FileAttachment[]) => {
    const timestamp = Date.now();
    const newUserMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: timestamp,
      attachments
    };

    let activeChatId = currentChatId;
    let contextMessages: Message[] = [];

    if (!activeChatId) {
        activeChatId = generateId();
        setCurrentChatId(activeChatId);
        // IMPORTANT: Manually update ref immediately so async callbacks below see it as active
        // before the next render cycle updates the effect.
        currentChatIdRef.current = activeChatId;
        
        contextMessages = [newUserMsg];
        setMessages(contextMessages);

        const newChatSession: ChatSession = {
            id: activeChatId,
            title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
            messages: contextMessages,
            updatedAt: timestamp
        };
        setHistory(prev => [newChatSession, ...prev]);

    } else {
        const previousMessages = activeChatId === currentChatId 
            ? messages 
            : (history.find(c => c.id === activeChatId)?.messages || []);

        contextMessages = [...previousMessages, newUserMsg];

        setMessages(prev => {
            if (activeChatId === currentChatIdRef.current) return [...prev, newUserMsg];
            return prev;
        });
        
        setHistory(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
                return {
                    ...chat,
                    messages: [...chat.messages, newUserMsg],
                    updatedAt: timestamp
                };
            }
            return chat;
        }));
    }

    // Abort previous if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    try {
      const responseTimestamp = Date.now();
      
      // Use unique ID generator to prevent key collisions with user msg (if fast)
      const newAgentMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: responseTimestamp
      };

      setMessages(prev => {
          // Use Ref for current check to handle new chat transition correctly
          if (activeChatId === currentChatIdRef.current) return [...prev, newAgentMsg];
          return prev;
      });

      let accumulatedResponse = "";
      // Pass the signal
      const stream = sendMessageToAgentStream(contextMessages, controller.signal);

      for await (const chunk of stream) {
          accumulatedResponse += chunk;
          
          setMessages(prev => {
            // Check if user is still viewing the chat we are updating
            if (activeChatId !== currentChatIdRef.current) return prev; 
            
            // Find index of the message we are streaming to
            const msgIndex = prev.findIndex(m => m.id === newAgentMsg.id);
            
            if (msgIndex !== -1) {
                 const newMessages = [...prev];
                 newMessages[msgIndex] = { ...newMessages[msgIndex], content: accumulatedResponse };
                 return newMessages;
            } else {
                return prev;
            }
          });
      }

      setHistory(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
            const updatedMessages = [...contextMessages, { ...newAgentMsg, content: accumulatedResponse }];
            
            return {
                ...chat,
                messages: updatedMessages,
                updatedAt: responseTimestamp
            };
        }
        return chat;
      }));

    } catch (error) {
      console.error("Critical failure in sendMessage flow", error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const currentChat = history.find(c => c.id === currentChatId);
  const chatTitle = currentChat ? currentChat.title : "Nowy chat";

  return (
    <div className="flex h-screen bg-gemini-bg text-gemini-text overflow-hidden font-sans">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        history={history}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />

      <main 
        className={`
          flex-1 flex flex-col h-full transition-all duration-500 ease-in-out
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}
        `}
      >
        {!isSidebarOpen && (
             <div className="absolute top-4 left-4 z-20 md:hidden">
                 <button 
                  onClick={handleToggleSidebar} 
                  className="p-2 bg-gemini-surface rounded-full"
                  title="Otwórz menu"
                 >
                    <span className="sr-only">Otwórz menu</span>
                     <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 </button>
             </div>
        )}

        <ChatHeader 
            title={chatTitle}
            isNewChat={currentChatId === null}
            onRename={(newTitle) => currentChatId && handleRenameChat(currentChatId, newTitle)}
            onDelete={() => currentChatId && handleDeleteChat(currentChatId)}
        />

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen 
              onPromptSelect={(txt) => handleSendMessage(txt, [])} 
              prompts={prompts}
              onUpdatePrompt={handleUpdatePrompt}
            />
          ) : (
            <ChatArea messages={messages} isLoading={isLoading} />
          )}
        </div>

        <InputArea 
            onSend={handleSendMessage} 
            isLoading={isLoading} 
            onStop={handleStop}
        />
      </main>
    </div>
  );
};

export default App;