from app.db.config import async_session
from app.notes.models import Note
from sqlalchemy import select
from fastapi import HTTPException
from app.notes.schemas import NoteCreate, NoteUpdate, NotePatch

from sqlalchemy.ext.asyncio import AsyncSession


async def create_note(session: AsyncSession,new_note: NoteCreate):
    
        note = Note(
            title=new_note.title,
            content=new_note.content
        )
        session.add(note)
        await session.commit()
        await session.refresh(note)
        return note


async def get_note(session: AsyncSession,note_id: int):
    
        note = await session.get(Note, note_id)
        if note is None:
            raise HTTPException(status_code=404, detail="Note Not Found")
        return note


async def get_all_note(session: AsyncSession):
    
        stmt = select(Note)
        notes = await session.scalars(stmt)
        return notes.all()


async def update_note(session: AsyncSession,note_id: int, new_note: NoteUpdate):
    
        note = await session.get(Note, note_id)

        if note is None:
            raise HTTPException(status_code=404, detail="Note Not Found")

        note.title = new_note.title
        note.content = new_note.content

        await session.commit()
        await session.refresh(note)

        return note


async def patch_note(session: AsyncSession,note_id: int, new_note: NotePatch):
    
        note = await session.get(Note, note_id)

        if note is None:
            raise HTTPException(status_code=404, detail="Note Not Found")

        if new_note.title is not None:
            note.title = new_note.title

        if new_note.content is not None:
            note.content = new_note.content

        await session.commit()
        await session.refresh(note)

        return note


async def delete_note(session: AsyncSession,note_id: int):
    
        note = await session.get(Note, note_id)

        if note is None:
            raise HTTPException(status_code=404, detail="Note Not Found")

        await session.delete(note)
        await session.commit()

        return {"message": "Deleted successfully"}