"""Reference data schemas"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class ReferenceDataBase(BaseModel):
    """Base reference data schema"""
    data_type: str
    key: str
    value: str
    description: Optional[str] = None


class ReferenceDataCreate(ReferenceDataBase):
    """Schema for creating reference data"""
    pass


class ReferenceDataUpdate(BaseModel):
    """Schema for updating reference data"""
    value: Optional[str] = None
    description: Optional[str] = None


class ReferenceDataResponse(ReferenceDataBase):
    """Response schema for reference data"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
