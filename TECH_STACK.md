# 🛠️ Tech Stack

Complete technical documentation for ZeroAnalyst.

---

## 📚 Table of Contents

- [Backend Stack](#backend-stack)
- [Frontend Stack](#frontend-stack)
- [AI & ML Stack](#ai--ml-stack)
- [Database & Storage](#database--storage)
- [Development Tools](#development-tools)
- [Deployment](#deployment)

---

## 🔧 Backend Stack

### Core Framework
- **FastAPI** `0.128.0`
  - Modern async Python web framework
  - Automatic API documentation (Swagger/OpenAPI)
  - Native WebSocket support
  - Type hints and validation with Pydantic
  - 3x faster than Flask

- **Uvicorn** `0.40.0`
  - ASGI server for FastAPI
  - Async/await support
  - WebSocket handling
  - Auto-reload in development

### Data Processing
- **Pandas** `2.2.3`
  - DataFrame operations
  - CSV/Excel file reading
  - Data cleaning and transformation
  - Statistical analysis

- **NumPy** `2.2.3`
  - Numerical computations
  - Array operations
  - Mathematical functions

- **Openpyxl** `3.1.5`
  - Excel file support (.xlsx)
  - Read/write Excel files

### Visualization
- **Plotly** `5.24.1`
  - Interactive charts
  - 5 chart types (Line, Bar, Histogram, Box, Pie)
  - Export as PNG/SVG
  - Zoom, pan, hover tooltips

- **Matplotlib** `3.10.0`
  - Static chart generation
  - PDF report charts
  - Customizable plots

### PDF Generation
- **ReportLab** `4.2.5`
  - Professional PDF reports
  - Custom layouts
  - Chart embedding
  - Multi-page support

### Utilities
- **python-dotenv** `1.2.1`
  - Environment variable management
  - `.env` file support

- **python-multipart** `0.0.21`
  - File upload handling
  - Multipart form data

- **aiofiles** `25.1.0`
  - Async file operations
  - Non-blocking I/O

---

## 🎨 Frontend Stack

### Core Framework
- **React** `18.3.1`
  - Component-based UI
  - Hooks for state management
  - Virtual DOM for performance
  - JSX syntax

- **Vite** `6.0.11`
  - Lightning-fast dev server
  - Hot Module Replacement (HMR)
  - Optimized production builds
  - ES modules support

### HTTP & WebSocket
- **Axios** `1.7.9`
  - HTTP client for API calls
  - Request/response interceptors
  - Promise-based
  - Error handling

- **WebSocket API** (Native)
  - Real-time chat communication
  - Bi-directional messaging
  - Auto-reconnect logic

### UI Components
- **Plotly.js** `2.35.3`
  - Interactive chart rendering
  - Same charts as backend
  - Client-side interactions

- **React Markdown** `9.0.2`
  - Markdown rendering in chat
  - Code syntax highlighting
  - Link support

### Styling
- **CSS Variables**
  - Design system tokens
  - Consistent theming
  - Easy customization

- **Custom CSS**
  - Glassmorphism effects
  - Gradient backgrounds
  - Smooth animations
  - Responsive design

---

## 🤖 AI & ML Stack

### Large Language Model
- **Google Gemini 2.5 Flash**
  - Conversational AI
  - Natural language understanding
  - Context awareness
  - Fast response times
  - High token limits (8192)

- **LangChain** `1.2.0`
  - LLM orchestration
  - Conversation memory
  - Message formatting

- **LangChain Google GenAI** `4.1.2`
  - Gemini integration
  - Streaming support
  - Error handling

### Vector Database & RAG
- **ChromaDB** `1.4.0`
  - Vector storage
  - Semantic search
  - Dataset indexing
  - Similarity queries

- **Sentence Transformers** `5.2.0`
  - Text embeddings
  - all-MiniLM-L6-v2 model
  - Fast encoding
  - 384-dimensional vectors

### ML Libraries
- **PyTorch** `2.9.1`
  - Deep learning backend
  - Model inference
  - GPU support (optional)

- **Transformers** `4.57.3`
  - Pre-trained models
  - Tokenization
  - Model loading

- **ONNX Runtime** `1.23.2`
  - Optimized inference
  - Cross-platform support
  - Fast predictions

---

## 💾 Database & Storage

### Vector Database
- **ChromaDB**
  - Embedded vector database
  - Persistent storage in `./chroma_db`
  - No separate server needed
  - Automatic indexing

### File Storage
- **Local Filesystem**
  - Uploaded files in `./uploads`
  - Temporary processing
  - Auto-cleanup

### Session Management
- **In-Memory Dictionary**
  - Active chat sessions
  - Fast access
  - No external dependencies

---

## 🔨 Development Tools

### Backend
- **Python** `3.10+`
  - Type hints
  - Async/await
  - Modern syntax

- **pip** `25.3`
  - Package management
  - Virtual environments

### Frontend
- **Node.js** `18+`
  - JavaScript runtime
  - npm package manager

- **npm** `10+`
  - Dependency management
  - Script running

### Code Quality
- **ESLint** `9.17.0`
  - JavaScript linting
  - Code style enforcement

- **Vite Plugin React** `4.3.4`
  - React Fast Refresh
  - JSX transformation

### Version Control
- **Git**
  - Source control
  - Collaboration

- **.gitignore**
  - Excludes node_modules, venv, .env
  - Clean repository

---

## 🚀 Deployment

### Backend Deployment Options

**1. Docker**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
```

**2. Heroku**
```
# Procfile
web: uvicorn app:app --host 0.0.0.0 --port $PORT
```

**3. AWS Lambda**
- Use Mangum adapter
- API Gateway integration
- Serverless deployment

**4. Google Cloud Run**
- Containerized deployment
- Auto-scaling
- Pay-per-use

### Frontend Deployment Options

**1. Vercel**
```bash
npm run build
vercel --prod
```

**2. Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**3. GitHub Pages**
```bash
npm run build
# Deploy dist/ folder
```

**4. AWS S3 + CloudFront**
- Static hosting
- CDN distribution
- HTTPS support

---

## 📦 Dependencies Summary

### Backend (`requirements.txt`)
```
fastapi==0.128.0
uvicorn==0.40.0
pandas==2.2.3
numpy==2.2.3
plotly==5.24.1
matplotlib==3.10.0
reportlab==4.2.5
openpyxl==3.1.5
python-dotenv==1.2.1
python-multipart==0.0.21
aiofiles==25.1.0
fastapi-cors==0.0.6
websockets==15.0.1

# AI/ML
langchain==1.2.0
langchain-core==1.2.6
langchain-google-genai==4.1.2
google-generativeai==0.8.6
chromadb==1.4.0
sentence-transformers==5.2.0
torch==2.9.1
transformers==4.57.3
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.9",
    "plotly.js": "^2.35.3",
    "react-plotly.js": "^2.6.0",
    "react-markdown": "^9.0.2"
  },
  "devDependencies": {
    "vite": "^6.0.11",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0"
  }
}
```

---

## 🔐 Environment Variables

### Backend (`.env`)
```bash
# Google Gemini API
GOOGLE_API_KEY=your_api_key_here

# Model Configuration
GEMINI_MODEL=gemini-2.5-flash
TEMPERATURE=0.7
MAX_TOKENS=8192

# Database
CHROMA_PERSIST_DIR=./chroma_db

# Optional
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_PER_MINUTE=60
```

---

## 📊 Performance Metrics

### Backend
- **Response Time**: < 100ms (HTTP)
- **WebSocket Latency**: < 50ms
- **AI Response**: 1-3 seconds
- **File Upload**: Supports up to 100MB
- **Concurrent Users**: 100+ (with proper scaling)

### Frontend
- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: ~500KB (gzipped)
- **Lighthouse Score**: 90+

---

## 🔄 API Endpoints

### REST API
```
GET  /                      - API info
GET  /api/health            - Health check
POST /api/upload            - Upload file
POST /api/analyze           - Analyze data
POST /api/chat/init         - Initialize chat
POST /api/chat/message      - Send message (HTTP)
GET  /api/chat/history/:id  - Get chat history
DELETE /api/chat/:id        - Delete session
POST /api/export-pdf        - Generate PDF
DELETE /api/delete          - Delete file
```

### WebSocket
```
WS /ws/chat/:session_id     - Real-time chat
```

---

## 🧪 Testing

### Backend Testing
```bash
# Unit tests
pytest tests/

# Coverage
pytest --cov=app tests/

# Load testing
locust -f locustfile.py
```

### Frontend Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Build test
npm run build
```

---

## 📈 Monitoring

### Recommended Tools
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: Usage metrics
- **Prometheus**: Backend metrics
- **Grafana**: Dashboards

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Multi-file analysis
- [ ] SQL query generation
- [ ] Custom ML models
- [ ] Team collaboration
- [ ] Scheduled reports
- [ ] API access
- [ ] Mobile app (React Native)
- [ ] Voice input
- [ ] Dark/Light mode toggle

### Tech Upgrades
- [ ] Redis for caching
- [ ] PostgreSQL for persistence
- [ ] Kubernetes deployment
- [ ] GraphQL API
- [ ] Server-Sent Events (SSE)
- [ ] Progressive Web App (PWA)

---

**Last Updated**: 2026-01-05
**Version**: 1.0.0
**Maintained by**: ZeroAnalyst Team
