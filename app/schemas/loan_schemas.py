"""Loan model schemas for API responses"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class LoanProductBase(BaseModel):
    """Base loan product schema"""
    product_id: str
    name: str
    product_type: str
    term_months: Optional[int] = None
    min_rate: Optional[float] = None
    max_rate: Optional[float] = None
    min_loan_amount: Optional[float] = None
    max_loan_amount: Optional[float] = None
    description: Optional[str] = None


class LoanProductResponse(LoanProductBase):
    """Response schema for loan products"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoanRateResponse(BaseModel):
    """Response schema for loan rates"""
    id: UUID
    product_id: str
    current_rate: float
    min_rate: float
    max_rate: float
    market_condition: str
    rate_effective_date: datetime
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


class LoanTermResponse(BaseModel):
    """Response schema for loan terms"""
    id: UUID
    product_id: str
    term_months: int
    is_common: bool

    model_config = ConfigDict(from_attributes=True)


class LoanFeeResponse(BaseModel):
    """Response schema for loan fees"""
    id: UUID
    product_id: str
    fee_type: str
    fee_amount: Optional[float] = None
    fee_percentage: Optional[float] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LoanRequirementResponse(BaseModel):
    """Response schema for loan requirements"""
    id: UUID
    product_id: str
    min_credit_score: Optional[int] = None
    max_dti: Optional[float] = None
    min_down_payment: Optional[float] = None
    home_equity_required: Optional[float] = None
    employment_history_months: Optional[int] = None
    income_verification_required: bool

    model_config = ConfigDict(from_attributes=True)


class LoanProductDetailResponse(BaseModel):
    """Comprehensive loan product details"""
    product: LoanProductResponse
    rate: Optional[LoanRateResponse] = None
    available_terms: list[LoanTermResponse] = []
    fees: list[LoanFeeResponse] = []
    requirements: Optional[LoanRequirementResponse] = None

    model_config = ConfigDict(from_attributes=True)


class LoanApplicationResponse(BaseModel):
    """Response schema for a customer loan application"""
    id: UUID
    customer_id: str
    customer_name: str
    product_id: str
    loan_amount: float
    term_months: int
    credit_score: int
    annual_income: float
    dti_ratio: float
    down_payment_pct: Optional[float] = None
    status: str
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EligibilityRequest(BaseModel):
    """Customer profile submitted for eligibility check"""
    credit_score: int
    annual_income: float
    dti_ratio: float
    down_payment_pct: float
    desired_amount: float


class EligibilityResult(BaseModel):
    """Eligibility result for one loan product"""
    product_id: str
    name: str
    product_type: str
    eligible: bool
    reasons: list[str] = []


class LoanApplicationSubmitRequest(BaseModel):
    """Request to submit a new loan application"""
    customer_name: str
    email: Optional[str] = None
    product_id: str
    loan_amount: float
    term_months: int
    credit_score: int
    annual_income: float
    dti_ratio: float
    down_payment_pct: Optional[float] = None


class LoanApplicationSubmitResponse(BaseModel):
    """Response after submitting an application"""
    id: UUID
    customer_id: str
    status: str
    product_id: str
    loan_amount: float
    message: str
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationStatusUpdate(BaseModel):
    """Request to update application status"""
    status: str  # 'approved' or 'rejected'
    notes: Optional[str] = None
