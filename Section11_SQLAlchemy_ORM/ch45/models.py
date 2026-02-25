from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from db import engine


class Base(DeclarativeBase):
    pass


# =========================
# User Model (One → Many)
# =========================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)

    # One-to-Many: User → Posts
    posts: Mapped[list["Post"]] = relationship(
        "Post",
        back_populates="user",
        cascade="all, delete"
    )

    def __repr__(self):
        return f"<User(name={self.name}, email={self.email})>"


# =========================
# Post Model
# =========================
class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)

    # Many-to-One: Post → User
    user: Mapped["User"] = relationship(
        "User",
        back_populates="posts"
    )

    def __repr__(self):
        return f"<Post(title={self.title}, content={self.content})>"


# =========================
# Table Functions
# =========================
def create_tables():
    Base.metadata.create_all(engine)


def drop_tables():
    Base.metadata.drop_all(engine)
