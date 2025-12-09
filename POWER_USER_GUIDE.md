# 🚀 ZyrexAi - Power User Features Guide

## ✨ Advanced Features for Maximum Productivity

This guide covers the advanced features that make ZyrexAi a powerful personal AI assistant.

---

## 📌 1. Pin/Favorite Sessions

### Feature Overview
Keep important conversations easily accessible by pinning them to the top of your session list.

### How to Use
1. **Pin a Session**: Hover over any session in the sidebar, click the pin icon
2. **Unpin**: Click the filled pin icon on pinned sessions
3. **Organization**: Pinned sessions appear in a separate "Pinned" section at the top

### Use Cases
- ✅ Pin ongoing project brainstorming sessions
- ✅ Keep important reference conversations accessible
- ✅ Quick access to frequently revisited chats
- ✅ Organize by priority

### Visual Indicators
- 🟣 **Purple pin icon** for pinned sessions (always visible)
- ⚪ **Gray pin icon** for unpinned (shows on hover)
- **Separate sections**: "Pinned" and "All Chats"

---

## 🎯 2. Context Indicators

### Feature Overview
Visual indicators in the input box show you what capabilities are active for your current session.

### Indicator Types

#### RAG Active 🔵
```
🗄️ RAG Active
```
- **Color**: Blue badge
- **Meaning**: Document retrieval is enabled for this session
- **Benefit**: Your AI can search and reference your uploaded documents

#### Tools Available 🟣
```
🔧 4 Tools Available
```
- **Color**: Purple badge
- **Meaning**: Shows how many tools the AI can use
- **Examples**: Web Search, Calculator, Code Executor, File Reader

### Customization
Enable/disable these features in Settings or when creating a new chat session.

---

## 🎭 3. Custom Character Creation

### Feature Overview
Design your own AI personalities with custom system prompts, temperatures, and model preferences.

### How to Create a Character

#### Step 1: Open Character Creator
1. Click "Default Assistant" button in sidebar
2. Click the **"Create Custom Character"** card (purple dashed border)

#### Step 2: Fill Out the Form

**Required Fields:**
- **Character Name**: e.g., "Lycus 4.0", "Data Analyst Pro"
- **System Prompt**: Define personality and expertise
  ```
  Example: "You are an expert data scientist specializing in 
  Python, pandas, and machine learning. You provide clear 
  explanations and production-ready code."
  ```

**Optional Fields:**
- **Description**: Brief summary (shown in character selector)
- **Temperature**: 0 (focused) to 2 (creative)
  - 0-0.5: Deterministic, consistent responses
  - 0.5-1.2: Balanced creativity
  - 1.2-2.0: Highly creative, varied responses
- **Model Preference**: Choose specific LLM
  - qwen2.5-coder:14b-instruct (best for coding)
  - llama3.1:8b (fast, general)
  - llama3.1:70b (most capable)
  - mistral:latest (balanced)

#### Step 3: Preview & Save
- Review the preview card at the bottom
- Click **"Create Character"**
- Your new character appears in the character selector

### Character Examples

#### Example 1: Code Review Specialist
```yaml
Name: Code Reviewer
Description: Expert at reviewing code quality and suggesting improvements
System Prompt: |
  You are a senior software engineer specializing in code reviews.
  You analyze code for:
  - Performance issues
  - Security vulnerabilities
  - Best practices violations
  - Readability and maintainability
  Provide specific, actionable feedback with examples.
Temperature: 0.3
Model: qwen2.5-coder:14b-instruct
```

#### Example 2: Creative Writer
```yaml
Name: Storyteller Pro
Description: Creative fiction writer with vivid descriptions
System Prompt: |
  You are an award-winning fiction author. You craft:
  - Rich, immersive descriptions
  - Complex, believable characters
  - Engaging plot twists
  - Emotional depth
  Your writing style is descriptive yet accessible.
Temperature: 1.5
Model: llama3.1:70b
```

#### Example 3: Data Analyst
```yaml
Name: Data Analyst
Description: Expert in data analysis and visualization
System Prompt: |
  You are a data analyst with expertise in:
  - Python (pandas, numpy, matplotlib, seaborn)
  - Statistical analysis
  - Data cleaning and preprocessing
  - Creating clear visualizations
  You provide production-ready code with explanations.
Temperature: 0.4
Model: qwen2.5-coder:14b-instruct
```

### Best Practices

#### Temperature Guidelines
| Temperature | Best For | Behavior |
|-------------|----------|----------|
| 0.0 - 0.3 | Code, math, facts | Very consistent, deterministic |
| 0.4 - 0.7 | General chat, Q&A | Balanced, reliable |
| 0.8 - 1.2 | Creative tasks | More varied, interesting |
| 1.3 - 2.0 | Fiction, brainstorming | Highly creative, unpredictable |

#### System Prompt Tips
✅ **Do:**
- Be specific about expertise areas
- Include examples of desired behavior
- Mention tone and style preferences
- List specific skills or knowledge domains

❌ **Don't:**
- Make prompts too vague
- Include contradictory instructions
- Overload with too many capabilities

---

## 🔧 4. Enhanced Code Block Copy

### Features
- ✅ **One-click copy** button on all code blocks
- ✅ **Visual confirmation** (checkmark appears for 2 seconds)
- ✅ **Syntax highlighting** with language label
- ✅ **Multiple languages** supported

