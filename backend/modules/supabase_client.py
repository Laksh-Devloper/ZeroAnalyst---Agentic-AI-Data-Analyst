"""
Supabase client for database operations
Handles user authentication and data storage
"""

from supabase import create_client, Client
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Initialize Supabase client (lazy loading)
_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Get or create Supabase client instance."""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                "Supabase credentials not found. "
                "Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file"
            )
        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            raise ValueError(f"Failed to initialize Supabase client: {str(e)}")
    return _supabase_client


class SupabaseDB:
    """Supabase database operations wrapper."""
    
    def __init__(self):
        # Don't initialize client in __init__, use lazy loading
        self._client = None
    
    @property
    def client(self) -> Client:
        """Lazy-load Supabase client."""
        if self._client is None:
            self._client = get_supabase_client()
        return self._client
    
    # ==================== User Operations ====================
    
    def create_user(self, email: str, password: str, full_name: str = None) -> Dict[str, Any]:
        """
        Create a new user account.
        
        Args:
            email: User email
            password: User password (will be hashed)
            full_name: Optional full name
        
        Returns:
            User data dictionary
        """
        try:
            # Supabase handles password hashing automatically
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name
                    }
                }
            })
            return response
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")
    
    def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """
        Sign in a user.
        
        Args:
            email: User email
            password: User password
        
        Returns:
            Session data with access token
        """
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return response
        except Exception as e:
            raise Exception(f"Invalid credentials: {str(e)}")
    
    def get_user(self, access_token: str) -> Dict[str, Any]:
        """
        Get user data from access token.
        
        Args:
            access_token: JWT access token
        
        Returns:
            User data dictionary
        """
        try:
            response = self.client.auth.get_user(access_token)
            return response
        except Exception as e:
            raise Exception(f"Error getting user: {str(e)}")
    
    def sign_out(self, access_token: str) -> None:
        """Sign out a user."""
        try:
            self.client.auth.sign_out()
        except Exception as e:
            raise Exception(f"Error signing out: {str(e)}")
    
    # ==================== Analysis History Operations ====================
    
    def save_analysis(
        self,
        user_id: str,
        filename: str,
        analysis_results: Dict[str, Any],
        file_size: int = None
    ) -> Dict[str, Any]:
        """
        Save analysis results to database.
        
        Args:
            user_id: User ID
            filename: Original filename
            analysis_results: Analysis results dictionary
            file_size: Optional file size in bytes
        
        Returns:
            Saved analysis record
        """
        try:
            data = {
                "user_id": user_id,
                "filename": filename,
                "file_size": file_size,
                "analysis_results": analysis_results
            }
            
            response = self.client.table("analysis_history").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error saving analysis: {str(e)}")
    
    def get_user_analyses(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> list:
        """
        Get user's analysis history.
        
        Args:
            user_id: User ID
            limit: Number of records to return
            offset: Offset for pagination
        
        Returns:
            List of analysis records
        """
        try:
            response = (
                self.client.table("analysis_history")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return response.data
        except Exception as e:
            raise Exception(f"Error getting analyses: {str(e)}")
    
    def get_analysis_by_id(self, analysis_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific analysis by ID.
        
        Args:
            analysis_id: Analysis ID
            user_id: User ID (for authorization)
        
        Returns:
            Analysis record or None
        """
        try:
            response = (
                self.client.table("analysis_history")
                .select("*")
                .eq("id", analysis_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            return None
    
    def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """
        Delete an analysis.
        
        Args:
            analysis_id: Analysis ID
            user_id: User ID (for authorization)
        
        Returns:
            True if deleted successfully
        """
        try:
            self.client.table("analysis_history").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Error deleting analysis: {str(e)}")


# Lazy-loaded global instance
class _DBProxy:
    """Proxy to lazily initialize SupabaseDB."""
    def __init__(self):
        self._instance = None
    
    def __getattr__(self, name):
        if self._instance is None:
            self._instance = SupabaseDB()
        return getattr(self._instance, name)

db = _DBProxy()
