from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer
from db import engine


# ==================================================
# Base Class (Required for ORM Models)
# ==================================================
# All ORM models must inherit from this Base class.
# It stores metadata for all models.
class Base(DeclarativeBase):
    pass


# ==================================================
# Users Model / Users Table
# ==================================================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phoneno: Mapped[str | None] = mapped_column(String(11), nullable=True)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, name={self.name}, email={self.email})>"


# ==================================================
# Address Model / Address Table
# ==================================================
class Address(Base):
    __tablename__ = "address"

    id: Mapped[int] = mapped_column(primary_key=True)
    street: Mapped[str] = mapped_column(String(50), nullable=False)

    district: Mapped[str] = mapped_column(String, nullable=False)

    country: Mapped[str] = mapped_column(String, nullable=False)

    def __repr__(self) -> str:
        return f"<Address(id={self.id}, street={self.street})>"


# ==================================================
# Create Tables
# ==================================================
def create_tables():
    Base.metadata.create_all(engine)
    print("✅ Tables created successfully!")


# ==================================================
# Drop Tables
# ==================================================
def drop_tables():
    Base.metadata.drop_all(engine)
    print("❌ Tables dropped successfully!")
