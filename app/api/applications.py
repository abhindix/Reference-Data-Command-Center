"""Customer loan applications and eligibility API"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.database_service import DatabaseService
from app.schemas.loan_schemas import (
    LoanApplicationResponse,
    EligibilityRequest,
    EligibilityResult,
    LoanApplicationSubmitRequest,
    LoanApplicationSubmitResponse,
)

router = APIRouter()


@router.get("/applications", response_model=List[LoanApplicationResponse])
async def list_applications(db: Session = Depends(get_db)):
    """Return all mock customer applications ordered by most recent first"""
    from app.models.loan_models import LoanApplication
    return db.query(LoanApplication).order_by(LoanApplication.applied_at.desc()).all()


@router.get("/applications/stats")
async def application_stats(db: Session = Depends(get_db)):
    """Aggregated statistics over all applications"""
    from app.models.loan_models import LoanApplication

    apps = db.query(LoanApplication).all()
    total = len(apps)
    if total == 0:
        return {
            "total": 0, "approved": 0, "rejected": 0, "pending": 0,
            "approval_rate": 0, "by_product": {}, "avg_credit_by_status": {},
        }

    approved = sum(1 for a in apps if a.status == "approved")
    rejected = sum(1 for a in apps if a.status == "rejected")
    pending = sum(1 for a in apps if a.status == "pending")

    by_product: dict = {}
    for app in apps:
        entry = by_product.setdefault(app.product_id, {"total": 0, "approved": 0, "rejected": 0, "pending": 0})
        entry["total"] += 1
        entry[app.status] += 1

    avg_credit_by_status: dict = {}
    for status in ("approved", "rejected", "pending"):
        subset = [a.credit_score for a in apps if a.status == status]
        if subset:
            avg_credit_by_status[status] = round(sum(subset) / len(subset))

    return {
        "total": total,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "approval_rate": round(approved / total, 3),
        "by_product": by_product,
        "avg_credit_by_status": avg_credit_by_status,
    }


@router.post("/applications/check-eligibility", response_model=List[EligibilityResult])
async def check_eligibility(req: EligibilityRequest, db: Session = Depends(get_db)):
    """Check which loan products a customer profile is eligible for"""
    products = DatabaseService.get_all_loan_products(db, limit=200)
    results = []

    for product in products:
        requirement = DatabaseService.get_loan_requirements(db, product.product_id)
        fails: List[str] = []

        if requirement:
            if requirement.min_credit_score and req.credit_score < requirement.min_credit_score:
                fails.append(f"Credit score {req.credit_score} < min {requirement.min_credit_score}")
            if requirement.max_dti and req.dti_ratio > requirement.max_dti:
                fails.append(f"DTI {req.dti_ratio:.0%} > max {requirement.max_dti:.0%}")
            if requirement.min_down_payment and req.down_payment_pct < requirement.min_down_payment:
                fails.append(f"Down payment {req.down_payment_pct:.0%} < min {requirement.min_down_payment:.0%}")

        if product.min_loan_amount and req.desired_amount < product.min_loan_amount:
            fails.append(f"${req.desired_amount:,.0f} below min ${product.min_loan_amount:,.0f}")
        if product.max_loan_amount and req.desired_amount > product.max_loan_amount:
            fails.append(f"${req.desired_amount:,.0f} exceeds max ${product.max_loan_amount:,.0f}")

        results.append(EligibilityResult(
            product_id=product.product_id,
            name=product.name,
            product_type=product.product_type,
            eligible=len(fails) == 0,
            reasons=fails,
        ))

    # Eligible products first, then alphabetically
    results.sort(key=lambda r: (not r.eligible, r.product_id))
    return results


@router.post("/applications/submit", response_model=LoanApplicationSubmitResponse)
async def submit_application(req: LoanApplicationSubmitRequest, db: Session = Depends(get_db)):
    """Submit a new customer loan application for processing"""
    from app.models.loan_models import LoanApplication, LoanProduct

    # Validate product exists
    product = db.query(LoanProduct).filter(LoanProduct.product_id == req.product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Loan product '{req.product_id}' not found")

    # Validate loan amount is within product range
    if product.min_loan_amount and req.loan_amount < product.min_loan_amount:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"Loan amount ${req.loan_amount:,.0f} is below minimum ${product.min_loan_amount:,.0f}"
        )
    if product.max_loan_amount and req.loan_amount > product.max_loan_amount:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"Loan amount ${req.loan_amount:,.0f} exceeds maximum ${product.max_loan_amount:,.0f}"
        )

    # Validate term is supported for product
    if product.term_months and req.term_months != product.term_months:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"Term {req.term_months} months not available for {req.product_id} (available: {product.term_months})"
        )

    # Check against requirements
    requirement = DatabaseService.get_loan_requirements(db, req.product_id)
    warnings = []

    if requirement:
        if requirement.min_credit_score and req.credit_score < requirement.min_credit_score:
            warnings.append(f"Credit score below recommended minimum of {requirement.min_credit_score}")
        if requirement.max_dti and req.dti_ratio > requirement.max_dti:
            warnings.append(f"Debt-to-income ratio exceeds recommended maximum of {requirement.max_dti:.0%}")
        if requirement.min_down_payment and (req.down_payment_pct or 0) < requirement.min_down_payment:
            warnings.append(f"Down payment below recommended minimum of {requirement.min_down_payment:.0%}")

    # Generate unique customer ID
    import uuid
    customer_id = f"CUST{uuid.uuid4().hex[:8].upper()}"

    # Create application (default status: pending)
    from datetime import datetime
    application = LoanApplication(
        customer_id=customer_id,
        customer_name=req.customer_name,
        product_id=req.product_id,
        loan_amount=req.loan_amount,
        term_months=req.term_months,
        credit_score=req.credit_score,
        annual_income=req.annual_income,
        dti_ratio=req.dti_ratio,
        down_payment_pct=req.down_payment_pct,
        status="pending",
        applied_at=datetime.utcnow(),
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # Build response message
    msg_parts = [f"Application {customer_id} submitted successfully"]
    if warnings:
        msg_parts.append("⚠ " + "; ".join(warnings))

    return LoanApplicationSubmitResponse(
        id=application.id,
        customer_id=customer_id,
        status="pending",
        product_id=req.product_id,
        loan_amount=req.loan_amount,
        message=" | ".join(msg_parts),
        applied_at=application.applied_at,
    )