### Supported Languages
- Python, JavaScript, TypeScript
- HTML, CSS, JSON
- Bash, PowerShell
- SQL, YAML, Markdown
- And many more...

### How It Works
1. AI generates response with code blocks
2. Code is automatically syntax-highlighted
3. Language label appears at the top
4. Click copy icon in top-right corner
5. Code is copied to clipboard
6. Checkmark confirms successful copy

---

## 📊 5. Session Management (Upcoming)

### Planned Features
- **Search Sessions**: Find conversations by content
- **Export Sessions**: Download as JSON/Markdown
- **Session Tags**: Categorize conversations
- **Session Analytics**: View usage statistics

---

## 🗂️ 6. RAG & Document Management (Upcoming)

### Document Ingestion UI
Upload and manage your personal knowledge base:
- **Supported Formats**: PDF, DOCX, TXT, MD
- **Collections**: Organize documents by topic
- **Search**: Semantic search across all documents
- **Scope Selection**: Choose which collections to query

### Smart RAG Features
- **Query Rewriting**: AI optimizes your search queries
- **Context Ranking**: Most relevant passages first
- **Source Citations**: See where information came from
- **Real-time Updates**: Add documents anytime

---

## 🤖 7. Tool & Agent System (Upcoming)

### Custom Tool Definition
Create your own tools without coding:
- **JSON/YAML Configuration**: Define tool schemas
- **Parameters**: Specify required inputs
- **Execution**: Backend runs your tool safely
- **Integration**: Tools auto-available to agents

### Automation & Scheduling
Schedule AI tasks to run automatically:
- **Cron Expressions**: "Every Monday at 9 AM"
- **Triggers**: Time-based, event-based, webhook-based
- **Actions**: Run agents, send notifications, process data
- **Monitoring**: View execution history and logs

### Tool Feedback in Chat
See AI thinking process in real-time:
```
Thinking... 
[Using Web Search: 'Tesla stock price'] 
→ Found 3 results
→ Analyzing data
→ Generating final answer
```

---

## ⚡ Power User Tips

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Ctrl + /` | Toggle sidebar (future) |
| `Ctrl + K` | Focus search (future) |

### Pro Workflows

#### Workflow 1: Project-Based Organization
1. Create custom character for your project (e.g., "Project X Assistant")
2. Pin the main project session
3. Enable RAG with project documentation
4. Switch to this character when working on the project

#### Workflow 2: Multi-Model Strategy
1. Use **Coder** character (temp 0.3) for implementation
2. Switch to **Storyteller** (temp 0.9) for documentation
3. Use **Default** (temp 0.7) for general planning

#### Workflow 3: Context Management
1. Monitor context indicators in input box
2. Enable RAG only when needed (better performance)
3. Use tool-enabled sessions for research tasks
4. Keep focused sessions for simple Q&A

---

## 🎯 Advanced Use Cases

### Use Case 1: Learning Assistant
**Setup:**
- Create "Tutor" character with teaching-focused prompt
- Temperature: 0.6 (patient, consistent explanations)
- Pin study sessions by topic
- Enable RAG with course materials

**Benefits:**
- Consistent teaching style
- Quick access to past lessons
- Reference course documents automatically

### Use Case 2: Code Companion
**Setup:**
- Use "Coder" character
- Temperature: 0.3 (precise, reliable code)
- Enable code execution tool
- Pin active project sessions

**Benefits:**
- High-quality code generation
- Consistent coding style
- Tool access for testing
- Project history preserved

### Use Case 3: Content Creation
**Setup:**
- Create "Content Writer" character
- Temperature: 1.0 (creative but coherent)
- Pin content calendar sessions
- Multiple drafts per session

**Benefits:**
- Creative output
- Organized by content type
- Version history in sessions

---

## 🔐 Privacy & Security

### Data Storage
- ✅ All sessions stored locally (SQLite)
- ✅ Characters stored locally
- ✅ Documents stored locally (ChromaDB)
- ✅ No data sent to external services (except Ollama)

### Best Practices
- Use strong API keys in production
- Regularly backup your database
- Review pinned sessions periodically
- Clear old sessions to save space

---

## 🚀 Coming Soon

### Q1 2025
- [ ] Session search and filtering
- [ ] Export/import sessions
- [ ] Session templates
- [ ] Character marketplace

### Q2 2025
- [ ] Multi-user support
- [ ] Team collaboration features
- [ ] Advanced automation workflows
- [ ] Plugin system

### Q3 2025
- [ ] Mobile app (PWA)
- [ ] Voice input/output
- [ ] Real-time collaboration
- [ ] Advanced analytics

---

## 📚 Additional Resources

- **Main Guide**: [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)
- **API Documentation**: http://localhost:1810/docs
- **Frontend README**: [frontend/README.md](./frontend/README.md)
- **GitHub Issues**: Report bugs and request features

---

## 💡 Feedback & Contributions

We'd love to hear from you!

- **Feature Requests**: Open a GitHub issue
- **Bug Reports**: Include steps to reproduce
- **Pull Requests**: Contributions welcome!
- **Discussions**: Join our community (future)

---

Built with ❤️ for power users who demand the best from their AI assistant.

**Happy AI-ing! 🚀✨**
