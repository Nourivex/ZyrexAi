import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  LogOut,
  Bot,
  ChevronDown,
  Pin,
  PinOff,
  LayoutPanelLeft,
} from 'lucide-react';
import { Logo } from './Logo';
import { apiService } from '../services/api';
import { CharacterModal } from './CharacterModal';
import { SettingsModal } from './SettingsModal';
import type { Session, Character } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onSelectCharacter: (character: Character | null) => void;
  onCreateCharacter?: () => void;
  currentSessionId: string | null;
  selectedCharacter: Character | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewChat,
  onSelectSession,
  onSelectCharacter,
  onCreateCharacter,
  currentSessionId,
  selectedCharacter,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionsData, charactersData] = await Promise.all([
        apiService.getSessions().catch(() => []), // Return empty array on error
        apiService.getCharacters().catch(() => []),
      ]);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setCharacters(Array.isArray(charactersData) ? charactersData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setSessions([]);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      try {
        await apiService.deleteSession(sessionId);
        setSessions(sessions.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          onNewChat();
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handlePinSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Toggle pin status locally (backend endpoint to be implemented)
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, is_pinned: !s.is_pinned } : s
      ));
      // TODO: Call API to persist pin status
      // await apiService.updateSession(sessionId, { is_pinned: !isPinned });
    } catch (error) {
      console.error('Failed to pin session:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-light-sidebar dark:bg-chat-sidebar border-r border-light-border dark:border-white/10 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-20'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} p-4 border-b border-light-border dark:border-white/10`}>
          <div className="flex items-center gap-3">
            {/* Logo acts as the single toggle when collapsed. On hover it reveals the open icon. */}
            <button
              onClick={onToggle}
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label="Toggle sidebar"
              className={`relative group focus:outline-none ${isOpen ? 'inline-flex items-center gap-2' : 'p-0'}`}
            >
              <Logo size={28} className="rounded-md" />

              {/* overlay open icon only visible on hover when collapsed */}
              {!isOpen && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <LayoutPanelLeft className="w-5 h-5 text-white/0 group-hover:text-white/90 transform scale-95 group-hover:scale-110 transition-all duration-150" />
                </span>
              )}
            </button>

            {isOpen && (
              <h2 className={`text-gray-900 dark:text-white font-semibold text-lg transition-all truncate`}>
                ZyrexAi
              </h2>
            )}
          </div>

          {/* Desktop collapse button (right of title) and mobile close button */}
          {isOpen ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggle}
                title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-label="Toggle sidebar"
                className="hidden lg:inline-flex p-1 rounded hover:bg-light-hover dark:hover:bg-white/10 transition-colors"
              >
                <LayoutPanelLeft className="w-5 h-5 text-gray-700 dark:text-white/80" />
              </button>
              <button
                onClick={onToggle}
                className="lg:hidden p-1 rounded hover:bg-light-hover dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            </div>
          ) : null}
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-light-border dark:border-white/10">
          <button
            onClick={() => {
              onNewChat();
              onToggle();
            }}
            className={`w-full flex items-center ${isOpen ? 'gap-3 px-4 py-3 rounded-lg' : 'justify-center py-3'} bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 transition-colors text-gray-900 dark:text-white`}
          >
            <Plus className="w-5 h-5" />
            <span className={`font-medium transition-all ${isOpen ? 'inline' : 'hidden'}`}>New Chat</span>
          </button>
        </div>

        {/* Character Selector */}
        <div className="p-3 border-b border-light-border dark:border-white/10">
          <button
            onClick={() => setShowCharacterModal(true)}
            className={`w-full flex items-center ${isOpen ? 'gap-3 px-4 py-2 rounded-lg' : 'justify-center py-2'} hover:bg-light-hover dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white`}
          >
            <Bot className="w-5 h-5" />
            <span className={`text-sm flex-1 text-left truncate transition-all ${isOpen ? 'inline' : 'hidden'}`}>
              {selectedCharacter ? selectedCharacter.name : 'Default Assistant'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-white/50 ${isOpen ? '' : 'hidden'}`} />
          </button>
        </div>

        {/* Sessions List */}
        <div className={`flex-1 overflow-y-auto ${isOpen ? 'p-3' : 'py-3 px-1'}`}>
          {isOpen && (
            <div className="text-xs text-gray-500 dark:text-white/40 uppercase font-semibold mb-2 px-2">
              Recent Chats
            </div>
          )}
          {loading ? (
            isOpen ? (
              <div className="text-gray-500 dark:text-white/40 text-sm px-2">Loading...</div>
            ) : (
              <div className="flex justify-center py-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-white/10 animate-pulse" />
              </div>
            )
          ) : sessions.length === 0 ? (
            isOpen ? (
              <div className="text-gray-500 dark:text-white/40 text-sm px-2">No conversations yet</div>
            ) : (
              <div className="flex justify-center items-start text-gray-500 dark:text-white/30 text-sm py-2">
                <MessageSquare className="w-5 h-5 opacity-40" />
              </div>
            )
          ) : (
            <div className="space-y-1">
              {/* Pinned Sessions */}
              {sessions.filter(s => s.is_pinned).length > 0 && (
                <>
                  <div className="text-xs text-purple-400 uppercase font-semibold mb-1 px-2 pt-2">
                    Pinned
                  </div>
                  {sessions.filter(s => s.is_pinned).map((session) => (
                    <div
                            key={session.id}
                            onClick={() => {
                              onSelectSession(session.id);
                              onToggle();
                            }}
                            className={`group flex items-center ${isOpen ? 'gap-2 px-3 py-2 rounded-lg' : 'justify-center py-2'} cursor-pointer transition-colors ${
                              currentSessionId === session.id
                                ? (isOpen ? 'bg-white/20' : 'bg-white/10')
                                : 'hover:bg-white/10'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 text-white/70 flex-shrink-0" />
                            <span className={`flex-1 text-sm text-white/90 truncate transition-all ${isOpen ? 'ml-2 inline' : 'hidden'}`}>
                              {session.title || 'New Chat'}
                            </span>
                            <button
                              onClick={(e) => handlePinSession(session.id, e)}
                              className={`opacity-100 p-1 rounded hover:bg-purple-500/20 ${isOpen ? '' : 'hidden'}`}
                              title="Unpin"
                            >
                              <Pin className="w-4 h-4 text-purple-400 fill-purple-400" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 ${isOpen ? '' : 'hidden'}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                  ))}
                  <div className="text-xs text-gray-500 dark:text-white/40 uppercase font-semibold mb-1 px-2 pt-3">
                    All Chats
                  </div>
                </>
              )}
              
              {/* Regular Sessions */}
              {sessions.filter(s => !s.is_pinned).map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onToggle();
                  }}
                  className={`group flex items-center ${isOpen ? 'gap-2 px-3 py-2 rounded-lg' : 'justify-center py-2'} cursor-pointer transition-colors ${
                    currentSessionId === session.id
                      ? (isOpen ? 'bg-gray-200 dark:bg-white/20' : 'bg-white/10')
                      : 'hover:bg-light-hover dark:hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-white/70 flex-shrink-0" />
                  <span className={`flex-1 text-sm text-gray-900 dark:text-white/90 truncate transition-all ${isOpen ? 'ml-2 inline' : 'hidden'}`}>
                    {session.title || 'New Chat'}
                  </span>
                  <button
                    onClick={(e) => handlePinSession(session.id, e)}
                    className={`${isOpen ? 'opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-purple-500/20' : 'hidden'}`}
                    title="Pin to top"
                  >
                    <PinOff className="w-4 h-4 text-gray-500 dark:text-white/50" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className={`${isOpen ? 'opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-opacity' : 'hidden'}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-light-border dark:border-white/10 p-3 space-y-1">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className={`w-full flex items-center ${isOpen ? 'gap-3 px-3 py-2 rounded-lg' : 'justify-center py-2'} hover:bg-light-hover dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm`}
          >
            <Settings className="w-4 h-4" />
            <span className={`${isOpen ? '' : 'hidden'}`}>Settings</span>
          </button>
          <button className={`w-full flex items-center ${isOpen ? 'gap-3 px-3 py-2 rounded-lg' : 'justify-center py-2'} hover:bg-light-hover dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm`}>
            <LogOut className="w-4 h-4" />
            <span className={`${isOpen ? '' : 'hidden'}`}>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-light-sidebar dark:bg-chat-sidebar border border-light-border dark:border-white/10 hover:bg-light-hover dark:hover:bg-chat-hover transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
      )}

      {/* Character Modal */}
      <CharacterModal
        isOpen={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        characters={characters}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={onSelectCharacter}
        onCreateCharacter={() => {
          setShowCharacterModal(false);
          onCreateCharacter?.();
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
};
