import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { useChat } from './hooks/useChat';
import { apiService } from './services/api';
import type { Character } from './types';

// Main Layout Component with Sidebar
function MainLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const {
    messages,
    isLoading,
    error,
    currentSession,
    sendMessage,
    clearMessages,
    stopStreaming,
  } = useChat({
    sessionId: currentSessionId || undefined,
    characterId: selectedCharacter?.id ? String(selectedCharacter.id) : undefined,
  });

  const handleNewChat = () => {
    clearMessages();
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
    navigate('/');
  };

  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    navigate('/');
  };

  const handleSelectCharacter = (character: Character | null) => {
    setSelectedCharacter(character);
  };

  const handleSendMessage = (message: string, images?: string[]) => {
    // TODO: Integrate images with sendMessage when backend supports it
    sendMessage(message, true);
    
    if (!currentSessionId && currentSession) {
      setCurrentSessionId(currentSession.id);
    }

    // Log images for now (will be integrated with backend)
    if (images && images.length > 0) {
      console.log(`📸 Sending ${images.length} image(s) with message`);
    }
  };

  const handleCreateCharacter = () => {
    navigate('/character/create');
  };

  const handleSaveCharacter = async (characterData: Partial<Character>) => {
    try {
      await apiService.createCharacter(characterData);
      navigate('/');
    } catch (error) {
      console.error('Failed to create character:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-chat-bg overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onSelectCharacter={handleSelectCharacter}
        onCreateCharacter={handleCreateCharacter}
        currentSessionId={currentSessionId}
        selectedCharacter={selectedCharacter}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route
            path="/"
            element={
              <ChatPage
                messages={messages}
                isLoading={isLoading}
                error={error}
                selectedCharacter={selectedCharacter}
                onSendMessage={handleSendMessage}
                onStopStreaming={stopStreaming}
              />
            }
          />
          <Route
            path="/character/create"
            element={
              <CharacterCreationPage
                onBack={() => navigate('/')}
                onSave={handleSaveCharacter}
              />
            }
          />
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

// App Component with Router Provider
export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

