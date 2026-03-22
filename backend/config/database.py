from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        cls.client = AsyncIOMotorClient(mongo_url)
        db_name = os.environ.get('DB_NAME', 'test_database')
        cls.db = cls.client[db_name]
        
        # Create indexes
        await cls.create_indexes()
        print(f"✅ Connected to MongoDB: {db_name}")

    @classmethod
    async def create_indexes(cls):
        """Create database indexes for performance"""
        if cls.db is None:
            return
        
        # Users indexes
        await cls.db.users.create_index("email", unique=True)
        await cls.db.users.create_index("user_id")
        
        # Products indexes
        await cls.db.products.create_index("product_id")
        await cls.db.products.create_index("category")
        await cls.db.products.create_index("is_featured")
        
        # Orders indexes
        await cls.db.orders.create_index("user_id")
        await cls.db.orders.create_index("order_id")
        await cls.db.orders.create_index("status")
        
        # Payment transactions indexes
        await cls.db.payment_transactions.create_index("session_id", unique=True)
        await cls.db.payment_transactions.create_index("order_id")
        
        print("✅ Database indexes created")

    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("❌ Disconnected from MongoDB")

    @classmethod
    def get_db(cls):
        """Get database instance"""
        return cls.db

db = Database()