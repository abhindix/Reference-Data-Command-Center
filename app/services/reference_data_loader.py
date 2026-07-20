"""Reference data loader service"""

import httpx
import json
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random


class ReferenceDataLoader:
    """Load reference data from external APIs"""
    
    @staticmethod
    async def fetch_exchange_rates() -> Dict[str, Any]:
        """Fetch current exchange rates from API"""
        try:
            async with httpx.AsyncClient() as client:
                # Using exchangerate-api.com free tier
                response = await client.get(
                    "https://api.exchangerate-api.com/v4/latest/USD",
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json()
                return {"error": "Failed to fetch exchange rates"}
        except Exception as e:
            return {"error": str(e)}
    
    @staticmethod
    async def fetch_loan_products() -> List[Dict[str, Any]]:
        """Create comprehensive loan product reference data"""
        return [
            {
                "id": "MORTGAGE_30",
                "name": "30-Year Fixed Mortgage",
                "type": "mortgage",
                "term_months": 360,
                "min_rate": 0.03,
                "max_rate": 0.09,
                "min_loan_amount": 50000,
                "max_loan_amount": 1000000,
                "description": "Standard 30-year fixed-rate mortgage"
            },
            {
                "id": "MORTGAGE_15",
                "name": "15-Year Fixed Mortgage",
                "type": "mortgage",
                "term_months": 180,
                "min_rate": 0.025,
                "max_rate": 0.08,
                "min_loan_amount": 50000,
                "max_loan_amount": 1000000,
                "description": "Shorter 15-year fixed-rate mortgage"
            },
            {
                "id": "AUTO_NEW",
                "name": "New Auto Loan",
                "type": "auto",
                "term_months": 72,
                "min_rate": 0.019,
                "max_rate": 0.099,
                "min_loan_amount": 10000,
                "max_loan_amount": 100000,
                "description": "Financing for new vehicles"
            },
            {
                "id": "AUTO_USED",
                "name": "Used Auto Loan",
                "type": "auto",
                "term_months": 72,
                "min_rate": 0.029,
                "max_rate": 0.149,
                "min_loan_amount": 5000,
                "max_loan_amount": 50000,
                "description": "Financing for used vehicles"
            },
            {
                "id": "PERSONAL",
                "name": "Personal Loan",
                "type": "personal",
                "term_months": 84,
                "min_rate": 0.069,
                "max_rate": 0.399,
                "min_loan_amount": 1000,
                "max_loan_amount": 50000,
                "description": "Unsecured personal loans"
            },
            {
                "id": "HELOC",
                "name": "Home Equity Line of Credit",
                "type": "heloc",
                "term_months": 360,
                "min_rate": 0.035,
                "max_rate": 0.129,
                "min_loan_amount": 25000,
                "max_loan_amount": 500000,
                "description": "Variable rate credit line backed by home equity"
            }
        ]
    
    @staticmethod
    async def fetch_loan_rates() -> List[Dict[str, Any]]:
        """Generate current loan rates based on market conditions"""
        base_rates = {
            "MORTGAGE_30": {"base": 0.065, "spread": 0.015},
            "MORTGAGE_15": {"base": 0.059, "spread": 0.012},
            "AUTO_NEW": {"base": 0.055, "spread": 0.020},
            "AUTO_USED": {"base": 0.085, "spread": 0.030},
            "PERSONAL": {"base": 0.220, "spread": 0.100},
            "HELOC": {"base": 0.082, "spread": 0.025},
        }
        
        rates = []
        for product_id, rate_info in base_rates.items():
            base = rate_info["base"]
            spread = rate_info["spread"]
            
            rates.append({
                "product_id": product_id,
                "current_rate": round(base, 4),
                "min_rate": round(base - spread/2, 4),
                "max_rate": round(base + spread/2, 4),
                "rate_effective_date": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
                "market_condition": "Normal"
            })
        
        return rates
    
    @staticmethod
    async def fetch_loan_terms() -> List[Dict[str, Any]]:
        """Get available loan terms by product"""
        return [
            {"product_id": "MORTGAGE_30", "term_months": 360, "common": True},
            {"product_id": "MORTGAGE_15", "term_months": 180, "common": True},
            {"product_id": "MORTGAGE_15", "term_months": 240, "common": False},
            {"product_id": "AUTO_NEW", "term_months": 36, "common": False},
            {"product_id": "AUTO_NEW", "term_months": 48, "common": True},
            {"product_id": "AUTO_NEW", "term_months": 60, "common": True},
            {"product_id": "AUTO_NEW", "term_months": 72, "common": True},
            {"product_id": "AUTO_USED", "term_months": 48, "common": True},
            {"product_id": "AUTO_USED", "term_months": 60, "common": True},
            {"product_id": "AUTO_USED", "term_months": 72, "common": False},
            {"product_id": "PERSONAL", "term_months": 24, "common": False},
            {"product_id": "PERSONAL", "term_months": 36, "common": True},
            {"product_id": "PERSONAL", "term_months": 48, "common": True},
            {"product_id": "PERSONAL", "term_months": 60, "common": True},
            {"product_id": "PERSONAL", "term_months": 84, "common": False},
            {"product_id": "HELOC", "term_months": 120, "common": False},
            {"product_id": "HELOC", "term_months": 180, "common": True},
            {"product_id": "HELOC", "term_months": 240, "common": True},
        ]
    
    @staticmethod
    async def fetch_loan_fees() -> List[Dict[str, Any]]:
        """Get typical loan fees by product"""
        return [
            {
                "product_id": "MORTGAGE_30",
                "origination_fee": 0.01,
                "appraisal_fee": 500,
                "title_insurance": 0.005,
                "recording_fee": 150,
                "processing_fee": 400
            },
            {
                "product_id": "MORTGAGE_15",
                "origination_fee": 0.01,
                "appraisal_fee": 500,
                "title_insurance": 0.005,
                "recording_fee": 150,
                "processing_fee": 400
            },
            {
                "product_id": "AUTO_NEW",
                "origination_fee": 0.005,
                "doc_fee": 100,
                "registration_fee": 250,
                "processing_fee": 75
            },
            {
                "product_id": "AUTO_USED",
                "origination_fee": 0.008,
                "doc_fee": 150,
                "registration_fee": 250,
                "processing_fee": 100
            },
            {
                "product_id": "PERSONAL",
                "origination_fee": 0.01,
                "processing_fee": 50,
                "late_payment_fee": 25
            },
            {
                "product_id": "HELOC",
                "origination_fee": 0.01,
                "appraisal_fee": 400,
                "processing_fee": 200,
                "annual_fee": 100
            }
        ]
    
    @staticmethod
    async def fetch_loan_requirements() -> List[Dict[str, Any]]:
        """Get credit requirements by product"""
        return [
            {
                "product_id": "MORTGAGE_30",
                "min_credit_score": 620,
                "max_dti": 0.43,
                "min_down_payment": 0.03,
                "employment_history_months": 24,
                "income_verification_required": True
            },
            {
                "product_id": "MORTGAGE_15",
                "min_credit_score": 640,
                "max_dti": 0.40,
                "min_down_payment": 0.10,
                "employment_history_months": 24,
                "income_verification_required": True
            },
            {
                "product_id": "AUTO_NEW",
                "min_credit_score": 600,
                "max_dti": 0.50,
                "min_down_payment": 0.0,
                "employment_history_months": 12,
                "income_verification_required": True
            },
            {
                "product_id": "AUTO_USED",
                "min_credit_score": 580,
                "max_dti": 0.50,
                "min_down_payment": 0.10,
                "employment_history_months": 6,
                "income_verification_required": True
            },
            {
                "product_id": "PERSONAL",
                "min_credit_score": 580,
                "max_dti": 0.50,
                "min_down_payment": 0.0,
                "employment_history_months": 3,
                "income_verification_required": False
            },
            {
                "product_id": "HELOC",
                "min_credit_score": 650,
                "max_dti": 0.43,
                "home_equity_required": 0.20,
                "employment_history_months": 24,
                "income_verification_required": True
            }
        ]
    
    @staticmethod
    async def fetch_risk_categories() -> List[Dict[str, Any]]:
        """Create risk category reference data"""
        return [
            {
                "id": "RISK_EXCELLENT",
                "code": "EXCELLENT",
                "credit_score_min": 800,
                "credit_score_max": 850,
                "rate_adjustment": -0.02,
                "approval_probability": 0.99,
                "description": "Excellent credit score"
            },
            {
                "id": "RISK_GOOD",
                "code": "GOOD",
                "credit_score_min": 740,
                "credit_score_max": 799,
                "rate_adjustment": 0.0,
                "approval_probability": 0.95,
                "description": "Good credit score"
            },
            {
                "id": "RISK_FAIR",
                "code": "FAIR",
                "credit_score_min": 670,
                "credit_score_max": 739,
                "rate_adjustment": 0.025,
                "approval_probability": 0.85,
                "description": "Fair credit score"
            },
            {
                "id": "RISK_POOR",
                "code": "POOR",
                "credit_score_min": 300,
                "credit_score_max": 669,
                "rate_adjustment": 0.05,
                "approval_probability": 0.60,
                "description": "Poor credit score"
            }
        ]
    
    @staticmethod
    def format_for_storage(data_type: str, data: Any) -> List[Dict[str, Any]]:
        """Format data for storage in database"""
        formatted = []
        
        if data_type == "exchange_rates" and "rates" in data:
            for currency, rate in data["rates"].items():
                formatted.append({
                    "data_type": "exchange_rate",
                    "key": f"USD_to_{currency}",
                    "value": str(rate),
                    "description": f"Exchange rate from USD to {currency}"
                })
        
        elif data_type in ["loan_products", "loan_rates", "loan_terms", "loan_fees", 
                          "loan_requirements", "risk_categories"]:
            for item in data:
                formatted.append({
                    "data_type": data_type.rstrip('s'),
                    "key": item.get("id") or item.get("product_id") or item.get("code"),
                    "value": json.dumps(item),
                    "description": item.get("description", "")
                })
        
        return formatted
