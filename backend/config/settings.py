import os
from typing import List

class Settings:
    # MongoDB
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.environ.get('DB_NAME', 'test_database')
    
    # CORS
    CORS_ORIGINS: List[str] = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # JWT
    JWT_SECRET: str = os.environ.get('JWT_SECRET', 'change-this-secret-key')
    JWT_ALGORITHM: str = os.environ.get('JWT_ALGORITHM', 'HS256')
    JWT_EXPIRATION_DAYS: int = 7
    
    # Stripe
    STRIPE_API_KEY: str = os.environ.get('STRIPE_API_KEY', '')
    
    # Admin
    ADMIN_EMAILS: List[str] = os.environ.get('ADMIN_EMAILS', '').split(',')
    
    # Password hashing
    BCRYPT_ROUNDS: int = 12

settings = Settings()