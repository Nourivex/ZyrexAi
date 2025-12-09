import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group w-full border-b border-light-border dark:border-white/10 ${
        isUser ? 'bg-light-bg dark:bg-chat-bg' : 'bg-white dark:bg-chat-input'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 flex gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-sm flex items-center justify-center ${
              isUser ? 'bg-blue-600' : 'bg-green-600'
            }`}
          >
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code: ({ inline, className, children, ...props }: any) => {
                    return !inline ? (
                      <div className="relative group/code">
                        <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <button
                            onClick={handleCopy}
                            className="p-2 rounded bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                            title="Copy code"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-700 dark:text-white" />
                            )}
                          </button>
                        </div>
                        <pre className={className}>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Streaming indicator */}
          {message.isStreaming && (
            <div className="flex gap-1 mt-2">
              <div className="w-2 h-2 bg-gray-400 dark:bg-white/50 rounded-full loading-dot" />
              <div className="w-2 h-2 bg-gray-400 dark:bg-white/50 rounded-full loading-dot" />
              <div className="w-2 h-2 bg-gray-400 dark:bg-white/50 rounded-full loading-dot" />
            </div>
          )}
        </div>

        {/* Copy button for entire message */}
        {!isUser && !message.isStreaming && (
          <div className="flex-shrink-0">
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded hover:bg-light-hover dark:hover:bg-white/10"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-white/70" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
