from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Float, Integer, ForeignKey
from app.account.models import User
from app.db.base import Base
from app.product.models import Product

class CartItem(Base):
  __tablename__ = "cart_items"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
  quantity: Mapped[int] = mapped_column(default=1)
  price: Mapped[float] = mapped_column(Float, nullable=False)

  user: Mapped["User"] = relationship("User", back_populates="cart_items")
  product: Mapped["Product"] = relationship("Product", back_populates="cart_items")