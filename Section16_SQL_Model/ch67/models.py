from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# ================================
# Junction Table (Many-to-Many)
# ================================
# This table connects User and Address
# It contains composite primary keys

class UserAddressLink(SQLModel, table=True):
    user_id: int = Field(
        foreign_key="user.id",
        primary_key=True
    )
    address_id: int = Field(
        foreign_key="address.id",
        primary_key=True
    )


# ================================
# User Model
# ================================
class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str
    email: str

    # One-to-One Relationship
    # One user has one profile
    profile: Optional["Profile"] = Relationship(
        back_populates="user"
    )

    # One-to-Many Relationship
    # One user can have multiple posts
    posts: List["Post"] = Relationship(
        back_populates="user"
    )

    # Many-to-Many Relationship
    # One user can have multiple addresses
    addresses: List["Address"] = Relationship(
        back_populates="users",
        link_model=UserAddressLink
    )


# ================================
# Profile Model (One-to-One)
# ================================
class Profile(SQLModel, table=True):
    id: int = Field(primary_key=True)
    
    # unique=True ensures One-to-One relationship
    user_id: int = Field(
        foreign_key="user.id",
        unique=True
    )

    bio: str

    # Back reference to User
    user: "User" = Relationship(
        back_populates="profile"
    )

    # Access example:
    # user.profile.bio


# ================================
# Post Model (One-to-Many)
# ================================
class Post(SQLModel, table=True):
    id: int = Field(primary_key=True)

    # Foreign key creates One-to-Many
    user_id: int = Field(
        foreign_key="user.id"
    )

    title: str
    content: str

    # Back reference to User
    user: "User" = Relationship(
        back_populates="posts"
    )

    # Access examples:
    # user.posts
    # post.user


# ================================
# Address Model (Many-to-Many)
# ================================
class Address(SQLModel, table=True):
    id: int = Field(primary_key=True)
    street: str
    city: str

    # Many-to-Many back reference
    users: List["User"] = Relationship(
        back_populates="addresses",
        link_model=UserAddressLink
    )

    # Access examples:
    # user.addresses
    # address.users