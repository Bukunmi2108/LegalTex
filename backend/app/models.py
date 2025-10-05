from sqlalchemy import Column, Integer, String, Text, DateTime, UUID, func
from .db import Base
import datetime
import uuid


class Project(Base):
  __tablename__ = 'projects'
  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  title = Column(String(200), default='Untitled')
  content = Column(Text)
  created_at = Column(DateTime, server_default=func.now())
  updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
  matter_number = Column(String(100), nullable=True)
  client = Column(String(200), nullable=True)
  jurisdiction = Column(String(100), nullable=True)