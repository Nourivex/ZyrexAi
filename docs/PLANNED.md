# Project Roadmap: ZyrexAi

## Phase 1: Foundation (Current)
- [ ] Setup folder structure & Git
- [ ] Backend: FastAPI basic setup + Hello World
- [ ] Frontend: Vite init + Tailwind setup
- [ ] Database: Connect SQLite & Setup SQLModel tables
- [ ] Environment: Configure .env and security

## Phase 2: RAG & Intelligence
- [ ] Service: Ollama connection (Qwen 2.5 Coder 14B)
- [ ] Service: Ollama fallback to Llama 3.1 8B
- [ ] Service: ChromaDB setup with all-MiniLM-L6-v2
- [ ] Feature: Document Ingestion (Text -> Chunk -> Vector)
- [ ] Feature: RAG Retrieval Pipeline
- [ ] Feature: Hybrid Search (SQLite metadata + ChromaDB vectors)

## Phase 3: Core Features
- [ ] API: Chat endpoint with Streaming (SSE)
- [ ] Frontend: Chat Interface with real-time streaming
- [ ] Feature: Roleplay Mode with Characters
- [ ] Feature: Character Management (CRUD + Seeding)
- [ ] API: Roleplay endpoints
- [ ] Frontend: Character selector and roleplay UI

## Phase 4: Agent System
- [ ] Feature: Agent Tools Registry
- [ ] Tool: RAG Search (ChromaDB integration)
- [ ] Tool: Web Search (DuckDuckGo)
- [ ] Tool: File Reader (with path whitelist)
- [ ] Tool: System Info (time, date, system stats)
- [ ] Service: Agent Runner with ReAct Pattern
- [ ] API: Agent execution endpoints
- [ ] Frontend: Agent management UI
- [ ] Frontend: Agent execution logs viewer

## Phase 5: Automations
- [ ] Feature: Scheduled Automations (Cron-based)
- [ ] Service: Background Scheduler (APScheduler)
- [ ] API: Automation CRUD endpoints
- [ ] Frontend: Automation builder with cron UI
- [ ] Feature: Automation execution logs

## Phase 6: SuperAdmin & Monitoring
- [ ] Page: Backend landing page (/)
- [ ] Page: SuperAdmin dashboard (/superadmin)
- [ ] Feature: Ollama status monitoring
- [ ] Feature: ChromaDB statistics
- [ ] Feature: Error logs viewer
- [ ] Feature: System health checks

## Phase 7: Polish & Production Ready
- [ ] Feature: Document Upload UI
- [ ] Feature: Multi-format document support (PDF, DOCX)
- [ ] Testing: Unit tests for services
- [ ] Testing: Integration tests for API
- [ ] Documentation: API documentation
- [ ] Documentation: User guide
- [ ] Performance: Optimize RAG pipeline
- [ ] Security: Enhanced API key management

## Future Enhancements
- [ ] Tool: Python REPL (sandboxed)
- [ ] Tool: Screenshot Analysis (vision models)
- [ ] Feature: Voice input/output
- [ ] Feature: Multi-session management
- [ ] Feature: Export/Import configurations
- [ ] Feature: Webhook-based automations
- [ ] Feature: Advanced RAG with reranking
