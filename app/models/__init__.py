"""SQLAlchemy models"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models to register them with Base
from app.models.reference_data import ReferenceData
from app.models.loan_models import (
    LoanProduct,
    LoanRate,
    LoanTerm,
    LoanFee,
    LoanRequirement,
)

__all__ = [
    "Base",
    "ReferenceData",
    "LoanProduct",
    "LoanRate",
    "LoanTerm",
    "LoanFee",
    "LoanRequirement",
]

