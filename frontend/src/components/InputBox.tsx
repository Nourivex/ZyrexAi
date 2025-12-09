import { useState, useRef, useEffect } from 'react';
import { Send, Square, Database, Wrench } from 'lucide-react';

interface InputBoxProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  disabled?: boolean;
  ragEnabled?: boolean;
  toolsAvailable?: string[];
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  disabled = false,
  ragEnabled = false,
  toolsAvailable = [],
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <div className="border-t border-light-border dark:border-white/10 bg-light-bg dark:bg-chat-bg p-4">
      <div className="max-w-3xl mx-auto">
        {/* Context Indicators */}
        {(ragEnabled || toolsAvailable.length > 0) && (
          <div className="flex items-center gap-2 mb-2 px-1">
            {ragEnabled && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30">
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">RAG Active</span>
              </div>
            )}
            {toolsAvailable.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30">
                <Wrench className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {toolsAvailable.length} Tool{toolsAvailable.length !== 1 ? 's' : ''} Available
                </span>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={disabled || isLoading}
            className="w-full bg-white dark:bg-chat-input text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 rounded-lg px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-white/20 border border-gray-300 dark:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ maxHeight: '200px' }}
          />
          
          <div className="absolute right-2 bottom-2">
            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                title="Stop generating"
              >
                <Square className="w-5 h-5 text-gray-700 dark:text-white" fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!message.trim() || disabled}
                className="p-2 rounded-lg bg-purple-600 dark:bg-white/10 hover:bg-purple-700 dark:hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 dark:disabled:hover:bg-white/10"
                title="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </form>
        
        <div className="text-center text-xs text-gray-500 dark:text-white/40 mt-3">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300">Enter</kbd> to send,{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default InputBox;
