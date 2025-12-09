import React, { useState } from 'react';
import { X, Plus, Save, Sparkles } from 'lucide-react';
import type { Character } from '../types';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Partial<Character>) => Promise<void>;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    temperature: 0.7,
    model_preference: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.system_prompt.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: formData.name,
        description: formData.description,
        system_prompt: formData.system_prompt,
        temperature: formData.temperature,
        model_preference: formData.model_preference || undefined,
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        temperature: 0.7,
        model_preference: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-chat-sidebar border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Create Custom Character</h2>
              <p className="text-sm text-white/60">Design your own AI personality</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Character Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lycus 4.0"
              required
              className="w-full px-4 py-2.5 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this character"
              className="w-full px-4 py-2.5 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              System Prompt *
            </label>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              placeholder="You are a helpful assistant that..."
              required
              rows={6}
              className="w-full px-4 py-2.5 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              Define the character's personality, expertise, and behavior
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Temperature: {formData.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-chat-input rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>0 (Focused)</span>
              <span>1 (Balanced)</span>
              <span>2 (Creative)</span>
            </div>
            <p className="text-xs text-white/50 mt-2">
              {formData.temperature < 0.5 && "More deterministic and focused responses"}
              {formData.temperature >= 0.5 && formData.temperature < 1.2 && "Balanced creativity and consistency"}
              {formData.temperature >= 1.2 && "More creative and varied responses"}
            </p>
          </div>

          {/* Model Preference */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Model Preference (Optional)
            </label>
            <select
              value={formData.model_preference}
              onChange={(e) => setFormData({ ...formData, model_preference: e.target.value })}
              className="w-full px-4 py-2.5 bg-chat-input border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Use Default Model</option>
              <option value="qwen2.5-coder:14b-instruct">Qwen 2.5 Coder 14B (Best for coding)</option>
              <option value="llama3.1:8b">Llama 3.1 8B (Fast, general purpose)</option>
              <option value="llama3.1:70b">Llama 3.1 70B (Most capable)</option>
              <option value="mistral:latest">Mistral (Balanced)</option>
            </select>
            <p className="text-xs text-white/50 mt-1">
              Leave empty to use the default model configured in backend
            </p>
          </div>

          {/* Preview Card */}
          <div className="bg-chat-input/50 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Preview</span>
            </div>
            <div className="text-sm text-white/70 space-y-1">
              <div><span className="text-white/50">Name:</span> {formData.name || 'Character Name'}</div>
              <div><span className="text-white/50">Temp:</span> {formData.temperature}</div>
              {formData.model_preference && (
                <div><span className="text-white/50">Model:</span> {formData.model_preference.split(':')[0]}</div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-chat-bg/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name.trim() || !formData.system_prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Character
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
