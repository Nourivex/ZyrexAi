// Message Types
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

// Session Types
export interface Session {
  id: string;
  title: string;
  character_id?: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
}

// Character Types
export interface Character {
  id: number | string;
  name: string;
  description?: string;
  system_prompt?: string;
  role?: string;
  personality?: string;
  avatar_path?: string;
  avatar_url?: string;
  temperature: number;
  max_tokens?: number;
  model_preference?: string;
  created_at: string;
  updated_at?: string;
}

// Chat Request/Response Types
export interface ChatRequest {
  message: string;
  session_id?: string;
  character_id?: string;
  stream?: boolean;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
}

// Tool Types
export interface Tool {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  tools: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Automation Types
export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  action_config: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// UI State Types
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentSession: Session | null;
  selectedCharacter: Character | null;
}

export interface SidebarState {
  isOpen: boolean;
  sessions: Session[];
  characters: Character[];
  selectedSessionId: string | null;
}
