"""API endpoint tests"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.mark.unit
def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Loan Reference Data Platform"


@pytest.mark.unit
def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.unit
def test_readiness_check():
    """Test readiness check endpoint"""
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


@pytest.mark.unit
def test_list_reference_data():
    """Test listing reference data"""
    response = client.get("/api/v1/reference-data")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.unit
def test_reference_data_not_found():
    """Test 404 response for missing reference data"""
    response = client.get("/api/v1/reference-data/nonexistent")
    assert response.status_code == 404


@pytest.mark.unit
def test_get_reference_data_not_implemented():
    """Test that create returns not implemented"""
    response = client.post("/api/v1/reference-data", json={"key": "test"})
    assert response.status_code in [501, 404]  # Not implemented or method not found

