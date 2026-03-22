from typing import List, Optional
from datetime import datetime, timezone
from config.database import db
from models.schemas import User, UserRole
import uuid

class UserRepository:
    @staticmethod
    async def create_user(email: str, name: str, hashed_password: str, role: UserRole = UserRole.USER, picture: Optional[str] = None) -> User:
        """Create a new user"""
        database = db.get_db()
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "password": hashed_password,
            "picture": picture,
            "role": role.value,
            "created_at": datetime.now(timezone.utc)
        }
        
        await database.users.insert_one(user_doc)
        user_doc.pop("password")
        return User(**user_doc)
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email (includes password)"""
        database = db.get_db()
        return await database.users.find_one({"email": email})
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID"""
        database = db.get_db()
        user_doc = await database.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        if user_doc:
            return User(**user_doc)
        return None
    
    @staticmethod
    async def update_user(user_id: str, updates: dict) -> bool:
        """Update user"""
        database = db.get_db()
        result = await database.users.update_one(
            {"user_id": user_id},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def get_all_users(skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users (admin)"""
        database = db.get_db()
        users = await database.users.find(
            {},
            {"_id": 0, "password": 0}
        ).skip(skip).limit(limit).to_list(limit)
        return [User(**u) for u in users]