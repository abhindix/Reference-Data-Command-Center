"""Loan-specific models"""

from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.models import Base


class LoanProduct(Base):
    """Loan product types"""
    __tablename__ = "loan_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    product_type = Column(String(50), nullable=False, index=True)
    term_months = Column(Integer)
    min_rate = Column(Float)
    max_rate = Column(Float)
    min_loan_amount = Column(Float)
    max_loan_amount = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LoanProduct(product_id={self.product_id}, name={self.name})>"


class LoanRate(Base):
    """Current loan interest rates"""
    __tablename__ = "loan_rates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(50), nullable=False, index=True)
    current_rate = Column(Float, nullable=False)
    min_rate = Column(Float, nullable=False)
    max_rate = Column(Float, nullable=False)
    market_condition = Column(String(50), default="Normal")
    rate_effective_date = Column(DateTime, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LoanRate(product_id={self.product_id}, rate={self.current_rate})>"


class LoanTerm(Base):
    """Available loan terms"""
    __tablename__ = "loan_terms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(50), nullable=False, index=True)
    term_months = Column(Integer, nullable=False)
    is_common = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LoanTerm(product_id={self.product_id}, term={self.term_months})>"


class LoanFee(Base):
    """Typical loan fees by product"""
    __tablename__ = "loan_fees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(50), nullable=False, index=True)
    fee_type = Column(String(100), nullable=False)
    fee_amount = Column(Float)
    fee_percentage = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LoanFee(product_id={self.product_id}, type={self.fee_type})>"


class LoanRequirement(Base):
    """Credit and eligibility requirements"""
    __tablename__ = "loan_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(50), nullable=False, index=True)
    min_credit_score = Column(Integer)
    max_dti = Column(Float)
    min_down_payment = Column(Float)
    home_equity_required = Column(Float)
    employment_history_months = Column(Integer)
    income_verification_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LoanRequirement(product_id={self.product_id}, min_credit={self.min_credit_score})>"


class LoanApplication(Base):
    """Mock customer loan applications for analytics"""
    __tablename__ = "loan_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String(50), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    product_id = Column(String(50), nullable=False, index=True)
    loan_amount = Column(Float, nullable=False)
    term_months = Column(Integer, nullable=False)
    credit_score = Column(Integer, nullable=False)
    annual_income = Column(Float, nullable=False)
    dti_ratio = Column(Float, nullable=False)
    down_payment_pct = Column(Float)
    status = Column(String(20), nullable=False, default="pending")
    applied_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LoanApplication(customer={self.customer_id}, product={self.product_id}, status={self.status})>"
