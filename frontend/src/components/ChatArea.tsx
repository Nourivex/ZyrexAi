import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import type { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, error, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [thinkingSteps, setThinkingSteps] = useState<Array<{ tool_name?: string; status?: string; query?: string; timestamp: number }>>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Listen for thinking events (this would be integrated with SSE stream)
  useEffect(() => {
    if (isLoading) {
      // Simulate thinking detection for demo
      // In real implementation, this comes from SSE stream
      const timeout = setTimeout(() => {
        setIsThinking(true);
      }, 100);

      return () => clearTimeout(timeout);
    } else {
      setIsThinking(false);
      // Keep steps visible after loading completes
      setTimeout(() => setThinkingSteps([]), 3000);
    }
  }, [isLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-white/40 px-4">
          <div className="max-w-2xl text-center space-y-6">
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white/90">ZyrexAi</h1>
            <p className="text-lg">
              Your personal AI assistant powered by advanced language models
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
              <div className="bg-white dark:bg-chat-input rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-chat-hover transition-colors cursor-pointer border border-gray-200 dark:border-transparent">
                <div className="text-gray-900 dark:text-white/90 font-medium mb-2">💡 Examples</div>
                <div className="text-sm text-gray-600 dark:text-white/60">
                  "Explain quantum computing in simple terms"
                </div>
              </div>
              
              <div className="bg-white dark:bg-chat-input rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-chat-hover transition-colors cursor-pointer border border-gray-200 dark:border-transparent">
                <div className="text-gray-900 dark:text-white/90 font-medium mb-2">⚡ Capabilities</div>
                <div className="text-sm text-gray-600 dark:text-white/60">
                  Code generation, roleplay, RAG search, and more
                </div>
              </div>
              
              <div className="bg-white dark:bg-chat-input rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-chat-hover transition-colors cursor-pointer border border-gray-200 dark:border-transparent">
                <div className="text-gray-900 dark:text-white/90 font-medium mb-2">🎭 Characters</div>
                <div className="text-sm text-gray-600 dark:text-white/60">
                  Chat with different AI personalities
                </div>
              </div>
              
              <div className="bg-white dark:bg-chat-input rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-chat-hover transition-colors cursor-pointer border border-gray-200 dark:border-transparent">
                <div className="text-gray-900 dark:text-white/90 font-medium mb-2">🛠️ Tools</div>
                <div className="text-sm text-gray-600 dark:text-white/60">
                  Web search, file reading, system info, and RAG
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Thinking Indicator */}
          {(isThinking || thinkingSteps.length > 0) && (
            <ThinkingIndicator steps={thinkingSteps} isThinking={isThinking} />
          )}
          
          {error && (
            <div className="w-full bg-red-500/10 border-b border-red-500/20">
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-red-500 flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-red-400">Error</div>
                    <div className="text-red-300/80 text-sm mt-1">{error}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatArea;
