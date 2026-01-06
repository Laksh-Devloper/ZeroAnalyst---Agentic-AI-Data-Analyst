"""
ZeroAnalyst - FastAPI Backend
Modern async API with WebSocket support for real-time AI chat
"""

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
import os
import json
import asyncio
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv

from modules.data_cleaner import DataCleaner
from modules.stats_engine import StatsEngine
from modules.chart_generator import ChartGenerator
from modules.insight_engine import InsightEngine
from modules.dynamic_chart_generator import DynamicChartGenerator
from modules.agent_engine import AgentEngine
from modules.rag_pipeline import RAGPipeline
from modules.tool_registry import ToolRegistry

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ZeroAnalyst API",
    description="Agentic AI Data Analyst - From Zero to Insights in Seconds",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global state (in production, use Redis or database)
active_sessions: Dict[str, Dict[str, Any]] = {}


# ==================== Pydantic Models ====================

class AnalyzeRequest(BaseModel):
    filepath: str


class ChartRequest(BaseModel):
    filepath: str
    column_name: str
    chart_type: str


class ChatInitRequest(BaseModel):
    filepath: str


class ChatMessageRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    message: str
    timestamp: str
    suggestions: Optional[List[str]] = None


# ==================== Helper Functions ====================

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def clean_nan_values(obj):
    """Recursively replace NaN and infinity values with None for JSON serialization."""
    if isinstance(obj, dict):
        return {key: clean_nan_values(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    return obj


# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        'service': 'ZeroAnalyst API',
        'status': 'running',
        'version': '1.0.0',
        'description': 'Agentic AI Data Analyst',
        'endpoints': {
            'health': '/api/health',
            'upload': '/api/upload',
            'analyze': '/api/analyze',
            'chat_init': '/api/chat/init',
            'chat_message': '/api/chat/message',
            'chat_ws': '/ws/chat/{session_id}',
            'docs': '/docs'
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        'status': 'healthy',
        'message': 'ZeroAnalyst API is running',
        'timestamp': datetime.now().isoformat()
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Handle file upload and return preview.
    
    Returns:
        JSON with file info and data preview
    """
    try:
        # Validate file
        if not allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail='Invalid file type. Please upload CSV or Excel file'
            )
        
        # Read file content
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f'File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB'
            )
        
        # Save file
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, 'wb') as f:
            f.write(content)
        
        # Read file based on extension
        file_ext = filename.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        
        # Basic validation
        if df.empty:
            raise HTTPException(status_code=400, detail='File is empty')
        
        # Return preview
        preview = {
            'filename': filename,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': list(df.columns),
            'preview': df.head(10).to_dict(orient='records'),
            'filepath': filepath
        }
        
        return preview
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error processing file: {str(e)}')


@app.post("/api/analyze")
async def analyze_data(request: AnalyzeRequest):
    """
    Analyze uploaded data and return comprehensive results.
    
    Returns:
        JSON with cleaned data, statistics, charts, and insights
    """
    try:
        filepath = request.filepath
        
        if not filepath or not os.path.exists(filepath):
            raise HTTPException(status_code=400, detail='Invalid file path')
        
        # Read file
        file_ext = filepath.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        
        # Step 1: Clean data
        cleaner = DataCleaner(df)
        cleaned_df, cleaning_report = cleaner.clean()
        
        # Step 2: Calculate statistics
        stats_engine = StatsEngine(cleaned_df, cleaning_report['column_types'])
        stats = stats_engine.calculate_all()
        
        # Step 3: Generate charts
        chart_generator = ChartGenerator(cleaned_df, cleaning_report['column_types'])
        charts = chart_generator.generate_all()
        
        # Step 4: Generate insights
        insight_engine = InsightEngine(cleaned_df, cleaning_report['column_types'], stats)
        insights = insight_engine.generate_insights()
        
        # Step 5: Get cleaned data preview
        preview = cleaner.get_preview(rows=10)
        
        # Compile results
        results = {
            'cleaning_report': cleaning_report,
            'preview': preview,
            'statistics': stats,
            'charts': charts,
            'insights': insights
        }
        
        # Clean NaN values
        results = clean_nan_values(results)
        
        return results
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error analyzing data: {str(e)}')


@app.post("/api/generate-plotly-chart")
async def generate_plotly_chart(request: ChartRequest):
    """
    Generate an interactive Plotly chart for a specific column.
    
    Returns:
        JSON with Plotly chart configuration
    """
    try:
        from modules.plotly_chart_generator import PlotlyChartGenerator
        
        filepath = request.filepath
        column_name = request.column_name
        chart_type = request.chart_type
        
        if not filepath or not os.path.exists(filepath):
            raise HTTPException(status_code=400, detail='Invalid file path')
        
        if not column_name:
            raise HTTPException(status_code=400, detail='Column name is required')
        
        # Read file
        file_ext = filepath.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        
        # Clean data
        cleaner = DataCleaner(df)
        cleaned_df, cleaning_report = cleaner.clean()
        
        # Generate chart
        chart_gen = PlotlyChartGenerator(cleaned_df, cleaning_report['column_types'])
        
        chart_config = None
        if chart_type == 'line':
            chart_config = chart_gen.generate_line_chart(column_name)
        elif chart_type == 'bar':
            chart_config = chart_gen.generate_bar_chart(column_name)
        elif chart_type == 'histogram':
            chart_config = chart_gen.generate_histogram(column_name)
        elif chart_type == 'box':
            chart_config = chart_gen.generate_box_plot(column_name)
        elif chart_type == 'pie':
            chart_config = chart_gen.generate_pie_chart(column_name)
        else:
            raise HTTPException(status_code=400, detail='Invalid chart type')
        
        if not chart_config:
            col_type = cleaning_report['column_types'].get(column_name, 'unknown')
            raise HTTPException(
                status_code=400,
                detail=f'Cannot generate {chart_type} chart for column "{column_name}" (type: {col_type})'
            )
        
        return {
            'chart': chart_config,
            'column_name': column_name,
            'chart_type': chart_type
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error generating chart: {str(e)}')


# ==================== AI Chat Endpoints ====================

@app.post("/api/chat/init")
async def init_chat(request: ChatInitRequest):
    """
    Initialize a chat session with the AI agent.
    
    Returns:
        Session ID and initial greeting
    """
    try:
        filepath = request.filepath
        
        if not filepath or not os.path.exists(filepath):
            raise HTTPException(status_code=400, detail='Invalid file path')
        
        # Read and analyze file
        file_ext = filepath.rsplit('.', 1)[1].lower()
        if file_ext == 'csv':
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        
        # Clean data
        cleaner = DataCleaner(df)
        cleaned_df, cleaning_report = cleaner.clean()
        
        # Calculate statistics
        stats_engine = StatsEngine(cleaned_df, cleaning_report['column_types'])
        stats = stats_engine.calculate_all()
        
        # Initialize RAG pipeline
        rag = RAGPipeline()
        filename = os.path.basename(filepath)
        rag.index_dataset(cleaned_df, filename, cleaning_report['column_types'], stats)
        
        # Create data context for agent
        data_context = {
            'filename': filename,
            'rows': len(cleaned_df),
            'columns': list(cleaned_df.columns),
            'column_types': cleaning_report['column_types'],
            'statistics': stats
        }
        
        # Initialize agent
        agent = AgentEngine(data_context=data_context)
        
        # Create tools
        from modules.plotly_chart_generator import PlotlyChartGenerator
        chart_gen = PlotlyChartGenerator(cleaned_df, cleaning_report['column_types'])
        tool_registry = ToolRegistry(cleaned_df, cleaning_report['column_types'], stats_engine, chart_gen)
        
        # Generate session ID
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Store session
        active_sessions[session_id] = {
            'agent': agent,
            'rag': rag,
            'tool_registry': tool_registry,
            'df': cleaned_df,
            'filepath': filepath,
            'data_context': data_context,
            'created_at': datetime.now().isoformat()
        }
        
        # Generate initial greeting
        greeting = f"""✅ **I've analyzed your data!**

📊 **Dataset Overview:**
- File: {filename}
- Rows: {len(cleaned_df):,}
- Columns: {len(cleaned_df.columns)}

I'm ready to help you explore this data. What would you like to know?"""
        
        suggestions = agent.generate_suggested_questions()
        
        return {
            'session_id': session_id,
            'message': greeting,
            'suggestions': suggestions,
            'data_context': data_context
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error initializing chat: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f'Error initializing chat: {str(e)}')


@app.post("/api/chat/message")
async def chat_message(request: ChatMessageRequest):
    """
    Send a message to the AI agent.
    
    Returns:
        Agent's response
    """
    try:
        session_id = request.session_id
        message = request.message
        
        if session_id not in active_sessions:
            raise HTTPException(status_code=404, detail='Session not found')
        
        session = active_sessions[session_id]
        agent = session['agent']
        
        # Get response from agent
        response = agent.chat(message)
        
        # Generate new suggestions
        suggestions = agent.generate_suggested_questions()
        
        return {
            'session_id': session_id,
            'message': response,
            'suggestions': suggestions,
            'timestamp': datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error processing message: {str(e)}')


@app.get("/api/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get conversation history for a session."""
    try:
        if session_id not in active_sessions:
            raise HTTPException(status_code=404, detail='Session not found')
        
        session = active_sessions[session_id]
        agent = session['agent']
        
        history = agent.get_conversation_history()
        
        return {
            'session_id': session_id,
            'history': history,
            'created_at': session['created_at']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error retrieving history: {str(e)}')


@app.delete("/api/chat/{session_id}")
async def delete_chat_session(session_id: str):
    """Delete a chat session."""
    try:
        if session_id in active_sessions:
            # Clean up
            session = active_sessions[session_id]
            if 'rag' in session:
                session['rag'].clear()
            
            del active_sessions[session_id]
            
            return {'message': 'Session deleted successfully'}
        else:
            raise HTTPException(status_code=404, detail='Session not found')
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error deleting session: {str(e)}')


# ==================== WebSocket for Real-Time Chat ====================

@app.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time streaming chat.
    """
    await websocket.accept()
    
    try:
        if session_id not in active_sessions:
            await websocket.send_json({
                'error': 'Session not found',
                'code': 404
            })
            await websocket.close()
            return
        
        session = active_sessions[session_id]
        agent = session['agent']
        
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_message = message_data.get('message', '')
            
            if not user_message:
                continue
            
            # Send typing indicator
            await websocket.send_json({
                'type': 'typing',
                'status': 'thinking'
            })
            
            # Get response from agent (in production, stream this)
            response = agent.chat(user_message)
            
            # Send response
            await websocket.send_json({
                'type': 'message',
                'message': response,
                'timestamp': datetime.now().isoformat()
            })
            
            # Send suggestions
            suggestions = agent.generate_suggested_questions()
            await websocket.send_json({
                'type': 'suggestions',
                'suggestions': suggestions
            })
    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        await websocket.send_json({
            'type': 'error',
            'error': str(e)
        })
        await websocket.close()


# ==================== PDF Export ====================

@app.post("/api/export-pdf")
async def export_pdf(request: dict):
    """
    Generate and download PDF report.
    
    Returns:
        PDF file download
    """
    try:
        from modules.pdf_generator import PDFReportGenerator
        
        filepath = request.get('filepath')
        analysis_results = request.get('analysis_results')
        
        if not filepath or not analysis_results:
            raise HTTPException(status_code=400, detail='Missing required data')
        
        filename = os.path.basename(filepath)
        
        # Generate PDF
        pdf_gen = PDFReportGenerator(filename)
        pdf_data = pdf_gen.generate(analysis_results)
        
        # Create response
        pdf_buffer = BytesIO(pdf_data)
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            pdf_buffer,
            media_type='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename=ZeroAnalyst_Report_{filename.rsplit(".", 1)[0]}.pdf'
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error generating PDF: {str(e)}')


# ==================== File Management ====================

@app.delete("/api/delete")
async def delete_file(request: dict):
    """Delete uploaded file."""
    try:
        filepath = request.get('filepath')
        
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
            return {'message': 'File deleted successfully'}
        
        raise HTTPException(status_code=404, detail='File not found')
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error deleting file: {str(e)}')


# ==================== Run Server ====================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=5001,
        reload=True,
        log_level="info"
    )
