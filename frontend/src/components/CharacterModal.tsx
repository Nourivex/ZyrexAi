import React from 'react';
import { X, Bot, Thermometer, Sparkles, Plus } from 'lucide-react';
import type { Character } from '../types';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character | null) => void;
  onCreateCharacter?: () => void; // Changed: simple callback to open creation page
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  selectedCharacter,
  onSelectCharacter,
  onCreateCharacter,
}) => {

  if (!isOpen) return null;

  const handleSelect = (character: Character | null) => {
    onSelectCharacter(character);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-chat-sidebar border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Select Character</h2>
              <p className="text-sm text-white/60">Choose an AI personality for your conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Characters Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create New Character Card */}
            {onCreateCharacter && (
              <div
                onClick={() => {
                  onClose(); // Close modal first
                  onCreateCharacter(); // Then open full-page creation
                }}
                className="p-5 rounded-xl border-2 border-dashed border-purple-500/50 bg-purple-500/5 cursor-pointer transition-all hover:scale-[1.02] hover:border-purple-500 hover:bg-purple-500/10"
              >
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Create Custom Character</h3>
                  <p className="text-sm text-white/60">Design your own AI personality</p>
                </div>
              </div>
            )}
            
            {/* Default Assistant */}
            <div
              onClick={() => handleSelect(null)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                !selectedCharacter
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-chat-input hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1">Default Assistant</h3>
                  <p className="text-sm text-white/70 mb-3 line-clamp-2">
                    General-purpose AI assistant without specific character traits
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Thermometer className="w-3 h-3" />
                    <span>Balanced</span>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <Sparkles className="w-3 h-3" />
                    <span>All Models</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Character Cards */}
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => handleSelect(character)}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedCharacter?.id === character.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-chat-input hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    character.id == 1 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      : character.id == 2
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">{character.name}</h3>
                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{character.description || character.system_prompt?.substring(0, 100)}</p>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Thermometer className="w-3 h-3" />
                      <span>Temp: {character.temperature}</span>
                      {character.model_preference && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/30"></span>
                          <Sparkles className="w-3 h-3" />
                          <span className="truncate">{character.model_preference.split(':')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-chat-bg/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {selectedCharacter 
                ? `Selected: ${selectedCharacter.name}`
                : 'Using default assistant'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
