import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Moon, Sun, Sparkles, Database, Key, Info, Save, CheckCircle2, BookOpen, RefreshCw } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { themeClasses } from '../utils/theme';

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
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const modelsIntervalRef = useRef<number | null>(null);
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

  // Fetch available models from Ollama server (tries /models and /v1/models)
  const fetchModels = async (showErrors = false) => {
    if (!ollamaBaseUrl) return;
    setModelsLoading(true);
    setModelsError(null);
    try {
      const tryUrls = [
        `${ollamaBaseUrl.replace(/\/$/, '')}/models`,
        `${ollamaBaseUrl.replace(/\/$/, '')}/v1/models`,
      ];
      let json: any = null;
      let ok = false;
      for (const url of tryUrls) {
        try {
          const resp = await fetch(url);
          if (!resp.ok) continue;
          json = await resp.json();
          ok = true;
          break;
        } catch (err) {
          // try next
        }
      }

      if (!ok || !json) {
        throw new Error('No response from Ollama models endpoint');
      }

      // Normalize response to array of model names
      let list: string[] = [];
      if (Array.isArray(json)) {
        // array of objects or strings
        list = json.map((it: any) => (typeof it === 'string' ? it : it.name || it.id || 'unknown'));
      } else if (json.models && Array.isArray(json.models)) {
        list = json.models.map((it: any) => it.name || it.id || 'unknown');
      } else if (json.data && Array.isArray(json.data)) {
        list = json.data.map((it: any) => it.name || it.id || 'unknown');
      }

      // Deduplicate and sort
      list = Array.from(new Set(list)).sort();
      setModels(list);
      setLastFetched(Date.now());
    } catch (err: any) {
      console.error('Failed to fetch models from Ollama:', err);
      setModels([]);
      setModelsError(err?.message || 'Failed to fetch models');
      if (showErrors) {
        alert('Failed to fetch models from Ollama. Check Ollama Base URL and that the server is running.');
      }
    } finally {
      setModelsLoading(false);
    }
  };

  // Periodically refresh models every 1 hour (3600000 ms). Also fetch once on mount.
  useEffect(() => {
    fetchModels();
    // set interval
    const id = window.setInterval(() => fetchModels(), 3600000);
    modelsIntervalRef.current = id;
    return () => {
      if (modelsIntervalRef.current) window.clearInterval(modelsIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ollamaBaseUrl]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'api' as const, label: 'API', icon: Key },
    { id: 'knowledge' as const, label: 'Knowledge', icon: BookOpen },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.modal.backdrop}`}>
      <div className={`${themeClasses.modal.container} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${themeClasses.border.primary}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${themeClasses.button.ghost} ${themeClasses.text.muted}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className={`w-48 border-r ${themeClasses.border.primary} p-4 space-y-1`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : `${themeClasses.text.muted} ${themeClasses.button.ghost}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={`flex-1 p-6 overflow-y-auto ${themeClasses.text.primary}`}>
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>General Settings</h3>
                  
                  {/* Theme Toggle */}
                  <div className={`flex items-center justify-between py-3 border-b ${themeClasses.border.primary}`}>
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon className={`w-5 h-5 ${themeClasses.text.muted}`} /> : <Sun className={`w-5 h-5 ${themeClasses.text.muted}`} />}
                      <div>
                        <div className={`${themeClasses.text.primary} font-medium`}>Theme</div>
                        <div className={`text-sm ${themeClasses.text.muted}`}>{darkMode ? 'Dark Mode' : 'Light Mode'}</div>
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
                  <div className={`flex items-center justify-between py-3 border-b ${themeClasses.border.primary}`}>
                    <div className="flex items-center gap-3">
                      <Sparkles className={`w-5 h-5 ${themeClasses.text.muted}`} />
                      <div>
                        <div className={`${themeClasses.text.primary} font-medium`}>Stream Responses</div>
                        <div className={`text-sm ${themeClasses.text.muted}`}>Show responses as they generate</div>
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
                      <Database className={`w-5 h-5 ${themeClasses.text.muted}`} />
                      <div>
                        <div className={`${themeClasses.text.primary} font-medium`}>Clear Chat History</div>
                        <div className={`text-sm ${themeClasses.text.muted}`}>Delete all conversations</div>
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
                  <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>API Configuration</h3>
                  
                  <div className="space-y-4">
                    {/* API Endpoint */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeClasses.text.muted}`}>
                        API Endpoint
                      </label>
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className={`w-full px-4 py-2 ${themeClasses.bg.input} ${themeClasses.border.primary} rounded-lg ${themeClasses.text.primary} ${themeClasses.text.placeholder} focus:outline-none ${themeClasses.border.focus}`}
                        placeholder="http://localhost:1810/api/v1"
                      />
                      <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>
                        Backend API base URL
                      </p>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeClasses.text.muted}`}>
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className={`w-full px-4 py-2 ${themeClasses.bg.input} ${themeClasses.border.primary} rounded-lg ${themeClasses.text.primary} ${themeClasses.text.placeholder} focus:outline-none ${themeClasses.border.focus}`}
                        placeholder="Enter your API key"
                      />
                      <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>
                        Your authentication key (stored locally)
                      </p>
                    </div>

                    {/* Test Connection */}
                    <div className="pt-4">
                      <button className={`w-full px-4 py-2 rounded-lg ${themeClasses.button.primary} font-medium transition-colors`}>
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Model Configuration Section */}
                <div className={`border-t ${themeClasses.border.primary} pt-6`}>
                  <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>

                  <div className="space-y-4">
                    {/* Ollama Base URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ollama Base URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ollamaBaseUrl}
                          onChange={(e) => setOllamaBaseUrl(e.target.value)}
                          className={`flex-1 px-4 py-2 rounded-lg ${themeClasses.bg.input} ${themeClasses.border.primary} ${themeClasses.text.primary} ${themeClasses.text.placeholder} focus:outline-none ${themeClasses.border.focus}`}
                          placeholder="http://localhost:11434"
                        />
                        <button
                          onClick={() => fetchModels(true)}
                          title="Refresh models now"
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 ${themeClasses.button.secondary}`}
                        >
                          {modelsLoading ? (
                            <div className="w-4 h-4 border-2 border-gray-300 dark:border-white/30 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          <span className="text-sm">Refresh</span>
                        </button>
                      </div>
                      <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>
                        Ollama server endpoint used to auto-discover models
                        {lastFetched ? ` · last: ${new Date(lastFetched).toLocaleString()}` : ''}
                      </p>
                      {modelsError && <p className="mt-1 text-xs text-red-400">{modelsError}</p>}
                    </div>

                    {/* Primary Model */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Model</label>
                      {models.length > 0 ? (
                        <select
                          value={primaryModel}
                          onChange={(e) => setPrimaryModel(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg ${themeClasses.bg.input} ${themeClasses.border.primary} ${themeClasses.text.primary} focus:outline-none ${themeClasses.border.focus}`}
                        >
                          {models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={primaryModel}
                          onChange={(e) => setPrimaryModel(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg ${themeClasses.bg.input} ${themeClasses.border.primary} ${themeClasses.text.primary} ${themeClasses.text.placeholder} focus:outline-none ${themeClasses.border.focus}`}
                          placeholder="qwen2.5-coder:14b"
                        />
                      )}
                      <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>Main LLM model for conversations</p>
                    </div>

                    {/* Fallback Model */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Fallback Model</label>
                      {models.length > 0 ? (
                        <select
                          value={fallbackModel}
                          onChange={(e) => setFallbackModel(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg ${themeClasses.bg.input} ${themeClasses.border.primary} ${themeClasses.text.primary} focus:outline-none ${themeClasses.border.focus}`}
                        >
                          <option value="">(none)</option>
                          {models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={fallbackModel}
                          onChange={(e) => setFallbackModel(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg ${themeClasses.bg.input} ${themeClasses.border.primary} ${themeClasses.text.primary} ${themeClasses.text.placeholder} focus:outline-none ${themeClasses.border.focus}`}
                          placeholder="llama3.1:8b"
                        />
                      )}
                      <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>Backup model if primary fails</p>
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
                            : themeClasses.button.primary
                        }`}
                      >
                        {configSaveStatus === 'saving' && (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 dark:border-white/30 border-t-transparent rounded-full animate-spin" />
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
                  <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Knowledge Base</h3>
                  <p className={`text-sm ${themeClasses.text.muted} mb-6`}>
                    Upload documents to enhance ZyrexAi's knowledge. Files are automatically processed and added to the RAG system.
                  </p>

                  <DocumentUpload 
                    onUploadComplete={() => {
                      console.log('📚 Knowledge base updated');
                    }}
                  />

                  <div className={`mt-6 p-4 ${themeClasses.bg.card} border border-blue-500/30 rounded-lg`}>
                    <h4 className={`text-sm font-semibold mb-2 ${themeClasses.text.primary}`}>💡 Pro Tips</h4>
                    <ul className={`text-xs ${themeClasses.text.muted} space-y-1`}>
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
                  <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>About ZyrexAi</h3>
                  
                  <div className="space-y-6">
                    {/* Logo & Version */}
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                        <Sparkles className={`w-10 h-10 text-white`} />
                      </div>
                      <h4 className={`text-2xl font-bold mb-2 ${themeClasses.text.primary}`}>ZyrexAi</h4>
                      <p className={`${themeClasses.text.muted} mb-1`}>Version 1.0.0</p>
                      <p className={`text-sm ${themeClasses.text.muted}`}>Advanced AI Assistant Platform</p>
                    </div>

                    {/* Features */}
                    <div className={`${themeClasses.bg.card} rounded-lg p-4 space-y-2`}>
                      <h5 className={`font-semibold mb-3 ${themeClasses.text.primary}`}>Features</h5>
                      <ul className={`space-y-2 text-sm ${themeClasses.text.muted}`}>
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
                    <div className={`${themeClasses.bg.card} rounded-lg p-4`}>
                      <h5 className={`font-semibold mb-3 ${themeClasses.text.primary}`}>Tech Stack</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className={`${themeClasses.text.muted} font-medium`}>Frontend</div>
                          <div className={`${themeClasses.text.muted}`}>React + TypeScript</div>
                        </div>
                        <div>
                          <div className={`${themeClasses.text.muted} font-medium`}>Backend</div>
                          <div className={`${themeClasses.text.muted}`}>FastAPI + Python</div>
                        </div>
                        <div>
                          <div className={`${themeClasses.text.muted} font-medium`}>Database</div>
                          <div className={`${themeClasses.text.muted}`}>SQLite + ChromaDB</div>
                        </div>
                        <div>
                          <div className={`${themeClasses.text.muted} font-medium`}>LLM</div>
                          <div className={`${themeClasses.text.muted}`}>Ollama</div>
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
