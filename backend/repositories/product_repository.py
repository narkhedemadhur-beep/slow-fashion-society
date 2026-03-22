from typing import List, Optional
from datetime import datetime, timezone
from config.database import db
from models.schemas import Product
import uuid

class ProductRepository:
    @staticmethod
    async def create_product(product_data: dict) -> Product:
        """Create a new product"""
        database = db.get_db()
        product_id = f"prod_{uuid.uuid4().hex[:12]}"
        
        product_doc = {
            **product_data,
            "product_id": product_id,
            "created_at": datetime.now(timezone.utc)
        }
        
        await database.products.insert_one(product_doc)
        return Product(**product_doc)
    
    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[Product]:
        """Get product by ID"""
        database = db.get_db()
        product_doc = await database.products.find_one({"product_id": product_id}, {"_id": 0})
        if product_doc:
            return Product(**product_doc)
        return None
    
    @staticmethod
    async def get_products(category: Optional[str] = None, search: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
        """Get products with filters"""
        database = db.get_db()
        query = {}
        
        if category:
            query["category"] = category
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        products = await database.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
        return [Product(**p) for p in products]
    
    @staticmethod
    async def get_featured_products(limit: int = 8) -> List[Product]:
        """Get featured products"""
        database = db.get_db()
        products = await database.products.find({"is_featured": True}, {"_id": 0}).limit(limit).to_list(limit)
        return [Product(**p) for p in products]
    
    @staticmethod
    async def get_related_products(product_id: str, category: str, limit: int = 4) -> List[Product]:
        """Get related products by category"""
        database = db.get_db()
        products = await database.products.find(
            {"category": category, "product_id": {"$ne": product_id}},
            {"_id": 0}
        ).limit(limit).to_list(limit)
        return [Product(**p) for p in products]
    
    @staticmethod
    async def update_product(product_id: str, updates: dict) -> bool:
        """Update product"""
        database = db.get_db()
        result = await database.products.update_one(
            {"product_id": product_id},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def delete_product(product_id: str) -> bool:
        """Delete product"""
        database = db.get_db()
        result = await database.products.delete_one({"product_id": product_id})
        return result.deleted_count > 0