"""
Analysis history routes
Handles saving and retrieving analysis history
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from routes.auth import get_current_user
from modules.supabase_client import db

router = APIRouter(prefix="/api/history", tags=["History"])


class AnalysisHistoryItem(BaseModel):
    id: str
    filename: str
    file_size: Optional[int] = None
    created_at: str


class SaveAnalysisRequest(BaseModel):
    filename: str
    filepath: str
    file_size: Optional[int] = None


@router.get("/", response_model=List[AnalysisHistoryItem])
async def get_history(user = Depends(get_current_user)):
    """
    Get user's analysis history.
    Returns list of previously analyzed files (metadata only, no results).
    """
    try:
        analyses = db.get_user_analyses(user.id, limit=50)
        
        return [
            {
                "id": analysis["id"],
                "filename": analysis["filename"],
                "file_size": analysis.get("file_size"),
                "created_at": analysis["created_at"]
            }
            for analysis in analyses
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get history: {str(e)}"
        )


@router.post("/save")
async def save_to_history(data: SaveAnalysisRequest, user = Depends(get_current_user)):
    """
    Save analysis metadata to history.
    Only saves filename and metadata, not the full analysis results.
    """
    try:
        result = db.save_analysis(
            user_id=user.id,
            filename=data.filename,
            analysis_results={"filepath": data.filepath},  # Store filepath for re-analysis
            file_size=data.file_size
        )
        
        return {
            "success": True,
            "id": result["id"],
            "message": "Analysis saved to history"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save history: {str(e)}"
        )


@router.delete("/{history_id}")
async def delete_history_item(history_id: str, user = Depends(get_current_user)):
    """
    Delete an analysis from history.
    """
    try:
        success = db.delete_analysis(history_id, user.id)
        
        if success:
            return {"success": True, "message": "History item deleted"}
        else:
            raise HTTPException(status_code=404, detail="History item not found")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete history: {str(e)}"
        )
