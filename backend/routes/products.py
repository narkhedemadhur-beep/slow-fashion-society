from fastapi import APIRouter, HTTPException, Request, Header, Depends
from typing import List, Optional

from models.schemas import Product, ProductCreate
from repositories.product_repository import ProductRepository
from utils.auth import get_current_user, get_current_admin, User

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all products with optional filters"""
    return await ProductRepository.get_products(category, search, skip, limit)

@router.get("/featured", response_model=List[Product])
async def get_featured_products():
    """Get featured products"""
    return await ProductRepository.get_featured_products()

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get product by ID"""
    product = await ProductRepository.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{product_id}/related", response_model=List[Product])
async def get_related_products(product_id: str):
    """Get related products"""
    product = await ProductRepository.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return await ProductRepository.get_related_products(product_id, product.category)

@router.post("", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Create a new product (Admin only)"""
    await get_current_admin(request, authorization)
    return await ProductRepository.create_product(product_data.model_dump())

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductCreate,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Update product (Admin only)"""
    await get_current_admin(request, authorization)
    
    success = await ProductRepository.update_product(product_id, product_data.model_dump())
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await ProductRepository.get_product_by_id(product_id)
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Delete product (Admin only)"""
    await get_current_admin(request, authorization)
    
    success = await ProductRepository.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}