"""Reference data endpoints"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.reference_data import ReferenceDataResponse

router = APIRouter()


@router.get("/reference-data", response_model=List[ReferenceDataResponse])
async def list_reference_data():
    """List all reference data"""
    # TODO: Implement database query
    return []


@router.get("/reference-data/{data_id}", response_model=ReferenceDataResponse)
async def get_reference_data(data_id: str):
    """Get reference data by ID"""
    # TODO: Implement database query
    raise HTTPException(status_code=404, detail="Reference data not found")


@router.post("/reference-data", response_model=ReferenceDataResponse)
async def create_reference_data(data: dict):
    """Create new reference data"""
    # TODO: Implement database insertion
    raise HTTPException(status_code=501, detail="Not implemented")


@router.put("/reference-data/{data_id}", response_model=ReferenceDataResponse)
async def update_reference_data(data_id: str, data: dict):
    """Update reference data"""
    # TODO: Implement database update
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/reference-data/{data_id}")
async def delete_reference_data(data_id: str):
    """Delete reference data"""
    # TODO: Implement database deletion
    return {"deleted": True}
