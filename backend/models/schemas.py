from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    picture: Optional[str] = None
    role: UserRole = UserRole.USER
    created_at: datetime

class SessionData(BaseModel):
    session_id: str

class ProductBase(BaseModel):
    name: str
    description: str
    category: str
    price: float
    images: List[str]
    sizes: List[str] = []
    stock: int = 1
    is_featured: bool = False

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    created_at: datetime

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    size: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: Optional[str] = None
    image: str

class ShippingAddress(BaseModel):
    full_name: str
    address: str
    city: str
    state: str
    zip_code: str
    phone: str

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    payment_method: str
    shipping_address: ShippingAddress

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

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = ""

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime

class FeedbackCreate(BaseModel):
    message: str
    email: Optional[str] = None

class Newsletter(BaseModel):
    email: EmailStr