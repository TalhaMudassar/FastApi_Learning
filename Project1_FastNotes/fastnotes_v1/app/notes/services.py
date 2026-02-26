from app.db.config import async_session
from app.notes.models import Note
from sqlalchemy import select
from fastapi import HTTPException

async def create_note(title:str, content:str):
    async with async_session() as session:
        note = Note(title=title, content=content)
        session.add(note)
        await session.commit()
        await session.refresh(note)
        return note
    
     
async def get_note(note_id:int):
    async with async_session() as session:
        note = await session.get(Note,note_id)
        if note is None:
            raise HTTPException(status_code=404,detail="Note Not Found")
        return note
    
    
async def get_all_note():
    async with async_session() as session:
        stmt = select(Note)
        notes = await session.scalars(stmt)
        return notes.all()
    
    
async def update_note(note_id:int, new_title:str, new_content:str):
    async with async_session() as session:
        note = await session.get(Note,note_id)
        if note is None:
            raise HTTPException(status_code=404, detail="Note not Found")

        note.title = new_title
        note.content = new_content

        await session.commit()
        await session.refresh(note)

        return note
    
async def patch_note(note_id:int, newtitle:str | None = None, newcontent:str | None = None):
    async with async_session() as session:
        note = await session.get(Note, note_id)

        if note is None:
            raise HTTPException(status_code=404, detail="Note not Found")

        if newtitle is not None:
            note.title = newtitle
        if newcontent is not None:
            note.content = newcontent

        await session.commit()
        await session.refresh(note)

        return note
    
    
async def delete_note(note_id:int):
    async with async_session() as session:
        note = await session.get(Note,note_id)
        if note is None:
            raise HTTPException(status_code=404, detail="Note Not Found")
        await session.delete(note)
        await session.commit()
        return {"message":"deleted"}