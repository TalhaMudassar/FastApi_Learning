import logging
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.payment.models import ProcessedStripeEvent

logger = logging.getLogger(__name__)


async def is_event_processed(session: AsyncSession, event_id: str) -> bool:
    """
    Checks if a Stripe webhook event ID has already been recorded and processed.
    """
    stmt = select(ProcessedStripeEvent).where(ProcessedStripeEvent.event_id == event_id)
    existing = (await session.scalars(stmt)).first()
    return existing is not None


async def commit_processed_event(
    session: AsyncSession,
    event_id: str,
    event_type: str
) -> bool:
    """
    Persists the processed event ID and commits the current transaction atomically.
    Handles concurrent duplicate delivery gracefully by catching IntegrityError.
    
    Returns:
        True if the event and transaction were committed cleanly.
        False if a concurrent worker already inserted this event_id (transaction rolled back).
    """
    try:
        session.add(ProcessedStripeEvent(event_id=event_id, event_type=event_type))
        await session.commit()
        return True
    except IntegrityError:
        await session.rollback()
        logger.warning(
            f"Concurrent duplicate Stripe webhook detected and handled: "
            f"event_id={event_id}, type={event_type}"
        )
        return False
