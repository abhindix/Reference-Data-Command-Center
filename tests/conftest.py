"""Pytest configuration and fixtures"""

import pytest
import os
from pathlib import Path


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Set up test environment"""
    os.environ["TEST_MODE"] = "True"
    os.environ["DEBUG"] = "True"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    print("\n\n" + "="*70)
    print("🧪 TEST MODE ENABLED")
    print("="*70)
    yield
    print("\n" + "="*70)
    print("✅ TESTS COMPLETED")
    print("="*70 + "\n")


@pytest.fixture(scope="session")
def test_data_dir():
    """Get the test data directory"""
    test_dir = Path(__file__).parent / "test_data"
    test_dir.mkdir(exist_ok=True)
    return test_dir


@pytest.fixture
def sample_exchange_rates():
    """Sample exchange rate data"""
    return {
        "base": "USD",
        "date": "2026-07-20",
        "rates": {
            "EUR": 0.92,
            "GBP": 0.79,
            "JPY": 149.50,
            "CAD": 1.37,
            "AUD": 1.50,
            "CHF": 0.89,
            "INR": 83.12,
            "MXN": 20.15
        }
    }


@pytest.fixture
def sample_loan_product():
    """Sample loan product data"""
    return {
        "id": "MORTGAGE_30",
        "name": "30-Year Fixed Mortgage",
        "type": "mortgage",
        "term_months": 360,
        "min_rate": 0.03,
        "max_rate": 0.09,
        "description": "Standard 30-year fixed-rate mortgage"
    }


@pytest.fixture
def sample_risk_category():
    """Sample risk category data"""
    return {
        "id": "RISK_EXCELLENT",
        "code": "EXCELLENT",
        "credit_score_min": 800,
        "credit_score_max": 850,
        "rate_adjustment": -0.02,
        "description": "Excellent credit score"
    }


@pytest.fixture
def sample_reference_data():
    """Sample reference data entry"""
    return {
        "data_type": "loan_product",
        "key": "MORTGAGE_30",
        "value": '{"id": "MORTGAGE_30", "name": "30-Year Fixed Mortgage"}',
        "description": "Standard mortgage product"
    }
