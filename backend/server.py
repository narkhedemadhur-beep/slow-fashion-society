from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT & Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Stripe setup
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SessionData(BaseModel):
    session_id: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    name: str
    description: str
    category: str
    price: float
    images: List[str]
    sizes: List[str] = []
    stock: int = 1
    condition: str = "Good"
    created_at: datetime
    is_featured: bool = False

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    images: List[str]
    sizes: List[str] = []
    stock: int = 1
    condition: str = "Good"
    is_featured: bool = False

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    category_id: str
    name: str
    slug: str
    image: str

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str

class ShippingAddress(BaseModel):
    full_name: str
    address: str
    city: str
    state: str
    zip_code: str
    phone: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str
    user_id: str
    items: List[OrderItem]
    total: float
    status: str = "pending"
    payment_method: str
    shipping_address: ShippingAddress
    created_at: datetime

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    payment_method: str
    shipping_address: ShippingAddress

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str = ""

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    feedback_id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    message: str
    created_at: datetime

class FeedbackCreate(BaseModel):
    message: str
    email: Optional[str] = None

class Newsletter(BaseModel):
    email: EmailStr

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    session_id: str
    order_id: Optional[str] = None
    user_id: str
    amount: float
    currency: str
    status: str
    payment_status: str
    metadata: Dict[str, Any] = {}
    created_at: datetime

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> Optional[User]:
    token = None
    
    # Check cookie first
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a JWT token
    if token.startswith("eyJ"):
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
            if not user_doc:
                raise HTTPException(status_code=401, detail="User not found")
            
            if isinstance(user_doc['created_at'], str):
                user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
            
            return User(**user_doc)
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    # Otherwise, check session token in database
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def get_current_user_optional(request: Request, authorization: Optional[str] = Header(None)) -> Optional[User]:
    try:
        return await get_current_user(request, authorization)
    except:
        return None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup")
async def signup(user_data: UserSignup):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pwd,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token({"user_id": user_id, "email": user_data.email})
    
    return {"token": token, "user": {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "picture": None
    }}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token({"user_id": user_doc["user_id"], "email": user_doc["email"]})
    
    return {"token": token, "user": {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture")
    }}

@api_router.post("/auth/session")
async def create_session(session_data: SessionData, response: Response):
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
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
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
    
    return {"user": {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture
    }}

@api_router.get("/auth/me")
async def get_me(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, authorization: Optional[str] = Header(None)):
    token = request.cookies.get("session_token")
    
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
    
    if token and not token.startswith("eyJ"):
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

# ==================== PRODUCTS ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/featured", response_model=List[Product])
async def get_featured_products():
    products = await db.products.find({"is_featured": True}, {"_id": 0}).limit(8).to_list(8)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_doc = product_data.model_dump()
    product_doc["product_id"] = product_id
    product_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.insert_one(product_doc)
    
    product_doc["created_at"] = datetime.fromisoformat(product_doc["created_at"])
    return Product(**product_doc)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": product_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return Product(**product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ==================== CATEGORIES ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

# ==================== CART ====================

@api_router.get("/cart")
async def get_cart(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    cart = await db.cart.find_one({"user_id": user.user_id}, {"_id": 0})
    if not cart:
        return {"user_id": user.user_id, "items": []}
    
    return cart

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    cart = await db.cart.find_one({"user_id": user.user_id})
    
    if cart:
        # Check if product already in cart
        items = cart.get("items", [])
        found = False
        for i, cart_item in enumerate(items):
            if cart_item["product_id"] == item.product_id:
                items[i]["quantity"] += item.quantity
                found = True
                break
        
        if not found:
            items.append(item.model_dump())
        
        await db.cart.update_one(
            {"user_id": user.user_id},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc)}}
        )
    else:
        cart_doc = {
            "user_id": user.user_id,
            "items": [item.model_dump()],
            "updated_at": datetime.now(timezone.utc)
        }
        await db.cart.insert_one(cart_doc)
    
    return {"message": "Item added to cart"}

