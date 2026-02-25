from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, Table, Column
from db import engine


# ==================================================
# Base Class
# ==================================================
class Base(DeclarativeBase):
    pass


# ==================================================
# Association Table (Many-to-Many)
# IMPORTANT: Must be defined BEFORE models use it
# ==================================================
user_address_association = Table(
    "user_address_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("address_id", Integer, ForeignKey("address.id", ondelete="CASCADE"), primary_key=True)
)


# ==================================================
# User Model
# ==================================================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phoneno: Mapped[str | None] = mapped_column(String(11), nullable=True)

    # 🔹 One-to-Many: User → Posts
    posts: Mapped[list["Post"]] = relationship(
        back_populates="user",
        cascade="all, delete"
    )

    # 🔹 One-to-One: User → Profile
    profile: Mapped["Profile"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

    # 🔹 Many-to-Many: User ↔ Address
    addresses: Mapped[list["Address"]] = relationship(
        secondary=user_address_association,
        back_populates="users",
        cascade="all, delete"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, name={self.name})>"


# ==================================================
# Post Model (One-to-Many)
# ==================================================
class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)

    # 🔹 Many-to-One: Post → User
    user: Mapped["User"] = relationship(
        back_populates="posts"
    )

    def __repr__(self) -> str:
        return f"<Post(id={self.id}, title={self.title})>"


# ==================================================
# Profile Model (One-to-One)
# ==================================================
class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True   # Important for One-to-One
    )

    bio: Mapped[str] = mapped_column(String(50), nullable=False)

    # 🔹 One-to-One: Profile → User
    user: Mapped["User"] = relationship(
        back_populates="profile"
    )

    def __repr__(self) -> str:
        return f"<Profile(id={self.id}, user_id={self.user_id})>"


# ==================================================
# Address Model (Many-to-Many)
# ==================================================
class Address(Base):
    __tablename__ = "address"

    id: Mapped[int] = mapped_column(primary_key=True)
    street: Mapped[str] = mapped_column(String, nullable=False)
    country: Mapped[str] = mapped_column(String(50), nullable=False)

    # 🔹 Many-to-Many: Address ↔ Users
    users: Mapped[list["User"]] = relationship(
        secondary=user_address_association,
        back_populates="addresses"
    )

    def __repr__(self) -> str:
        return f"<Address(id={self.id}, country={self.country})>"


# ==================================================
# Create Tables
# ==================================================
def create_tables():
    Base.metadata.create_all(engine)
    print("✅ Tables created successfully!")
