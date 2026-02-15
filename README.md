# 🚀 ZeroAnalyst - AI Data Analyst

**From Zero to Insights in Seconds** - An intelligent data analysis platform powered by Google Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🔐 **User Authentication**
- Secure login & registration with Supabase
- JWT-based session management
- Protected routes and API endpoints
- User-specific data isolation

### 📊 **Intelligent Data Analysis**
- **Automatic Data Cleaning** - Handles missing values, duplicates, and outliers
- **Smart Statistics** - Comprehensive statistical analysis for all data types
- **Interactive Charts** - Beautiful visualizations with Plotly
- **AI-Powered Insights** - Google Gemini generates actionable insights
- **Data Preview** - Clean, formatted data tables

### 💬 **AI Chat Assistant**
- Real-time WebSocket chat with AI agent
- Context-aware responses about your data
- Smart follow-up suggestions
- Natural language queries

### 🕒 **Analysis History**
- Track all analyzed files
- Quick re-analysis with one click
- Delete old analyses
- View analysis metadata (date, size, filename)

### 📦 **AWS S3 Integration**
- **S3 Object Import** - Import files directly from S3 URLs
- **Private Bucket Support** - Handle private files using AWS credentials
- **Multiple Formats** - Support for `s3://` and `https://` S3 links
- **Automated Download** - Fetches and processes data seamlessly

### 🎨 **Modern UI**
- Neon/dark theme with glassmorphism
- Fully responsive design
- Smooth animations
- Mobile-friendly interface

---

## 🛠️ Tech Stack

**Frontend:**
- React + Vite
- React Router for navigation
- Axios for API calls
- Plotly for charts

**Backend:**
- FastAPI (Python)
- Google Gemini AI
- Pandas for data processing
- WebSocket for real-time chat

**Database & Auth:**
- Supabase (PostgreSQL + Auth)
- Row-Level Security (RLS)
- JWT tokens

**Storage & Cloud:**
- AWS S3 (via Boto3)

---

## 🚀 Quick Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- Supabase account (free tier works!)
- Google Gemini API key

### 1. Clone Repository
```bash
git clone https://github.com/Laksh-Devloper/ZeroAnalyst---Agentic-AI-Data-Analyst
cd insightflow
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**
```bash
# Google AI
GOOGLE_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT (generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_SECRET_KEY=your_generated_secret_key

# AWS S3 (Optional - for private buckets)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
```

### 3. Supabase Setup

**A. Create Supabase Project:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and anon key to `.env`

**B. Disable Email Confirmation:**
1. Go to: `Authentication > Providers > Email`
2. Turn OFF "Confirm email"
3. Save

**C. Run SQL to Create Table:**

Go to SQL Editor and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analysis_history table
CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    analysis_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable insert for authenticated users"
ON analysis_history FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Enable select for users based on user_id"
ON analysis_history FOR SELECT
TO authenticated, anon
USING (user_id::text = user_id::text);

CREATE POLICY "Enable delete for users based on user_id"
ON analysis_history FOR DELETE
TO authenticated, anon
USING (user_id::text = user_id::text);
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 5. Start Backend

```bash
cd backend
./start.sh
# Or manually: source venv/bin/activate && python3 app.py
```

---

## 🎯 Usage

1. **Open** http://localhost:5173
2. **Register** a new account
3. **Upload** CSV or Excel file
4. **Analyze** - Get instant insights
5. **Chat** with AI about your data
6. **View History** - See past analyses

---

## 📁 Project Structure

```
insightflow/
├── backend/
│   ├── app.py                 # Main FastAPI app
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   └── history.py        # History endpoints
│   ├── modules/
│   │   ├── data_cleaner.py   # Data cleaning logic
│   │   ├── stats_engine.py   # Statistical analysis
│   │   ├── chart_generator.py # Chart generation
│   │   ├── insight_engine.py # AI insights
│   │   ├── supabase_client.py # Database client
│   │   └── auth_utils.py     # JWT utilities
│   └── .env                  # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── api/             # API client
    │   └── App.jsx          # Main app with routing
    └── package.json
```

---

## 🔑 Environment Variables

### Backend `.env`
```bash
# Google Gemini AI
GOOGLE_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# JWT Authentication
JWT_SECRET_KEY=your_secret_key
```

---

## 🐛 Troubleshooting

### Backend won't start
- Make sure virtual environment is activated: `source venv/bin/activate`
- Check all dependencies installed: `pip3 install -r requirements.txt`
- Verify `.env` file exists with all required keys

### "Supabase credentials not found"
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Make sure no extra spaces or quotes

### "User created but session not established"
- Disable email confirmation in Supabase settings
- Go to: Authentication > Providers > Email > Turn OFF "Confirm email"

### History not showing
- Make sure you ran the SQL to create `analysis_history` table
- Check RLS policies are created correctly
- Verify you're logged in

### Port already in use
- Kill existing process: `lsof -ti:5001 | xargs kill -9`
- Or use different port in `app.py`

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Analysis
- `POST /api/upload` - Upload file
- `POST /api/analyze` - Analyze data (requires auth)
- `POST /api/generate-plotly-chart` - Generate chart

### History
- `GET /api/history/` - Get user's history (requires auth)
- `POST /api/history/save` - Save to history (requires auth)
- `DELETE /api/history/{id}` - Delete history item (requires auth)

### AWS S3
- `POST /api/upload-from-s3` - Import file from S3 URL

### Chat
- `POST /api/chat/init` - Initialize chat session
- `POST /api/chat/message` - Send message
- `WS /ws/chat/{session_id}` - WebSocket chat

---

## 🎨 Features in Detail

### Data Cleaning
- Removes duplicates
- Handles missing values (mean/median/mode imputation)
- Detects and handles outliers
- Type inference and conversion
- Column standardization

### Statistics
- Descriptive stats (mean, median, mode, std dev)
- Distribution analysis
- Correlation matrices
- Trend detection
- Categorical analysis

### AI Insights
- Pattern recognition
- Anomaly detection
- Trend analysis
- Actionable recommendations
- Natural language summaries

---

## 🚀 Deployment

### Backend (Render/Railway)
1. Connect GitHub repo
2. Set environment variables
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_BASE_URL` environment variable

---

##  Acknowledgments

- **Google Gemini** for the amazing AI capabilities
- **FastAPI** for the modern Python framework
- **React** for the beautiful UI
- **Plotly** for interactive visualizations
- **ChromaDB** for vector search


## 🌟 Star History

If you find ZeroAnalyst useful, please consider giving it a star! ⭐

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

## 📝 License

MIT License - feel free to use for personal or commercial projects!

---

**Built with ❤️ using FastAPI, React, and Gemini 2.5 Flash**

*From Zero to Insights in Seconds* ⚡
