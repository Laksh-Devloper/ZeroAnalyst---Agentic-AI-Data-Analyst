# 🤖 ZeroAnalyst

**From Zero to Insights in Seconds**

ZeroAnalyst is an AI-powered data analysis platform that lets you chat with your data in natural language. No coding, no analysts, no waiting—just upload your CSV/Excel file and start asking questions.

![ZeroAnalyst](https://img.shields.io/badge/AI-Powered-00ff88?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini_2.5-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## ✨ Features

### 💬 **Conversational AI Analysis**
- Ask questions in plain English
- Get instant answers powered by Gemini 2.5 Flash
- Real-time WebSocket communication
- Context-aware follow-up questions
- Smart suggested questions

### 🧹 **Automated Data Cleaning**
- Removes duplicates automatically
- Handles missing values intelligently
- Auto-detects column types (numeric, categorical, datetime)
- Filters low-quality columns

### 📊 **Interactive Visualizations**
- 5 chart types: Line, Bar, Histogram, Box, Pie
- Powered by Plotly (zoom, pan, hover)
- Export charts as PNG/SVG
- AI generates perfect charts for your data

### 📈 **Statistical Analysis**
- Descriptive statistics (mean, median, std dev, quartiles)
- Correlation matrix with top relationships
- Distribution analysis
- Data quality metrics

### 🔮 **AI-Powered Insights**
- Automatic trend detection
- Anomaly and outlier detection
- Correlation discovery
- Pattern recognition
- Predictive analytics

### 📄 **Export & Share**
- Professional PDF reports
- Download cleaned CSV files
- Export individual charts
- Complete analysis summaries

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/zeroanalyst.git
cd zeroanalyst
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**3. Configure Environment**
```bash
# Create .env file in backend/
echo "GOOGLE_API_KEY=your_api_key_here" > .env
echo "GEMINI_MODEL=gemini-2.5-flash" >> .env
echo "TEMPERATURE=0.7" >> .env
echo "MAX_TOKENS=8192" >> .env
echo "CHROMA_PERSIST_DIR=./chroma_db" >> .env
```

**4. Frontend Setup**
```bash
cd ../frontend
npm install
```

**5. Start the Application**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
python app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**6. Open your browser**
```
http://localhost:5173
```

---

## 📖 Usage

### Basic Workflow

1. **Upload Your Data**
   - Drag & drop CSV or Excel file
   - See instant preview

2. **Analyze**
   - Click "Analyze" button
   - Get automated insights in seconds

3. **Chat with AI**
   - Click "💬 Chat with AI"
   - Ask questions like:
     - "Show me revenue trends"
     - "Are there any anomalies?"
     - "What factors affect sales?"
     - "Compare Q1 vs Q2 performance"

4. **Export Results**
   - Download PDF report
   - Export cleaned data
   - Save individual charts

### Example Questions

```
"What are the top 5 products by revenue?"
"Show me the correlation between price and sales"
"Are there any outliers in the data?"
"What's the average customer age by region?"
"Predict next month's sales based on trends"
"Which factors most influence customer churn?"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│              React + Vite + Plotly              │
│         (Beautiful UI with WebSocket)           │
└────────────────┬────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────┐
│                  Backend                        │
│            FastAPI + Uvicorn                    │
│         (Async, Real-time, RESTful)             │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐   ┌───▼───┐   ┌───▼────┐
│  AI   │   │  RAG  │   │ Tools  │
│Engine │   │Pipeline│   │Registry│
│Gemini │   │Chroma │   │Analysis│
└───────┘   └───────┘   └────────┘
```

### Components

- **Frontend**: React SPA with real-time chat
- **Backend**: FastAPI async server
- **AI Engine**: Gemini 2.5 Flash for conversations
- **RAG Pipeline**: ChromaDB for semantic search
- **Tool Registry**: Analysis functions (stats, charts, insights)

---

## 🎨 Design

### Color Palette
- **Background**: `#0a0a0f` (Deep Black)
- **Surface**: `#1a1a24` (Dark Gray)
- **Accent Green**: `#00ff88` (Neon)
- **Accent Cyan**: `#00d4ff` (Bright)
- **Accent Pink**: `#ff0066` (Vibrant)

### Typography
- **Sans**: Inter (Modern, Clean)
- **Mono**: JetBrains Mono (Code)

### Effects
- Glassmorphism
- Gradient backgrounds
- Glow effects
- Smooth animations
- Micro-interactions

---

## 📊 Tech Stack

See [TECH_STACK.md](TECH_STACK.md) for detailed information.

**Backend:**
- FastAPI, Uvicorn, Python 3.10+
- Google Gemini 2.5 Flash
- ChromaDB, Sentence Transformers
- Pandas, NumPy, Plotly

**Frontend:**
- React 18, Vite
- Axios, React Markdown
- Plotly.js
- CSS Variables

---

## 🔒 Security

- API keys stored in `.env` (never committed)
- CORS configured for localhost only
- Data processed locally (not stored)
- WebSocket authentication
- Input validation on all endpoints

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for the amazing AI capabilities
- **FastAPI** for the modern Python framework
- **React** for the beautiful UI
- **Plotly** for interactive visualizations
- **ChromaDB** for vector search


## 🌟 Star History

If you find ZeroAnalyst useful, please consider giving it a star! ⭐

---

**Built with ❤️ using FastAPI, React, and Gemini 2.5 Flash**

*From Zero to Insights in Seconds* ⚡
