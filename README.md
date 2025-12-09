# 🚀 ZyrexAi - Advanced AI Assistant Platform

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%2019-61DAFB)
![License](https://img.shields.io/badge/license-MIT-blue)

> A modern ChatGPT-style AI assistant powered by Ollama LLMs, featuring RAG pipeline, multiple character personalities, and real-time streaming responses.

---

## ✨ Features

### 🎨 Beautiful Frontend
- **ChatGPT-Style Dark Theme** - Modern, sleek interface
- **Real-time Streaming** - Watch responses generate live
- **Markdown Support** - Full markdown rendering with syntax highlighting
- **Character System** - Switch between AI personalities
- **Session Management** - Save and restore conversations
- **Responsive Design** - Works on all devices

### 🔧 Powerful Backend
- **FastAPI Framework** - High-performance async API
- **Ollama Integration** - Run LLMs locally (qwen2.5-coder:14b-instruct)
- **RAG Pipeline** - ChromaDB vector store for semantic search
- **8 Database Tables** - Complete data persistence
- **4 Built-in Tools** - Web search, calculator, code execution, file ops
- **ReAct Agents** - Autonomous multi-step reasoning

---

## 🎯 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Ollama installed and running

### 1. Clone & Setup
```bash
git clone <your-repo>
cd ZyrexAi
```

### 2. Start Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
**Backend**: http://localhost:1810

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
**Frontend**: http://localhost:5173

---

## 📸 Screenshots

### Main Chat Interface
![Chat Interface](https://via.placeholder.com/800x500/343541/FFFFFF?text=ChatGPT-Style+Dark+Theme)

### Character Selector
![Characters](https://via.placeholder.com/800x500/343541/FFFFFF?text=3+AI+Personalities)

### Settings Panel
![Settings](https://via.placeholder.com/800x500/343541/FFFFFF?text=Customizable+Settings)

---

## 🎭 Character Personalities

| Character | Description | Temperature | Model |
|-----------|-------------|-------------|-------|
| **Assistant** | General-purpose helpful AI | 0.7 | Default |
| **Coder** | Expert programmer | 0.3 | qwen2.5-coder:14b-instruct |
| **Storyteller** | Creative writer | 0.9 | Default |

---

## 📁 Project Structure

```
ZyrexAi/
├── backend/               # FastAPI Backend
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Database models
│   │   └── services/     # Business logic
│   └── main.py
│
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API client
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── .env                  # Configuration
└── COMPLETE_GUIDE.md     # Full documentation
```

---

## 🧪 Testing

### Backend Test
```bash
cd backend
.\test_api.ps1
```

### Frontend Test
```bash
cd frontend
.\test_frontend.ps1
```

---

## 🔧 Configuration

### Environment Variables (`.env`)
```env
API_KEY=zyrex-0425-1201-secret
BACKEND_PORT=1810
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_PRIMARY_MODEL=qwen2.5-coder:14b-instruct
```

---

## 📚 Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7
- TailwindCSS 3.4
- Axios, react-markdown, lucide-react

### Backend
- FastAPI 0.109
- SQLAlchemy 2.0 + SQLite
- ChromaDB (vector store)
- Ollama (LLM integration)

---

## 🎯 Key Features Explained

### 1. Real-time Streaming
Server-Sent Events (SSE) provide smooth, ChatGPT-like streaming responses.

### 2. RAG Pipeline
Semantic search with ChromaDB enables context-aware responses using your documents.

### 3. Character System
Different AI personalities with custom temperatures and system prompts.

### 4. ReAct Agents
Autonomous agents that can use tools to complete complex tasks.

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Ollama
ollama list
ollama serve
```

### Port conflicts
```bash
# Kill process on port 1810
netstat -ano | findstr :1810
taskkill /PID <PID> /F
```

### Frontend connection error
```bash
# Verify backend is running
curl http://localhost:1810/api/v1/health -H "X-API-Key: zyrex-0425-1201-secret"
```

---

## 📖 Documentation

- **[Complete Setup Guide](./COMPLETE_GUIDE.md)** - Full documentation
- **[API Documentation](http://localhost:1810/docs)** - OpenAPI/Swagger
- **[Frontend README](./frontend/README.md)** - Frontend details

---

## 🎓 Usage Examples

### Regular Chat
```typescript
// Frontend automatically handles this
// Just type in the input box and press Enter
```

### Character Chat
```typescript
// Select character from sidebar modal
// All messages use that character's personality
```

### Settings
```typescript
// Click Settings in sidebar
// Toggle streaming, change API endpoint, view about info
```

---

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend
# Use gunicorn or uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 1810
```

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🔗 Links

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:1810
- **API Docs**: http://localhost:1810/docs
- **Superadmin**: http://localhost:1810/superadmin

---

## 💡 Tips

- Use **Shift+Enter** for new lines in chat
- **Ctrl+/** to toggle sidebar (desktop)
- Characters remember context within sessions
- Code blocks have automatic copy button
- All conversations are automatically saved

---

## 🏆 Success Checklist

- [x] Backend running on port 1810
- [x] Frontend running on port 5173
- [x] Ollama serving models
- [x] Chat messages sending/receiving
- [x] Character selection working
- [x] Settings modal functional
- [x] Sidebar toggle working
- [x] Tests passing

---

Built with ❤️ using React, FastAPI, and Ollama

**Star ⭐ this repo if you found it helpful!**

 - Personal AI Agent

**ZyrexAi** adalah aplikasi personal AI agent dengan kemampuan RAG (Retrieval-Augmented Generation), roleplay characters, autonomous agents, dan automations. Dibangun dengan FastAPI backend dan React frontend, menggunakan Ollama untuk local LLM inference.

## 🚀 Features

- **Default Chat** - Chat interface dengan streaming responses dari Ollama
- **Roleplay Mode** - Berbincang dengan karakter AI yang bisa dikustomisasi (personality, temperature, avatar)
- **Agents** - Autonomous agents dengan function calling (ReAct pattern) dan tool execution
- **Automations** - Scheduled tasks dengan cron-based triggers
- **Tools** - RAG Search, Web Search (DuckDuckGo), File Reader, System Info
- **RAG Pipeline** - Document ingestion dengan ChromaDB vector storage dan SQLite metadata

## 🛠️ Tech Stack

### Backend
- **FastAPI** + **Uvicorn** (port 1810)
- **SQLite** + **SQLModel** (ORM)
- **ChromaDB** (vector storage)
- **Ollama** (LLM inference)
  - Primary: Qwen 2.5 Coder 14B (4-bit)
  - Fallback: Llama 3.1 8B
- **Sentence Transformers** (all-MiniLM-L6-v2 embeddings)
- **DuckDuckGo Search** (web search tool)

### Frontend
- **Vite** + **React**
- **TailwindCSS** (styling)
- **React Router** (routing)
- **Axios** (HTTP client)
- **TanStack Query** (data fetching)
- **Zustand** (state management)
- **React Markdown** (message rendering)
- **Lucide React** (icons)

## 📂 Project Structure

```
ZyrexAi/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── core/              # Security, logging
│   │   ├── models/            # Database schemas
│   │   ├── services/          # Business logic
│   │   └── tools/             # Agent tools
│   ├── data/                  # SQLite DB & ChromaDB (gitignored)
│   ├── main.py                # Entry point
│   └── requirements.txt
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # Axios setup
│   │   ├── components/        # UI components
│   │   ├── pages/             # Route views
│   │   ├── stores/            # Zustand stores
│   │   └── lib/               # Utils
│   └── package.json
│
└── docs/                       # Documentation
    ├── PLANNED.md             # Roadmap
    └── completed_work.md      # Progress log
```

## 🔧 Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** installed and running on `localhost:11434`
- **GPU** with 8GB+ VRAM (recommended for Qwen 2.5 Coder 14B)

### Ollama Models Setup

```bash
# Pull required models
ollama pull qwen2.5-coder:14b
ollama pull llama3.1:8b
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env

# Edit .env and set your API_KEY
# API_KEY=your-secret-key-here

# Run database migrations (auto-creates tables)
python -c "from app.models.database import init_db; import asyncio; asyncio.run(init_db())"

# Seed default characters
python seed_data.py

# Start server
python main.py
```

Backend akan berjalan di `http://localhost:1810`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp ../.env.example .env

# Edit .env and set your API_KEY (must match backend)
# VITE_API_KEY=your-secret-key-here

# Start dev server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📖 API Documentation

Setelah backend berjalan, akses:
- **API Docs**: http://localhost:1810/docs
- **Backend Info**: http://localhost:1810/
- **SuperAdmin**: http://localhost:1810/superadmin

## 🔒 Security

ZyrexAi menggunakan **simple API Key authentication** untuk single-user local deployment:
- Set `API_KEY` di `.env` (backend dan frontend harus sama)
- Semua API requests menggunakan header `X-API-Key`
- SuperAdmin page dilindungi dengan API Key yang sama

## 🎭 Default Characters

Aplikasi dilengkapi dengan 3 karakter default (seeded):

1. **Assistant** - General helper (temperature: 0.7)
2. **Coder** - Programming expert dengan Qwen 2.5 (temperature: 0.3)
3. **Storyteller** - Creative writer (temperature: 0.9)

## 🤖 Agent Tools

- **RAG Search** - Cari informasi dari dokumen yang diupload
- **Web Search** - Cari informasi dari internet via DuckDuckGo
- **File Reader** - Baca konten file lokal (whitelist path only)
- **System Info** - Dapatkan informasi sistem (waktu, tanggal, stats)

## ⚙️ Automations

Buat scheduled tasks dengan cron expressions:
- Cek berita setiap pagi
- Generate report mingguan
- Backup data otomatis
- Dan lain-lain

## 📝 Development

Lihat `docs/PLANNED.md` untuk roadmap lengkap dan `docs/completed_work.md` untuk progress log.

## 📄 License

GNU General Public License v3.0

## 🙏 Credits

Built with ❤️ using open-source technologies:
- FastAPI
- React
- Ollama
- ChromaDB
- TailwindCSS
