import React from 'react';
import { Header } from '../components/Header';
import { ChatArea } from '../components/ChatArea';
import { InputBox } from '../components/InputBox';
import type { Message, Character } from '../types';

interface ChatPageProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  selectedCharacter: Character | null;
  onSendMessage: (message: string, images?: string[]) => void;
  onStopStreaming: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  messages,
  isLoading,
  error,
  selectedCharacter,
  onSendMessage,
  onStopStreaming,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header selectedCharacter={selectedCharacter} />
      <ChatArea messages={messages} isLoading={isLoading} error={error} />
      <InputBox
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        onStop={onStopStreaming}
      />
    </div>
  );
};
