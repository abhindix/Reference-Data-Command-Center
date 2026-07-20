"""Database service for reference data operations"""

import json
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.loan_models import LoanProduct, LoanRate, LoanTerm, LoanFee, LoanRequirement
from app.services.reference_data_loader import ReferenceDataLoader


class DatabaseService:
    """Service to load and manage reference data in database"""
    
    @staticmethod
    def load_loan_products(db: Session, data_file: str = "data/loan_products.json"):
        """Load loan products from JSON file into database"""
        if not Path(data_file).exists():
            raise FileNotFoundError(f"Data file not found: {data_file}")
        
        with open(data_file) as f:
            products = json.load(f)
        
        # Clear existing products
        db.query(LoanProduct).delete()
        
        count = 0
        for product in products:
            # Parse datetime if present
            created_at = datetime.fromisoformat(product.get("created_at")) if "created_at" in product else datetime.utcnow()
            
            loan_product = LoanProduct(
                product_id=product["id"],
                name=product["name"],
                product_type=product["type"],
                term_months=product.get("term_months"),
                min_rate=product.get("min_rate"),
                max_rate=product.get("max_rate"),
                min_loan_amount=product.get("min_loan_amount"),
                max_loan_amount=product.get("max_loan_amount"),
                description=product.get("description"),
                created_at=created_at
            )
            db.add(loan_product)
            count += 1
        
        db.commit()
        return count
    
    @staticmethod
    def load_loan_rates(db: Session, data_file: str = "data/loan_rates.json"):
        """Load loan rates from JSON file into database"""
        if not Path(data_file).exists():
            raise FileNotFoundError(f"Data file not found: {data_file}")
        
        with open(data_file) as f:
            rates = json.load(f)
        
        # Clear existing rates
        db.query(LoanRate).delete()
        
        count = 0
        for rate in rates:
            rate_effective_date = datetime.fromisoformat(rate["rate_effective_date"])
            
            loan_rate = LoanRate(
                product_id=rate["product_id"],
                current_rate=rate["current_rate"],
                min_rate=rate["min_rate"],
                max_rate=rate["max_rate"],
                market_condition=rate.get("market_condition", "Normal"),
                rate_effective_date=rate_effective_date
            )
            db.add(loan_rate)
            count += 1
        
        db.commit()
        return count
    
    @staticmethod
    def load_loan_terms(db: Session, data_file: str = "data/loan_terms.json"):
        """Load available loan terms from JSON file into database"""
        if not Path(data_file).exists():
            raise FileNotFoundError(f"Data file not found: {data_file}")
        
        with open(data_file) as f:
            terms = json.load(f)
        
        # Clear existing terms
        db.query(LoanTerm).delete()
        
        count = 0
        for term in terms:
            loan_term = LoanTerm(
                product_id=term["product_id"],
                term_months=term["term_months"],
                is_common=term.get("common", False)
            )
            db.add(loan_term)
            count += 1
        
        db.commit()
        return count
    
    @staticmethod
    def load_loan_fees(db: Session, data_file: str = "data/loan_fees.json"):
        """Load loan fees from JSON file into database"""
        if not Path(data_file).exists():
            raise FileNotFoundError(f"Data file not found: {data_file}")
        
        with open(data_file) as f:
            fees_data = json.load(f)
        
        # Clear existing fees
        db.query(LoanFee).delete()
        
        count = 0
        for product_fees in fees_data:
            product_id = product_fees["product_id"]
            
            # Process each fee type
            for fee_key, fee_value in product_fees.items():
                if fee_key == "product_id":
                    continue
                
                # Determine if fee is percentage or fixed
                is_percentage = isinstance(fee_value, float) and fee_value < 1 and fee_value > 0
                
                loan_fee = LoanFee(
                    product_id=product_id,
                    fee_type=fee_key,
                    fee_amount=fee_value if not is_percentage else None,
                    fee_percentage=fee_value if is_percentage else None,
                    description=f"{fee_key} for {product_id}"
                )
                db.add(loan_fee)
                count += 1
        
        db.commit()
        return count
    
    @staticmethod
    def load_loan_requirements(db: Session, data_file: str = "data/loan_requirements.json"):
        """Load loan requirements from JSON file into database"""
        if not Path(data_file).exists():
            raise FileNotFoundError(f"Data file not found: {data_file}")
        
        with open(data_file) as f:
            requirements = json.load(f)
        
        # Clear existing requirements
        db.query(LoanRequirement).delete()
        
        count = 0
        for req in requirements:
            loan_req = LoanRequirement(
                product_id=req["product_id"],
                min_credit_score=req.get("min_credit_score"),
                max_dti=req.get("max_dti"),
                min_down_payment=req.get("min_down_payment"),
                home_equity_required=req.get("home_equity_required"),
                employment_history_months=req.get("employment_history_months"),
                income_verification_required=req.get("income_verification_required", False)
            )
            db.add(loan_req)
            count += 1
        
        db.commit()
        return count
    
    @staticmethod
    def load_all_data(db: Session, data_dir: str = "data"):
        """Load all reference data into database"""
        results = {}
        
        try:
            results["loan_products"] = DatabaseService.load_loan_products(
                db, 
                f"{data_dir}/loan_products.json"
            )
        except Exception as e:
            results["loan_products_error"] = str(e)
        
        try:
            results["loan_rates"] = DatabaseService.load_loan_rates(
                db, 
                f"{data_dir}/loan_rates.json"
            )
        except Exception as e:
            results["loan_rates_error"] = str(e)
        
        try:
            results["loan_terms"] = DatabaseService.load_loan_terms(
                db, 
                f"{data_dir}/loan_terms.json"
            )
        except Exception as e:
            results["loan_terms_error"] = str(e)
        
        try:
            results["loan_fees"] = DatabaseService.load_loan_fees(
                db, 
                f"{data_dir}/loan_fees.json"
            )
        except Exception as e:
            results["loan_fees_error"] = str(e)
        
        try:
            results["loan_requirements"] = DatabaseService.load_loan_requirements(
                db, 
                f"{data_dir}/loan_requirements.json"
            )
        except Exception as e:
            results["loan_requirements_error"] = str(e)
        
        return results
    
    @staticmethod
    def get_loan_product(db: Session, product_id: str):
        """Get a loan product by ID"""
        return db.query(LoanProduct).filter(
            LoanProduct.product_id == product_id
        ).first()
    
    @staticmethod
    def get_all_loan_products(db: Session, skip: int = 0, limit: int = 100):
        """Get all loan products with pagination"""
        return db.query(LoanProduct).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_loan_rate(db: Session, product_id: str):
        """Get current rate for a product"""
        return db.query(LoanRate).filter(
            LoanRate.product_id == product_id
        ).order_by(LoanRate.last_updated.desc()).first()
    
    @staticmethod
    def get_loan_terms_for_product(db: Session, product_id: str):
        """Get available terms for a product"""
        return db.query(LoanTerm).filter(
            LoanTerm.product_id == product_id
        ).all()
    
    @staticmethod
    def get_loan_fees_for_product(db: Session, product_id: str):
        """Get fees for a product"""
        return db.query(LoanFee).filter(
            LoanFee.product_id == product_id
        ).all()
    
    @staticmethod
    def get_loan_requirements(db: Session, product_id: str):
        """Get requirements for a product"""
        return db.query(LoanRequirement).filter(
            LoanRequirement.product_id == product_id
        ).first()

    @staticmethod
    def seed_mock_applications(db: Session):
        """Seed mock customer loan applications if table is empty"""
        from app.models.loan_models import LoanApplication
        if db.query(LoanApplication).count() > 0:
            return 0

        import random
        from datetime import timedelta

        rng = random.Random(42)  # deterministic seed

        NAMES = [
            ("Alice", "Johnson"), ("Bob", "Smith"), ("Carol", "Davis"), ("David", "Wilson"),
            ("Emma", "Martinez"), ("Frank", "Garcia"), ("Grace", "Anderson"), ("Henry", "Taylor"),
            ("Isabel", "Thomas"), ("James", "Jackson"), ("Karen", "White"), ("Liam", "Harris"),
            ("Maria", "Martin"), ("Nathan", "Thompson"), ("Olivia", "Brown"), ("Paul", "Clark"),
            ("Quinn", "Lewis"), ("Rachel", "Lee"), ("Sam", "Walker"), ("Tara", "Hall"),
            ("Uma", "Allen"), ("Victor", "Young"), ("Wendy", "Hernandez"), ("Xavier", "King"),
            ("Yara", "Wright"), ("Zoe", "Lopez"), ("Aaron", "Hill"), ("Beth", "Scott"),
            ("Craig", "Green"), ("Diana", "Adams"), ("Ethan", "Baker"), ("Fiona", "Nelson"),
            ("George", "Carter"), ("Hannah", "Mitchell"), ("Ivan", "Perez"), ("Julia", "Roberts"),
            ("Kevin", "Turner"), ("Laura", "Phillips"), ("Mike", "Campbell"), ("Nina", "Parker"),
            ("Oscar", "Evans"), ("Petra", "Edwards"), ("Ryan", "Collins"), ("Sofia", "Stewart"),
            ("Tom", "Sanchez"), ("Ursula", "Morris"), ("Wade", "Rogers"), ("Xena", "Reed"),
            ("Yusuf", "Cook"), ("Zara", "Morgan"),
        ]

        PRODUCTS_CONFIG = [
            ("MORTGAGE_30", 200_000, 750_000, 360, 660, 0.43, 0.10),
            ("MORTGAGE_15", 150_000, 700_000, 180, 660, 0.43, 0.10),
            ("AUTO_NEW",     18_000,  85_000,  72, 620, 0.50, 0.00),
            ("AUTO_USED",     6_000,  45_000,  60, 580, 0.55, 0.00),
            ("PERSONAL",      3_000,  45_000,  60, 640, 0.45, 0.00),
            ("HELOC",        30_000, 450_000, 120, 700, 0.43, 0.20),
        ]
        # weights so mortgages and auto are most common
        weights = [18, 12, 12, 10, 10, 8]
        total = 70
        base_date = datetime(2025, 7, 1)

        count = 0
        for i in range(total):
            first, last = NAMES[i % len(NAMES)]
            cfg = rng.choices(PRODUCTS_CONFIG, weights=weights, k=1)[0]
            pid, amt_min, amt_max, term, min_cs, max_dti, min_dp = cfg

            credit_score = rng.randint(580, 800)
            annual_income = rng.choice([45_000, 60_000, 75_000, 90_000, 110_000, 140_000, 180_000])
            dti = round(rng.uniform(0.15, 0.58), 2)
            down_pct = round(rng.uniform(0.05, 0.30), 2)
            loan_amount = round(rng.uniform(amt_min, amt_max) / 1000) * 1000
            days_ago = rng.randint(0, 365)
            applied = base_date + timedelta(days=days_ago)

            # Determine status realistically
            eligible = (
                credit_score >= min_cs
                and dti <= max_dti
                and down_pct >= min_dp
            )
            if eligible:
                status = rng.choices(["approved", "pending"], weights=[85, 15], k=1)[0]
            else:
                status = rng.choices(["rejected", "pending"], weights=[80, 20], k=1)[0]

            db.add(LoanApplication(
                customer_id=f"CUST{i+1:03d}",
                customer_name=f"{first} {last}",
                product_id=pid,
                loan_amount=loan_amount,
                term_months=term,
                credit_score=credit_score,
                annual_income=annual_income,
                dti_ratio=dti,
                down_payment_pct=down_pct,
                status=status,
                applied_at=applied,
            ))
            count += 1

        db.commit()
        return count
