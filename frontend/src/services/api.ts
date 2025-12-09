import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  ChatRequest,
  ChatResponse,
  Session,
  Character,
  Tool,
  Agent,
  Automation,
  Message
} from '../types';

const API_BASE_URL = 'http://localhost:1810/api/v1';
const API_KEY = 'zyrex-0425-1201-secret';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Chat Endpoints
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/chat', request);
    return response.data;
  }

  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is null');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onComplete();
              return;
            }
            if (data) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  onChunk(parsed.content);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  // Roleplay Chat
  async sendRoleplayMessage(
    characterId: string,
    message: string,
    sessionId?: string
  ): Promise<ChatResponse> {
    const response = await this.client.post('/roleplay/chat', {
      character_id: characterId,
      message,
      session_id: sessionId,
    });
    return response.data;
  }

  // Session Management
  async getSessions(): Promise<Session[]> {
    const response = await this.client.get('/chat/sessions');
    return response.data;
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await this.client.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const response = await this.client.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.delete(`/chat/sessions/${sessionId}`);
  }

  // Character Management
  async getCharacters(): Promise<Character[]> {
    const response = await this.client.get('/roleplay/characters');
    return response.data;
  }

  async getCharacter(characterId: string): Promise<Character> {
    const response = await this.client.get(`/roleplay/characters/${characterId}`);
    return response.data;
  }

  async createCharacter(character: Partial<Character>): Promise<Character> {
    const response = await this.client.post('/roleplay/characters', character);
    return response.data;
  }

  async updateCharacter(
    characterId: string,
    character: Partial<Character>
  ): Promise<Character> {
    const response = await this.client.put(
      `/roleplay/characters/${characterId}`,
      character
    );
    return response.data;
  }

  async deleteCharacter(characterId: string): Promise<void> {
    await this.client.delete(`/roleplay/characters/${characterId}`);
  }

  // Tool Management
  async getTools(): Promise<Tool[]> {
    const response = await this.client.get('/tools');
    return response.data;
  }

  async getTool(toolId: string): Promise<Tool> {
    const response = await this.client.get(`/tools/${toolId}`);
    return response.data;
  }

  async updateTool(toolId: string, tool: Partial<Tool>): Promise<Tool> {
    const response = await this.client.put(`/tools/${toolId}`, tool);
    return response.data;
  }

  // Agent Management
  async getAgents(): Promise<Agent[]> {
    const response = await this.client.get('/agents');
    return response.data;
  }

  async getAgent(agentId: string): Promise<Agent> {
    const response = await this.client.get(`/agents/${agentId}`);
    return response.data;
  }

  async runAgent(agentId: string, task: string): Promise<{ result: string }> {
    const response = await this.client.post(`/agents/${agentId}/run`, { task });
    return response.data;
  }

  // Automation Management
  async getAutomations(): Promise<Automation[]> {
    const response = await this.client.get('/automations');
    return response.data;
  }

  async getAutomation(automationId: string): Promise<Automation> {
    const response = await this.client.get(`/automations/${automationId}`);
    return response.data;
  }

  async triggerAutomation(
    automationId: string,
    context?: Record<string, any>
  ): Promise<{ status: string; result: any }> {
    const response = await this.client.post(
      `/automations/${automationId}/trigger`,
      { context }
    );
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
