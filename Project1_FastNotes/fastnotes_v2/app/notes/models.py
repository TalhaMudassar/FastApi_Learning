from sqlalchemy.orm import Mapped,mapped_column
from app.db.base import Base
from sqlalchemy import String,Text

class Note(Base):
    __tablename__ = "notes"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[int] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text)
    
    
    def __repr__(self) -> str:
        return f"<Note(title={self.title}, content={self.content})>"