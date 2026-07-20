"""Loan reference data API endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.database_service import DatabaseService
from app.schemas.loan_schemas import (
    LoanProductResponse,
    LoanRateResponse,
    LoanTermResponse,
    LoanFeeResponse,
    LoanRequirementResponse,
    LoanProductDetailResponse,
)

router = APIRouter()


@router.get("/loan-products", response_model=List[LoanProductResponse])
async def list_loan_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all available loan products"""
    products = DatabaseService.get_all_loan_products(db, skip=skip, limit=limit)
    return products


@router.get("/loan-products/{product_id}", response_model=LoanProductDetailResponse)
async def get_loan_product_details(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific loan product"""
    product = DatabaseService.get_loan_product(db, product_id)
    
    if not product:
        raise HTTPException(status_code=404, detail=f"Loan product {product_id} not found")
    
    rate = DatabaseService.get_loan_rate(db, product_id)
    terms = DatabaseService.get_loan_terms_for_product(db, product_id)
    fees = DatabaseService.get_loan_fees_for_product(db, product_id)
    requirements = DatabaseService.get_loan_requirements(db, product_id)
    
    return {
        "product": product,
        "rate": rate,
        "available_terms": terms,
        "fees": fees,
        "requirements": requirements
    }


@router.get("/loan-rates", response_model=List[LoanRateResponse])
async def list_loan_rates(
    db: Session = Depends(get_db)
):
    """Get current interest rates for all loan products"""
    from app.models.loan_models import LoanRate
    rates = db.query(LoanRate).all()
    return rates


@router.get("/loan-rates/{product_id}", response_model=LoanRateResponse)
async def get_loan_rate(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get current interest rate for a specific loan product"""
    rate = DatabaseService.get_loan_rate(db, product_id)
    
    if not rate:
        raise HTTPException(status_code=404, detail=f"No rate found for {product_id}")
    
    return rate


@router.get("/loan-terms/{product_id}", response_model=List[LoanTermResponse])
async def get_loan_terms(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get available loan terms for a specific product"""
    # Verify product exists
    product = DatabaseService.get_loan_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Loan product {product_id} not found")
    
    terms = DatabaseService.get_loan_terms_for_product(db, product_id)
    return terms


@router.get("/loan-fees/{product_id}", response_model=List[LoanFeeResponse])
async def get_loan_fees(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get typical fees for a specific loan product"""
    # Verify product exists
    product = DatabaseService.get_loan_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Loan product {product_id} not found")
    
    fees = DatabaseService.get_loan_fees_for_product(db, product_id)
    return fees


@router.get("/loan-requirements/{product_id}", response_model=LoanRequirementResponse)
async def get_loan_requirements(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get credit and eligibility requirements for a loan product"""
    # Verify product exists
    product = DatabaseService.get_loan_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Loan product {product_id} not found")
    
    requirements = DatabaseService.get_loan_requirements(db, product_id)
    
    if not requirements:
        raise HTTPException(status_code=404, detail=f"No requirements found for {product_id}")
    
    return requirements
