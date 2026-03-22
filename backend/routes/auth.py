from fastapi import APIRouter, HTTPException, Response, Request, Header
from typing import Optional
from datetime import datetime, timezone, timedelta
import httpx
import uuid

from models.schemas import UserCreate, UserLogin, SessionData, User, UserRole
from repositories.user_repository import UserRepository
from utils.auth import hash_password, verify_password, create_jwt_token, get_current_user, is_admin_email
from config.database import db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup(user_data: UserCreate):
    """Register a new user"""
    # Check if user exists
    existing_user = await UserRepository.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Determine role
    role = UserRole.ADMIN if is_admin_email(user_data.email) else UserRole.USER
    
    # Create user
    hashed_pwd = hash_password(user_data.password)
    user = await UserRepository.create_user(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_pwd,
        role=role
    )
    
    # Create JWT token
    token = create_jwt_token({"user_id": user.user_id, "email": user.email, "role": user.role.value})
    
    return {
        "token": token,
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "role": user.role
        }
    }

@router.post("/login")
async def login(credentials: UserLogin):
    """Login user"""
    user_doc = await UserRepository.get_user_by_email(credentials.email)
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_jwt_token({
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "role": user_doc.get("role", UserRole.USER.value)
    })
    
    return {
        "token": token,
        "user": {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc.get("picture"),
            "role": user_doc.get("role", UserRole.USER.value)
        }
    }

@router.post("/session")
async def create_session(session_data: SessionData, response: Response):
    """Create session from OAuth"""
    session_id = session_data.session_id
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to get session data: {str(e)}")
    
    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture")
    session_token = data.get("session_token")
    
    if not email or not session_token:
        raise HTTPException(status_code=400, detail="Invalid session data")
    
    # Check if user exists
    user_doc = await UserRepository.get_user_by_email(email)
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update user info
        await UserRepository.update_user(user_id, {"name": name, "picture": picture})
        role = user_doc.get("role", UserRole.USER.value)
    else:
        # Determine role
        role = UserRole.ADMIN if is_admin_email(email) else UserRole.USER
        # Create new user
        user = await UserRepository.create_user(
            email=email,
            name=name,
            hashed_password="",  # OAuth users don't have password
            role=role,
            picture=picture
        )
        user_id = user.user_id
        role = role.value
    
    # Store session
    database = db.get_db()
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await database.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": role
        }
    }

@router.get("/me", response_model=User)
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    """Get current user"""
    return await get_current_user(request, authorization)

@router.post("/logout")
async def logout(request: Request, response: Response, authorization: Optional[str] = Header(None)):
    """Logout user"""
    token = request.cookies.get("session_token")
    
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
    
    if token and not token.startswith("eyJ"):
        database = db.get_db()
        await database.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}