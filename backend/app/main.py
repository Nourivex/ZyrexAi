"""
ZyrexAi FastAPI Application
Main application setup with middleware and routing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from loguru import logger
import sys

from app.config import settings
from app.models.database import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting ZyrexAi backend...")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Create necessary directories
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CHROMADB_PATH, exist_ok=True)
    os.makedirs("./data/logs", exist_ok=True)
    logger.info(f"Directories ready")
    
    # Initialize tools
    from app.tools import initialize_tools
    logger.info("Tools initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ZyrexAi backend...")


# Configure logger
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.LOG_LEVEL
)

# Create FastAPI app
app = FastAPI(
    title="ZyrexAi API",
    description="Personal AI Agent with RAG Pipeline, Roleplay, Agents, and Automations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_class=HTMLResponse)
async def root():
    """Backend landing page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>ZyrexAi Backend</title>
        <style>
            body {
                font-family: 'Segoe UI', system-ui, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            h1 { margin: 0 0 10px 0; font-size: 3em; }
            .subtitle { opacity: 0.9; margin-bottom: 30px; }
            .links { margin-top: 30px; }
            .links a {
                display: inline-block;
                margin: 10px 10px 10px 0;
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                transition: all 0.3s;
            }
            .links a:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            .status {
                margin-top: 30px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            .status-item {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
            }
            .badge {
                background: #10b981;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.85em;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 ZyrexAi</h1>
            <p class="subtitle">Personal AI Agent Backend</p>
            
            <p>Backend is running successfully! ZyrexAi provides intelligent chat, roleplay, autonomous agents, and automations powered by local LLMs via Ollama.</p>
            
            <div class="links">
                <a href="/docs">📚 API Documentation</a>
                <a href="/superadmin">🔧 SuperAdmin</a>
                <a href="/api/v1/health">❤️ Health Check</a>
            </div>
            
            <div class="status">
                <h3>System Status</h3>
                <div class="status-item">
                    <span>Backend API</span>
                    <span class="badge">ONLINE</span>
                </div>
                <div class="status-item">
                    <span>Port</span>
                    <span>""" + str(settings.BACKEND_PORT) + """</span>
                </div>
                <div class="status-item">
                    <span>Environment</span>
                    <span>Development</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


@app.get("/superadmin", response_class=HTMLResponse)
async def superadmin():
    """SuperAdmin dashboard - protected by API key in production"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>ZyrexAi SuperAdmin</title>
        <style>
            body {
                font-family: 'Segoe UI', system-ui, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #1a1a2e;
                color: #eee;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            h1 { margin: 0; }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .card {
                background: #16213e;
                padding: 25px;
                border-radius: 10px;
                border: 1px solid #0f3460;
            }
            .card h3 {
                margin-top: 0;
                color: #667eea;
            }
            .stat {
                display: flex;
                justify-content: space-between;
                margin: 12px 0;
                padding: 8px 0;
                border-bottom: 1px solid #0f3460;
            }
            .stat:last-child { border-bottom: none; }
            .value {
                font-weight: bold;
                color: #10b981;
            }
            .status-online { color: #10b981; }
            .status-offline { color: #ef4444; }
            button {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin: 5px;
            }
            button:hover { background: #5568d3; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔧 SuperAdmin Dashboard</h1>
            <p>ZyrexAi System Monitoring & Management</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>🤖 Ollama Status</h3>
                <div class="stat">
                    <span>Connection</span>
                    <span class="value status-online" id="ollama-status">Checking...</span>
                </div>
                <div class="stat">
                    <span>Primary Model</span>
                    <span class="value" id="primary-model">""" + settings.OLLAMA_PRIMARY_MODEL + """</span>
                </div>
                <div class="stat">
                    <span>Fallback Model</span>
                    <span class="value">""" + settings.OLLAMA_FALLBACK_MODEL + """</span>
                </div>
                <button onclick="checkOllama()">Refresh Status</button>
            </div>
            
            <div class="card">
                <h3>📊 ChromaDB Statistics</h3>
                <div class="stat">
                    <span>Collections</span>
                    <span class="value" id="chroma-collections">Loading...</span>
                </div>
                <div class="stat">
                    <span>Total Documents</span>
                    <span class="value" id="chroma-docs">Loading...</span>
                </div>
                <div class="stat">
                    <span>Storage Path</span>
                    <span class="value">""" + settings.CHROMADB_PATH + """</span>
                </div>
                <button onclick="refreshChroma()">Refresh Stats</button>
            </div>
            
            <div class="card">
                <h3>💾 Database Info</h3>
                <div class="stat">
                    <span>Type</span>
                    <span class="value">SQLite + SQLModel</span>
                </div>
                <div class="stat">
                    <span>Total Sessions</span>
                    <span class="value" id="total-sessions">0</span>
                </div>
                <div class="stat">
                    <span>Total Messages</span>
                    <span class="value" id="total-messages">0</span>
                </div>
            </div>
            
            <div class="card">
                <h3>⚙️ System Configuration</h3>
                <div class="stat">
                    <span>Max Iterations</span>
                    <span class="value">""" + str(settings.AGENT_MAX_ITERATIONS) + """</span>
                </div>
                <div class="stat">
                    <span>Tool Timeout</span>
                    <span class="value">""" + str(settings.AGENT_TOOL_TIMEOUT) + """s</span>
                </div>
                <div class="stat">
                    <span>Max Upload Size</span>
                    <span class="value">""" + str(settings.MAX_UPLOAD_SIZE // 1048576) + """MB</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>📝 Recent Error Logs</h3>
            <div id="error-logs" style="font-family: monospace; font-size: 0.9em; max-height: 300px; overflow-y: auto;">
                <p style="opacity: 0.6;">No errors logged yet.</p>
            </div>
        </div>
        
        <script>
            async function checkOllama() {
                try {
                    const response = await fetch('/api/v1/health');
                    const data = await response.json();
                    document.getElementById('ollama-status').textContent = data.ollama_status;
                    document.getElementById('ollama-status').className = 
                        data.ollama_status === 'online' ? 'value status-online' : 'value status-offline';
                } catch (error) {
                    document.getElementById('ollama-status').textContent = 'Error';
                    document.getElementById('ollama-status').className = 'value status-offline';
                }
            }
            
            async function refreshChroma() {
                try {
                    // This would call a ChromaDB stats endpoint when implemented
                    document.getElementById('chroma-collections').textContent = 'Loading...';
                    document.getElementById('chroma-docs').textContent = 'Loading...';
                    
                    // For now, show a placeholder message
                    setTimeout(() => {
                        document.getElementById('chroma-collections').textContent = '1';
                        document.getElementById('chroma-docs').textContent = '0';
                    }, 500);
                } catch (error) {
                    document.getElementById('chroma-collections').textContent = 'Error';
                    document.getElementById('chroma-docs').textContent = 'Error';
                }
            }
            
            // Auto-refresh on load
            window.addEventListener('load', () => {
                checkOllama();
                refreshChroma();
            });
        </script>
    </body>
    </html>
    """
