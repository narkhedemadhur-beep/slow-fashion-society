import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime, timezone
import uuid

async def seed_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.products.delete_many({})
    
    # Seed categories
    categories = [
        {
            "category_id": "cat_001",
            "name": "Tops",
            "slug": "tops",
            "image": "https://images.unsplash.com/photo-1675537057530-312348c6caa2?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "category_id": "cat_002",
            "name": "Dresses",
            "slug": "dresses",
            "image": "https://images.unsplash.com/photo-1769107805528-964f4de0e342?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "category_id": "cat_003",
            "name": "Outerwear",
            "slug": "outerwear",
            "image": "https://images.unsplash.com/photo-1760533091973-1262bf57d244?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "category_id": "cat_004",
            "name": "Accessories",
            "slug": "accessories",
            "image": "https://images.unsplash.com/photo-1652340155016-e3c66dcba7f3?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "category_id": "cat_005",
            "name": "Bags",
            "slug": "bags",
            "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=srgb&fm=jpg&q=85"
        },
        {
            "category_id": "cat_006",
            "name": "Shoes",
            "slug": "shoes",
            "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?crop=entropy&cs=srgb&fm=jpg&q=85"
        }
    ]
    
    await db.categories.insert_many(categories)
    print("✅ Categories seeded")
    
    # Seed products
    products = [
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Vintage Silk Blouse",
            "description": "Beautiful vintage silk blouse in cream color. Perfect condition with delicate pearl buttons.",
            "category": "Tops",
            "price": 45.00,
            "images": ["https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["S", "M"],
            "stock": 1,
            "condition": "Excellent",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Floral Maxi Dress",
            "description": "Stunning vintage floral maxi dress. Flowing silhouette perfect for summer days.",
            "category": "Dresses",
            "price": 68.00,
            "images": ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["M", "L"],
            "stock": 1,
            "condition": "Excellent",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Leather Bomber Jacket",
            "description": "Classic brown leather bomber jacket. Timeless piece that never goes out of style.",
            "category": "Outerwear",
            "price": 125.00,
            "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["S", "M", "L"],
            "stock": 1,
            "condition": "Good",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Gold Chain Necklace",
            "description": "Elegant vintage gold chain necklace. Perfect layering piece.",
            "category": "Accessories",
            "price": 32.00,
            "images": ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["One Size"],
            "stock": 1,
            "condition": "Excellent",
            "is_featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Denim Button-Up Shirt",
            "description": "Classic denim shirt in excellent condition. Versatile wardrobe staple.",
            "category": "Tops",
            "price": 38.00,
            "images": ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["M", "L"],
            "stock": 1,
            "condition": "Excellent",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Bohemian Print Dress",
            "description": "Gorgeous bohemian print dress with bell sleeves. One-of-a-kind piece.",
            "category": "Dresses",
            "price": 55.00,
            "images": ["https://images.unsplash.com/photo-1612336307429-8b446f1e0234?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["S", "M"],
            "stock": 1,
            "condition": "Good",
            "is_featured": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Leather Crossbody Bag",
            "description": "Vintage brown leather crossbody bag. Perfect everyday companion.",
            "category": "Bags",
            "price": 48.00,
            "images": ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["One Size"],
            "stock": 1,
            "condition": "Good",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "product_id": f"prod_{uuid.uuid4().hex[:12]}",
            "name": "Suede Ankle Boots",
            "description": "Stylish suede ankle boots in tan. Comfortable and chic.",
            "category": "Shoes",
            "price": 72.00,
            "images": ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?crop=entropy&cs=srgb&fm=jpg&q=85"],
            "sizes": ["7", "8", "9"],
            "stock": 1,
            "condition": "Good",
            "is_featured": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✅ {len(products)} products seeded")
    
    client.close()
    print("✅ Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
