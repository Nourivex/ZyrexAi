import React, { useEffect } from 'react';
import { X, Bot, Thermometer, Sparkles, Plus } from 'lucide-react';
import type { Character } from '../types';
import { themeClasses } from '../utils/theme';

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (character: Character | null) => {
    onSelectCharacter(character);
    onClose();
  };

  const baseContainer = `max-w-[min(95%,1200px)] w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl`;

  const cardBase = 'p-4 rounded-2xl border cursor-pointer transition-transform transform-gpu will-change-transform ease-out duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500';

  const selectedCard = 'border-purple-500 bg-gradient-to-b from-purple-700/10 to-transparent shadow-md';
  const normalCard = `${themeClasses.bg.card} ${themeClasses.border.primary} hover:border-gray-300 dark:hover:border-white/20`;

  const handleKeySelect = (e: React.KeyboardEvent, cb: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cb();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.modal.backdrop}`}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select Character"
        className={`${themeClasses.modal.container} ${baseContainer} rounded-none sm:rounded-2xl`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 md:p-6 border-b ${themeClasses.border.primary}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className={`w-6 h-6 ${themeClasses.text.primary}`} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>Select Character</h2>
              <p className={`text-sm ${themeClasses.text.muted}`}>Choose an AI personality for your conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${themeClasses.button.ghost} ${themeClasses.text.secondary}`}
          >
            <X className={`w-5 h-5 ${themeClasses.text.primary}`} />
          </button>
        </div>

        {/* Characters Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-fr">
            {/* Create New Character Card */}
            {onCreateCharacter && (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeySelect(e, () => { onClose(); onCreateCharacter(); })}
                onClick={() => { onClose(); onCreateCharacter(); }}
                className={`${cardBase} border-2 border-dashed border-purple-500/40 bg-gradient-to-b from-purple-800/5 to-transparent flex items-center justify-center cursor-pointer hover:-translate-y-1 hover:shadow-lg`}
                aria-pressed="false"
              >
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-1`}>Create Custom Character</h3>
                  <p className={`text-sm ${themeClasses.text.muted}`}>Design your own AI personality</p>
                </div>
              </div>
            )}
            
            {/* Default Assistant */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeySelect(e, () => handleSelect(null))}
              onClick={() => handleSelect(null)}
              aria-pressed={!selectedCharacter}
              className={`${cardBase} ${!selectedCharacter ? selectedCard : normalCard} hover:-translate-y-0.5`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
                  <Bot className={`w-6 h-6 ${themeClasses.text.primary}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-1`}>Default Assistant</h3>
                  <p className={`text-sm ${themeClasses.text.secondary} mb-3 line-clamp-2`}>
                    General-purpose AI assistant without specific character traits
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${themeClasses.text.muted}`}>
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
            {characters.map((character) => {
              const isSelected = selectedCharacter?.id === character.id;
              const colorClass = character.id === 1 ? 'from-blue-500 to-cyan-500' : character.id === 2 ? 'from-green-500 to-emerald-500' : 'from-purple-500 to-pink-500';
              return (
                <div
                  key={character.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeySelect(e, () => handleSelect(character))}
                  onClick={() => handleSelect(character)}
                  aria-pressed={isSelected}
                  className={`${cardBase} ${isSelected ? selectedCard : normalCard} hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${colorClass}`}>
                      <Bot className={`w-6 h-6 ${themeClasses.text.primary}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-1`}>{character.name}</h3>
                      <p className={`text-sm ${themeClasses.text.secondary} mb-3 line-clamp-2`}>{character.description || character.system_prompt?.substring(0, 100)}</p>
                      <div className={`flex items-center gap-2 text-xs ${themeClasses.text.muted}`}>
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
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${themeClasses.border.primary} ${themeClasses.bg.primary}`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${themeClasses.text.muted}`}>
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
