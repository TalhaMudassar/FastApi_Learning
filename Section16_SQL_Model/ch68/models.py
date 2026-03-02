from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# =====================================================
# Junction Table (Many-to-Many)
# =====================================================
# If a User or Address is deleted,
# related records in this table will also be deleted.

class UserAddressLink(SQLModel, table=True):
    user_id: int = Field(
        foreign_key="user.id",
        primary_key=True,
        ondelete="CASCADE"
    )
    address_id: int = Field(
        foreign_key="address.id",
        primary_key=True,
        ondelete="CASCADE"
    )


# =====================================================
# User Model
# =====================================================
class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str
    email: str

    # -------------------------
    # One-to-One Relationship
    # If User is deleted → Profile is also deleted
    # -------------------------
    profile: Optional["Profile"] = Relationship(
        back_populates="user",
        cascade_delete=True
    )

    # -------------------------
    # One-to-Many Relationship
    # If User is deleted → handled based on DB rule (SET NULL below)
    # -------------------------
    posts: List["Post"] = Relationship(
        back_populates="user",
        cascade_delete=True
    )

    # -------------------------
    # Many-to-Many Relationship
    # If User is deleted → link table rows removed automatically
    # -------------------------
    addresses: List["Address"] = Relationship(
        back_populates="users",
        link_model=UserAddressLink,
        cascade_delete=True
    )


# =====================================================
# Profile Model (One-to-One)
# =====================================================
class Profile(SQLModel, table=True):
    id: int = Field(primary_key=True)

    # If User is deleted → Profile is deleted (CASCADE)
    # Other options:
    # SET NULL  → user deleted, user_id becomes NULL
    # RESTRICT  → prevents user deletion if profile exists
    user_id: int = Field(
        foreign_key="user.id",
        unique=True,
        ondelete="CASCADE"
    )

    bio: str

    user: "User" = Relationship(
        back_populates="profile"
    )


# =====================================================
# Post Model (One-to-Many)
# =====================================================
class Post(SQLModel, table=True):
    id: int = Field(primary_key=True)

    # If User is deleted → user_id becomes NULL (post remains)
    user_id: Optional[int] = Field(
        foreign_key="user.id",
        ondelete="SET NULL",
        nullable=True
    )

    title: str
    content: str

    user: Optional["User"] = Relationship(
        back_populates="posts"
    )


# =====================================================
# Address Model (Many-to-Many)
# =====================================================
class Address(SQLModel, table=True):
    id: int = Field(primary_key=True)
    street: str
    city: str

    users: List["User"] = Relationship(
        back_populates="addresses",
        link_model=UserAddressLink,
        cascade_delete=True
    )