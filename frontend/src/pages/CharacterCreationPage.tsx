import React, { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Thermometer, Cpu } from 'lucide-react';
import { themeClasses } from '../utils/theme';
import type { Character } from '../types';

interface CharacterCreationPageProps {
  onBack: () => void;
  onSave: (character: Partial<Character>) => Promise<void>;
}

export const CharacterCreationPage: React.FC<CharacterCreationPageProps> = ({
  onBack,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    temperature: 0.7,
    model_preference: 'qwen2.5-coder:14b-instruct',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Character name is required';
    }
    
    if (!formData.system_prompt.trim()) {
      newErrors.system_prompt = 'System prompt is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      // Reset form after successful save
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
        temperature: 0.7,
        model_preference: 'qwen2.5-coder:14b-instruct',
      });
      onBack();
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureLabel = () => {
    if (formData.temperature < 0.5) return 'Focused & Deterministic';
    if (formData.temperature < 1.2) return 'Balanced';
    return 'Creative & Varied';
  };

  const getTemperatureColor = () => {
    if (formData.temperature < 0.5) return 'text-blue-400';
    if (formData.temperature < 1.2) return 'text-green-400';
    return 'text-purple-400';
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${themeClasses.bg.primary}`}>
      {/* Header */}
      <div className={`${themeClasses.border.primary} ${themeClasses.bg.sidebar} border-b`}> 
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button.ghost} ${themeClasses.text.primary}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                Create Custom Character
              </h1>
              <p className={`text-sm ${themeClasses.text.muted} mt-1`}>
                Design your own AI personality with custom traits and behavior
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Character Name */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                  Character Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${themeClasses.bg.input} border ${
                    errors.name
                      ? 'border-red-500'
                      : themeClasses.border.primary
                  } ${themeClasses.text.primary} placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors`}
                  placeholder="e.g., Code Reviewer, Creative Writer, Data Analyst"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                  Description
                  <span className="ml-2 text-xs text-white/50 dark:text-white/50 text-gray-500 font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${themeClasses.bg.input} border ${themeClasses.border.primary} ${themeClasses.text.primary} placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors`}
                  placeholder="Brief description of this character's role"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                  System Prompt *
                </label>
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  rows={12}
                  className={`w-full px-4 py-3 rounded-xl ${themeClasses.bg.input} border ${
                    errors.system_prompt
                      ? 'border-red-500'
                      : themeClasses.border.primary
                  } ${themeClasses.text.primary} placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors resize-none font-mono text-sm`}
                  placeholder={`You are a helpful assistant specialized in...

Define the character's:
- Role and expertise
- Communication style
- Constraints and guidelines
- Special capabilities`}
                />
                {errors.system_prompt && (
                  <p className="mt-2 text-sm text-red-400">{errors.system_prompt}</p>
                )}
                <p className={`mt-2 text-xs ${themeClasses.text.muted}`}>
                  💡 Tip: Be specific about expertise, tone, and limitations
                </p>
              </div>

              {/* Temperature */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature: {formData.temperature.toFixed(1)}
                    <span className={`text-xs font-normal ${getTemperatureColor()}`}>
                      ({getTemperatureLabel()})
                    </span>
                  </div>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-white/10 dark:bg-white/10 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className={`flex justify-between text-xs mt-2 ${themeClasses.text.muted}`}>
                  <span>0.0 - Precise</span>
                  <span>1.0 - Balanced</span>
                  <span>2.0 - Creative</span>
                </div>
              </div>

              {/* Model Preference */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Model Preference
                  </div>
                </label>
                <select
                  value={formData.model_preference}
                  onChange={(e) => setFormData({ ...formData, model_preference: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${themeClasses.bg.input} border ${themeClasses.border.primary} ${themeClasses.text.primary} focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer`}
                >
                  <option value="qwen2.5-coder:14b-instruct">qwen2.5-coder:14b (Coding)</option>
                  <option value="llama3.1:8b">llama3.1:8b (Fast, General)</option>
                  <option value="llama3.1:70b">llama3.1:70b (Most Capable)</option>
                  <option value="mistral:latest">mistral:latest (Balanced)</option>
                </select>
                <p className={`mt-2 text-xs ${themeClasses.text.muted}`}>
                  Choose the AI model best suited for this character's purpose
                </p>
              </div>
            </div>

            {/* Right Column - Preview Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className={`${themeClasses.bg.card} rounded-2xl p-6 border ${themeClasses.border.primary}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className={`w-6 h-6 ${themeClasses.text.primary}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${themeClasses.text.primary}`}>
                        {formData.name || 'Character Name'}
                      </h3>
                      <p className={`${themeClasses.text.muted} text-xs`}>Custom Character</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formData.description && (
                      <p className={`text-sm ${themeClasses.text.secondary}`}>
                        {formData.description}
                      </p>
                    )}

                    <div className={`flex items-center gap-2 text-xs ${themeClasses.text.muted}`}>
                      <Thermometer className="w-4 h-4" />
                      <span>Temp: {formData.temperature.toFixed(1)}</span>
                    </div>

                    <div className={`flex items-center gap-2 text-xs ${themeClasses.text.muted}`}>
                      <Cpu className="w-4 h-4" />
                      <span className="truncate">{formData.model_preference}</span>
                    </div>
                  </div>

                  <div className={`mt-6 pt-6 border-t ${themeClasses.border.primary}`}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Create Character
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">💡 Pro Tips</h4>
                  <ul className={`${themeClasses.text.secondary} text-xs space-y-1`}>
                    <li>• Start with a clear role definition</li>
                    <li>• Use lower temperature (0.3-0.5) for coding</li>
                    <li>• Use higher temperature (1.2-1.8) for creativity</li>
                    <li>• Test and refine your prompts</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
