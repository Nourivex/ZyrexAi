import { useState, useRef, useEffect } from 'react';
import { Send, Square, Database, Wrench, Paperclip, X, Image as ImageIcon, Mic, MicOff } from 'lucide-react';

interface InputBoxProps {
  onSendMessage: (message: string, images?: string[]) => void;
  isLoading: boolean;
  onStop?: () => void;
  disabled?: boolean;
  ragEnabled?: boolean;
  toolsAvailable?: string[];
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  disabled = false,
  ragEnabled = false,
  toolsAvailable = [],
}) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // or 'id-ID' for Indonesian

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      // Convert to Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        newImages.push(base64);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || images.length > 0) && !isLoading && !disabled) {
      onSendMessage(message, images.length > 0 ? images : undefined);
      setMessage('');
      setImages([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <div className="border-t border-light-border dark:border-white/10 bg-light-bg dark:bg-chat-bg p-4">
      <div className="max-w-3xl mx-auto">
        {/* Context Indicators */}
        {(ragEnabled || toolsAvailable.length > 0) && (
          <div className="flex items-center gap-2 mb-2 px-1">
            {ragEnabled && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30">
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">RAG Active</span>
              </div>
            )}
            {toolsAvailable.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30">
                <Wrench className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {toolsAvailable.length} Tool{toolsAvailable.length !== 1 ? 's' : ''} Available
                </span>
              </div>
            )}
          </div>
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 px-1 overflow-x-auto">
            {images.map((img, index) => (
              <div key={index} className="relative group flex-shrink-0">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-purple-500 dark:border-purple-400"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={images.length > 0 ? "Describe what you want to know about the image..." : "Send a message..."}
            disabled={disabled || isLoading}
            className="w-full bg-white dark:bg-chat-input text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 rounded-lg px-4 py-3 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-white/20 border border-gray-300 dark:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ maxHeight: '200px' }}
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Voice Input Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
                disabled={disabled}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-gray-700 dark:text-white" />
                )}
              </button>
            )}

            {/* Image Upload Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                title="Upload image"
                disabled={disabled}
              >
                <Paperclip className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>
            )}

            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                title="Stop generating"
              >
                <Square className="w-5 h-5 text-gray-700 dark:text-white" fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!message.trim() && images.length === 0) || disabled}
                className="p-2 rounded-lg bg-purple-600 dark:bg-white/10 hover:bg-purple-700 dark:hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 dark:disabled:hover:bg-white/10"
                title="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </form>
        
        <div className="text-center text-xs text-gray-500 dark:text-white/40 mt-3">
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300">Enter</kbd> to send,{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default InputBox;
