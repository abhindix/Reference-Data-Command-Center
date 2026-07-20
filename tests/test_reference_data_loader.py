"""Tests for reference data loader"""

import pytest
from app.services.reference_data_loader import ReferenceDataLoader


@pytest.mark.asyncio
async def test_fetch_exchange_rates():
    """Test fetching exchange rates from API"""
    data = await ReferenceDataLoader.fetch_exchange_rates()
    
    # Should have either rates or an error
    assert "rates" in data or "error" in data
    
    if "rates" in data:
        # Verify structure
        assert "base" in data
        assert data["base"] == "USD"
        assert len(data["rates"]) > 0
        # Should contain common currencies
        assert any(cur in data["rates"] for cur in ["EUR", "GBP", "JPY"])


@pytest.mark.asyncio
async def test_fetch_loan_products():
    """Test fetching loan products"""
    products = await ReferenceDataLoader.fetch_loan_products()
    
    assert len(products) > 0
    assert len(products) == 6
    
    # Verify product structure
    product = products[0]
    assert "id" in product
    assert "name" in product
    assert "type" in product
    assert "term_months" in product
    assert "min_rate" in product
    assert "max_rate" in product
    
    # Verify data integrity
    assert all(p["min_rate"] <= p["max_rate"] for p in products)


@pytest.mark.asyncio
async def test_fetch_risk_categories():
    """Test fetching risk categories"""
    categories = await ReferenceDataLoader.fetch_risk_categories()
    
    assert len(categories) == 4
    
    # Verify structure
    category = categories[0]
    assert "id" in category
    assert "code" in category
    assert "credit_score_min" in category
    assert "credit_score_max" in category
    assert "rate_adjustment" in category
    
    # Verify credit scores are in valid range
    for cat in categories:
        assert 300 <= cat["credit_score_min"] <= 850
        assert 300 <= cat["credit_score_max"] <= 850
        assert cat["credit_score_min"] <= cat["credit_score_max"]


def test_format_exchange_rates_for_storage():
    """Test formatting exchange rates for database storage"""
    test_data = {
        "base": "USD",
        "rates": {
            "EUR": 0.92,
            "GBP": 0.79,
            "JPY": 149.50
        }
    }
    
    formatted = ReferenceDataLoader.format_for_storage("exchange_rates", test_data)
    
    assert len(formatted) == 3
    assert all(item["data_type"] == "exchange_rate" for item in formatted)
    assert formatted[0]["key"].startswith("USD_to_")


def test_format_loan_products_for_storage():
    """Test formatting loan products for database storage"""
    test_data = [
        {
            "id": "MORTGAGE_30",
            "name": "30-Year Fixed Mortgage",
            "type": "mortgage"
        }
    ]
    
    formatted = ReferenceDataLoader.format_for_storage("loan_products", test_data)
    
    assert len(formatted) == 1
    assert formatted[0]["data_type"] == "loan_product"
    assert formatted[0]["key"] == "MORTGAGE_30"


@pytest.mark.asyncio
async def test_reference_data_end_to_end():
    """Test loading and formatting reference data"""
    # Load all reference data
    exchange_rates = await ReferenceDataLoader.fetch_exchange_rates()
    loan_products = await ReferenceDataLoader.fetch_loan_products()
    risk_categories = await ReferenceDataLoader.fetch_risk_categories()
    
    # Format for storage
    if "rates" in exchange_rates:
        formatted_rates = ReferenceDataLoader.format_for_storage(
            "exchange_rates", 
            exchange_rates
        )
        assert len(formatted_rates) > 0
    
    formatted_products = ReferenceDataLoader.format_for_storage(
        "loan_products",
        loan_products
    )
    assert len(formatted_products) > 0
    
    formatted_categories = ReferenceDataLoader.format_for_storage(
        "risk_categories",
        risk_categories
    )
    assert len(formatted_categories) > 0