@api_router.post("/cart/remove")
async def remove_from_cart(item: CartItem, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    cart = await db.cart.find_one({"user_id": user.user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [i for i in cart.get("items", []) if i["product_id"] != item.product_id]
    
    await db.cart.update_one(
        {"user_id": user.user_id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.post("/cart/clear")
async def clear_cart(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    await db.cart.update_one(
        {"user_id": user.user_id},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Cart cleared"}

# ==================== WISHLIST ====================

@api_router.get("/wishlist")
async def get_wishlist(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    wishlist = await db.wishlist.find_one({"user_id": user.user_id}, {"_id": 0})
    if not wishlist:
        return {"user_id": user.user_id, "product_ids": []}
    
    return wishlist

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    wishlist = await db.wishlist.find_one({"user_id": user.user_id})
    
    if wishlist:
        product_ids = wishlist.get("product_ids", [])
        if product_id not in product_ids:
            product_ids.append(product_id)
            await db.wishlist.update_one(
                {"user_id": user.user_id},
                {"$set": {"product_ids": product_ids}}
            )
    else:
        wishlist_doc = {
            "user_id": user.user_id,
            "product_ids": [product_id]
        }
        await db.wishlist.insert_one(wishlist_doc)
    
    return {"message": "Added to wishlist"}

@api_router.post("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    wishlist = await db.wishlist.find_one({"user_id": user.user_id})
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    product_ids = [pid for pid in wishlist.get("product_ids", []) if pid != product_id]
    
    await db.wishlist.update_one(
        {"user_id": user.user_id},
        {"$set": {"product_ids": product_ids}}
    )
    
    return {"message": "Removed from wishlist"}

# ==================== ORDERS ====================

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    orders = await db.orders.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/orders/all", response_model=List[Order])
async def get_all_orders(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = order_data.model_dump()
    order_doc["order_id"] = order_id
    order_doc["user_id"] = user.user_id
    order_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.cart.update_one(
        {"user_id": user.user_id},
        {"$set": {"items": []}}
    )
    
    order_doc["created_at"] = datetime.fromisoformat(order_doc["created_at"])
    return Order(**order_doc)

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}

# ==================== PAYMENT ====================

@api_router.post("/payment/checkout")
async def create_checkout_session(
    request: Request,
    body: Dict[str, Any],
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(request, authorization)
    
    order_id = body.get("order_id")
    origin_url = body.get("origin_url")
    
    if not order_id or not origin_url:
        raise HTTPException(status_code=400, detail="Missing order_id or origin_url")
    
    # Get order
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    amount = float(order["total"])
    currency = "usd"
    
    # Build URLs
    success_url = f"{origin_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/checkout"
    
    # Initialize Stripe
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id, "user_id": user.user_id}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "order_id": order_id,
        "user_id": user.user_id,
        "amount": amount,
        "currency": currency,
        "status": "pending",
        "payment_status": "pending",
        "metadata": {"order_id": order_id},
        "created_at": datetime.now(timezone.utc)
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payment/status/{session_id}")
async def get_payment_status(
    session_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(request, authorization)
    
    # Initialize Stripe
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Get checkout status
    checkout_status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if transaction:
        # Only update if not already processed
        if transaction["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": checkout_status.status,
                    "payment_status": checkout_status.payment_status
                }}
            )
            
            # Update order status if paid
            if checkout_status.payment_status == "paid":
                order_id = transaction.get("order_id")
                if order_id:
                    await db.orders.update_one(
                        {"order_id": order_id},
                        {"$set": {"status": "confirmed"}}
                    )
    
    return checkout_status

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook
        if webhook_response.payment_status == "paid":
            transaction = await db.payment_transactions.find_one(
                {"session_id": webhook_response.session_id},
                {"_id": 0}
            )
            if transaction and transaction["payment_status"] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {
                        "status": webhook_response.event_type,
                        "payment_status": webhook_response.payment_status
                    }}
                )
                
                # Update order
                order_id = transaction.get("order_id")
                if order_id:
                    await db.orders.update_one(
                        {"order_id": order_id},
                        {"$set": {"status": "confirmed"}}
                    )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== REVIEWS ====================

@api_router.get("/reviews/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_doc = review_data.model_dump()
    review_doc["review_id"] = review_id
    review_doc["user_id"] = user.user_id
    review_doc["user_name"] = user.name
    review_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.reviews.insert_one(review_doc)
    
    review_doc["created_at"] = datetime.fromisoformat(review_doc["created_at"])
    return Review(**review_doc)

# ==================== FEEDBACK ====================

@api_router.post("/feedback")
async def submit_feedback(feedback_data: FeedbackCreate, request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user_optional(request, authorization)
    
    feedback_id = f"feedback_{uuid.uuid4().hex[:12]}"
    feedback_doc = {
        "feedback_id": feedback_id,
        "user_id": user.user_id if user else None,
        "user_email": feedback_data.email if feedback_data.email else (user.email if user else None),
        "message": feedback_data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.feedback.insert_one(feedback_doc)
    
    return {"message": "Feedback submitted successfully"}

@api_router.get("/feedback", response_model=List[Feedback])
async def get_all_feedback(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    
    feedback_list = await db.feedback.find({}, {"_id": 0}).to_list(1000)
    
    for feedback in feedback_list:
        if isinstance(feedback.get('created_at'), str):
            feedback['created_at'] = datetime.fromisoformat(feedback['created_at'])
    
    return feedback_list

# ==================== NEWSLETTER ====================

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(newsletter: Newsletter):
    existing = await db.newsletter.find_one({"email": newsletter.email})
    if existing:
        return {"message": "Already subscribed"}
    
    newsletter_doc = {
        "email": newsletter.email,
        "subscribed_at": datetime.now(timezone.utc)
    }
    await db.newsletter.insert_one(newsletter_doc)
    
    return {"message": "Subscribed successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
