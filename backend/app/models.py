from sqlalchemy import Column, Integer, String, Text, DateTime
from .db import Base
import datetime


class Project(Base):
  __tablename__ = 'projects'
  id = Column(Integer, primary_key=True, index=True)
  title = Column(String(200), default='Untitled')
  content = Column(Text)
  created_at = Column(DateTime, default=datetime.datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
  matter_number = Column(String(100), nullable=True)
  client = Column(String(200), nullable=True)
  jurisdiction = Column(String(100), nullable=True)