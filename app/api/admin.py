"""Admin and management endpoints"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.database_service import DatabaseService

router = APIRouter()


@router.post("/admin/load-loan-data")
async def load_loan_data(
    data_dir: str = "data",
    db: Session = Depends(get_db)
):
    """Load loan reference data from files into database"""
    try:
        results = DatabaseService.load_all_data(db, data_dir)
        
        # Count successes and failures
        successes = {k: v for k, v in results.items() if not k.endswith("_error")}
        errors = {k: v for k, v in results.items() if k.endswith("_error")}
        
        total_loaded = sum(v for v in successes.values() if isinstance(v, int))
        
        return {
            "status": "success",
            "message": f"Loaded {total_loaded} total records",
            "loaded": successes,
            "errors": errors if errors else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load data: {str(e)}"
        )


@router.post("/admin/load-loan-products")
async def load_loan_products(
    data_file: str = "data/loan_products.json",
    db: Session = Depends(get_db)
):
    """Load loan products into database"""
    try:
        count = DatabaseService.load_loan_products(db, data_file)
        return {
            "status": "success",
            "message": f"Loaded {count} loan products",
            "count": count
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/load-loan-rates")
async def load_loan_rates(
    data_file: str = "data/loan_rates.json",
    db: Session = Depends(get_db)
):
    """Load loan rates into database"""
    try:
        count = DatabaseService.load_loan_rates(db, data_file)
        return {
            "status": "success",
            "message": f"Loaded {count} loan rates",
            "count": count
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/load-loan-terms")
async def load_loan_terms(
    data_file: str = "data/loan_terms.json",
    db: Session = Depends(get_db)
):
    """Load loan terms into database"""
    try:
        count = DatabaseService.load_loan_terms(db, data_file)
        return {
            "status": "success",
            "message": f"Loaded {count} loan terms",
            "count": count
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/load-loan-fees")
async def load_loan_fees(
    data_file: str = "data/loan_fees.json",
    db: Session = Depends(get_db)
):
    """Load loan fees into database"""
    try:
        count = DatabaseService.load_loan_fees(db, data_file)
        return {
            "status": "success",
            "message": f"Loaded {count} loan fee entries",
            "count": count
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/load-loan-requirements")
async def load_loan_requirements(
    data_file: str = "data/loan_requirements.json",
    db: Session = Depends(get_db)
):
    """Load loan requirements into database"""
    try:
        count = DatabaseService.load_loan_requirements(db, data_file)
        return {
            "status": "success",
            "message": f"Loaded {count} loan requirement entries",
            "count": count
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/stats")
async def get_database_stats(db: Session = Depends(get_db)):
    """Get database statistics"""
    from app.models.loan_models import LoanProduct, LoanRate, LoanTerm, LoanFee, LoanRequirement
    
    stats = {
        "loan_products": db.query(LoanProduct).count(),
        "loan_rates": db.query(LoanRate).count(),
        "loan_terms": db.query(LoanTerm).count(),
        "loan_fees": db.query(LoanFee).count(),
        "loan_requirements": db.query(LoanRequirement).count(),
    }
    
    stats["total"] = sum(stats.values())
    
    return {
        "status": "success",
        "statistics": stats
    }
