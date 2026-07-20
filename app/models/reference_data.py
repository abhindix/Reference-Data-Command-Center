"""Reference data model"""

from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.models import Base


class ReferenceData(Base):
    """Reference data table model"""
    __tablename__ = "reference_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data_type = Column(String(100), nullable=False, index=True)
    key = Column(String(255), nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ReferenceData(id={self.id}, data_type={self.data_type}, key={self.key})>"
