"""
Authentication routes for ZeroAnalyst
Handles user registration, login, and token management
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from modules.supabase_client import db
from modules.auth_utils import create_access_token, verify_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ==================== Pydantic Models ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None


# ==================== Dependency: Get Current User ====================

async def get_current_user(authorization: str = Header(None)):
    """
    Dependency to get current authenticated user from token.
    
    Usage:
        @app.get("/protected")
        async def protected_route(user = Depends(get_current_user)):
            return {"user_id": user["id"]}
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
        
        # Get user from Supabase
        user_response = db.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        
        return user_response.user
    
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


# ==================== Authentication Endpoints ====================

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """
    Register a new user account.
    
    Returns:
        Access token and user data
    """
    try:
        # Create user in Supabase
        response = db.create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        
        # Check if user was created
        if not response or not hasattr(response, 'user') or not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        # Check if session exists
        if not hasattr(response, 'session') or not response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User created but session not established. Please try logging in."
            )
        
        # Return token and user data
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": user_data.full_name
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        
        # Handle common errors
        if "already registered" in error_msg.lower() or "already exists" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {error_msg}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.
    
    Returns:
        Access token and user data
    """
    try:
        # Sign in with Supabase
        response = db.sign_in(
            email=credentials.email,
            password=credentials.password
        )
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Get user metadata
        user_metadata = response.user.user_metadata or {}
        
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": user_metadata.get("full_name")
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user = Depends(get_current_user)):
    """
    Get current user information.
    
    Requires authentication.
    """
    user_metadata = user.user_metadata or {}
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user_metadata.get("full_name")
    }


@router.post("/logout")
async def logout(user = Depends(get_current_user)):
    """
    Logout current user.
    
    Requires authentication.
    """
    try:
        # Note: Supabase handles token invalidation on client side
        # Server-side logout is handled by Supabase automatically
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )


@router.post("/refresh")
async def refresh_token(user = Depends(get_current_user)):
    """
    Refresh access token.
    
    Requires authentication.
    """
    try:
        # Create new token
        new_token = create_access_token(
            data={"sub": user.id, "email": user.email}
        )
        
        return {
            "access_token": new_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )
