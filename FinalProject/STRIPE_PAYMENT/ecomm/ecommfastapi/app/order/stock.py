import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.product.models import Product
from app.order.models import OrderItem

logger = logging.getLogger(__name__)


async def restore_order_stock(session: AsyncSession, order_id: int) -> int:
    """
    Restores product catalog stock for all items associated with an order.
    Called when an order is cancelled or when a payment fails or expires.

    Returns:
        int: The total number of stock units restored across all items in the order.
    """
    stmt = select(OrderItem).where(OrderItem.order_id == order_id)
    items = (await session.scalars(stmt)).all()
    restored_units = 0

    for item in items:
        if item.product_id and item.quantity > 0:
            product = await session.get(Product, item.product_id)
            if product:
                product.stock_quantity += item.quantity
                restored_units += item.quantity
                logger.info(
                    f"Restored stock: +{item.quantity} to product_id={product.id} "
                    f"('{product.title}') for order_id={order_id}. New stock: {product.stock_quantity}"
                )

    return restored_units
