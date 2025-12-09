import React, { useState, useEffect } from 'react';
import { X, Settings, Moon, Sun, Sparkles, Database, Key, Info, Save, CheckCircle2, BookOpen } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'knowledge' | 'about'>('general');
  
  // Theme state with localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light'; // Default to dark mode
  });
  
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('zyrex-0425-1201-secret');
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:1810/api/v1');
  
  // Model configuration state
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('http://localhost:11434');
  const [primaryModel, setPrimaryModel] = useState('qwen2.5-coder:14b');
  const [fallbackModel, setFallbackModel] = useState('llama3.1:8b');
  const [configSaveStatus, setConfigSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Apply theme on mount and when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };
  
  // Handle model configuration save
  const handleSaveConfig = async () => {
    setConfigSaveStatus('saving');
    try {
      const response = await fetch(`${apiEndpoint}/config/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          ollama_base_url: ollamaBaseUrl,
          ollama_primary_model: primaryModel,
          ollama_fallback_model: fallbackModel,
        }),
      });
      
      if (response.ok) {
        setConfigSaveStatus('success');
        setTimeout(() => setConfigSaveStatus('idle'), 3000);
      } else {
        setConfigSaveStatus('error');
        setTimeout(() => setConfigSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setConfigSaveStatus('error');
      setTimeout(() => setConfigSaveStatus('idle'), 3000);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'api' as const, label: 'API', icon: Key },
    { id: 'knowledge' as const, label: 'Knowledge', icon: BookOpen },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-chat-sidebar border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/10 p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                  
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-white/70" />}
                      <div>
                        <div className="text-white font-medium">Theme</div>
                        <div className="text-sm text-white/60">{darkMode ? 'Dark Mode' : 'Light Mode'}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleThemeToggle}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        darkMode ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Streaming Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-white/70" />
                      <div>
                        <div className="text-white font-medium">Stream Responses</div>
                        <div className="text-sm text-white/60">Show responses as they generate</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStreamEnabled(!streamEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        streamEnabled ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          streamEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Clear Data */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-white/70" />
                      <div>
                        <div className="text-white font-medium">Clear Chat History</div>
                        <div className="text-sm text-white/60">Delete all conversations</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
                  
                  <div className="space-y-4">
                    {/* API Endpoint */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        API Endpoint
                      </label>
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="w-full px-4 py-2 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                        placeholder="http://localhost:1810/api/v1"
                      />
                      <p className="mt-1 text-xs text-white/50">
                        Backend API base URL
                      </p>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-4 py-2 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                        placeholder="Enter your API key"
                      />
                      <p className="mt-1 text-xs text-white/50">
                        Your authentication key (stored locally)
                      </p>
                    </div>

                    {/* Test Connection */}
                    <div className="pt-4">
                      <button className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors">
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Model Configuration Section */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Model Configuration</h3>
                  
                  <div className="space-y-4">
                    {/* Ollama Base URL */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Ollama Base URL
                      </label>
                      <input
                        type="text"
                        value={ollamaBaseUrl}
                        onChange={(e) => setOllamaBaseUrl(e.target.value)}
                        className="w-full px-4 py-2 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                        placeholder="http://localhost:11434"
                      />
                      <p className="mt-1 text-xs text-white/50">
                        Ollama server endpoint
                      </p>
                    </div>

                    {/* Primary Model */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Primary Model
                      </label>
                      <input
                        type="text"
                        value={primaryModel}
                        onChange={(e) => setPrimaryModel(e.target.value)}
                        className="w-full px-4 py-2 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                        placeholder="qwen2.5-coder:14b"
                      />
                      <p className="mt-1 text-xs text-white/50">
                        Main LLM model for conversations
                      </p>
                    </div>

                    {/* Fallback Model */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Fallback Model
                      </label>
                      <input
                        type="text"
                        value={fallbackModel}
                        onChange={(e) => setFallbackModel(e.target.value)}
                        className="w-full px-4 py-2 bg-chat-input border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                        placeholder="llama3.1:8b"
                      />
                      <p className="mt-1 text-xs text-white/50">
                        Backup model if primary fails
                      </p>
                    </div>

                    {/* Save Configuration Button */}
                    <div className="pt-4">
                      <button 
                        onClick={handleSaveConfig}
                        disabled={configSaveStatus === 'saving'}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          configSaveStatus === 'success' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : configSaveStatus === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                      >
                        {configSaveStatus === 'saving' && (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        )}
                        {configSaveStatus === 'success' && (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Configuration Saved!
                          </>
                        )}
                        {configSaveStatus === 'error' && (
                          <>
                            <X className="w-5 h-5" />
                            Failed to Save
                          </>
                        )}
                        {configSaveStatus === 'idle' && (
                          <>
                            <Save className="w-5 h-5" />
                            Save Configuration
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Knowledge Base</h3>
                  <p className="text-sm text-white/60 mb-6">
                    Upload documents to enhance ZyrexAi's knowledge. Files are automatically processed and added to the RAG system.
                  </p>

                  <DocumentUpload 
                    onUploadComplete={() => {
                      console.log('📚 Knowledge base updated');
                    }}
                  />

                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tips</h4>
                    <ul className="text-xs text-blue-300/80 space-y-1">
                      <li>• Supported formats: PDF, TXT</li>
                      <li>• Documents are chunked and vectorized automatically</li>
                      <li>• Enable RAG in chat to use knowledge base</li>
                      <li>• Best for: Documentation, research papers, notes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">About ZyrexAi</h3>
                  
                  <div className="space-y-6">
                    {/* Logo & Version */}
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2">ZyrexAi</h4>
                      <p className="text-white/60 mb-1">Version 1.0.0</p>
                      <p className="text-sm text-white/50">Advanced AI Assistant Platform</p>
                    </div>

                    {/* Features */}
                    <div className="bg-chat-input rounded-lg p-4 space-y-2">
                      <h5 className="font-semibold text-white mb-3">Features</h5>
                      <ul className="space-y-2 text-sm text-white/70">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Powered by Ollama LLMs
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          RAG Pipeline with ChromaDB
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Multiple Character Personalities
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Real-time Streaming Responses
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Markdown & Code Highlighting
                        </li>
                      </ul>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-chat-input rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Tech Stack</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-white/80 font-medium">Frontend</div>
                          <div className="text-white/60">React + TypeScript</div>
                        </div>
                        <div>
                          <div className="text-white/80 font-medium">Backend</div>
                          <div className="text-white/60">FastAPI + Python</div>
                        </div>
                        <div>
                          <div className="text-white/80 font-medium">Database</div>
                          <div className="text-white/60">SQLite + ChromaDB</div>
                        </div>
                        <div>
                          <div className="text-white/80 font-medium">LLM</div>
                          <div className="text-white/60">Ollama</div>
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex gap-3">
                      <a
                        href="http://localhost:1810/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 text-center rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium transition-colors"
                      >
                        API Docs
                      </a>
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 text-center rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium transition-colors"
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
