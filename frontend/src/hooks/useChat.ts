import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Message, ChatResponse, Session } from '../types';

interface UseChatOptions {
  sessionId?: string;
  characterId?: string;
}

export const useChat = (options: UseChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const isStreamingRef = useRef(false);

  // Load session messages on mount or when sessionId changes
  useEffect(() => {
    if (options.sessionId) {
      loadSessionMessages(options.sessionId);
    }
  }, [options.sessionId]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const [session, sessionMessages] = await Promise.all([
        apiService.getSession(sessionId),
        apiService.getSessionMessages(sessionId),
      ]);
      setCurrentSession(session);
      setMessages(sessionMessages);
    } catch (err) {
      console.error('Failed to load session messages:', err);
      setError('Failed to load conversation history');
    }
  };

  const sendMessage = useCallback(
    async (content: string, useStreaming: boolean = true) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setStreamingMessage('');

      try {
        if (useStreaming) {
          // Streaming response
          isStreamingRef.current = true;
          let fullResponse = '';

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true,
          };

          setMessages((prev) => [...prev, assistantMessage]);

          await apiService.sendMessageStream(
            {
              message: content.trim(),
              session_id: options.sessionId,
              character_id: options.characterId,
              stream: true,
            },
            // onChunk
            (chunk: string) => {
              if (isStreamingRef.current) {
                fullResponse += chunk;
                setStreamingMessage(fullResponse);
                
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = fullResponse;
                  }
                  return newMessages;
                });
              }
            },
            // onComplete
            () => {
              isStreamingRef.current = false;
              setStreamingMessage('');
              setIsLoading(false);
              
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.isStreaming = false;
                }
                return newMessages;
              });
            },
            // onError
            (err: Error) => {
              isStreamingRef.current = false;
              setStreamingMessage('');
              setIsLoading(false);
              setError(err.message || 'Failed to get response');
              
              // Remove the streaming message if it failed
              setMessages((prev) => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.isStreaming) {
                  newMessages.pop();
                }
                return newMessages;
              });
            }
          );
        } else {
          // Non-streaming response
          let response: ChatResponse;

          if (options.characterId) {
            response = await apiService.sendRoleplayMessage(
              options.characterId,
              content.trim(),
              options.sessionId
            );
          } else {
            response = await apiService.sendMessage({
              message: content.trim(),
              session_id: options.sessionId,
              stream: false,
            });
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.response,
            timestamp: response.timestamp,
          };

          setMessages((prev) => [...prev, assistantMessage]);

          if (response.session_id && !currentSession) {
            const session = await apiService.getSession(response.session_id);
            setCurrentSession(session);
          }
        }
      } catch (err: any) {
        console.error('Failed to send message:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to send message');
      } finally {
        if (!useStreaming) {
          setIsLoading(false);
        }
      }
    },
    [options.sessionId, options.characterId, isLoading, currentSession]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSession(null);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    isStreamingRef.current = false;
    setIsLoading(false);
    setStreamingMessage('');
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentSession,
    streamingMessage,
    sendMessage,
    clearMessages,
    stopStreaming,
    setMessages,
  };
};

export default useChat;
