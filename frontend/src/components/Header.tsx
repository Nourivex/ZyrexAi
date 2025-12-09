import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Character } from '../types';

interface HeaderProps {
  selectedCharacter: Character | null;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCharacter,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-light-border dark:border-white/10 bg-light-bg/95 dark:bg-chat-bg/95 backdrop-blur supports-[backdrop-filter]:bg-light-bg/60 dark:supports-[backdrop-filter]:bg-chat-bg/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-gray-900 dark:text-white font-semibold">ZyrexAi</h1>
              {selectedCharacter && (
                <p className="text-xs text-gray-600 dark:text-white/60">
                  {selectedCharacter.name} Mode
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-white/70">Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};
