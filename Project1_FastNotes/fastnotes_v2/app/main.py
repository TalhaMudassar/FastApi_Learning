from fastapi import FastAPI
from typing import List
from app.notes import services as notes_services
from app.notes.schemas import NoteCreate, NoteUpdate, NotePatch, NoteOut

app = FastAPI()


@app.post("/notes/", response_model=NoteOut)
async def note_create(new_note: NoteCreate):
    return await notes_services.create_note(new_note)


@app.get("/notes/{note_id}", response_model=NoteOut)
async def get_note(note_id: int):
    return await notes_services.get_note(note_id)


@app.get("/notes", response_model=List[NoteOut])
async def get_all_notes():
    return await notes_services.get_all_note()


@app.put("/notes/{note_id}", response_model=NoteOut)
async def update_note(note_id: int, new_note: NoteUpdate):
    return await notes_services.update_note(note_id, new_note)


@app.patch("/notes/{note_id}", response_model=NoteOut)
async def note_patch(note_id: int, new_note: NotePatch):
    return await notes_services.patch_note(note_id, new_note)


@app.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    return await notes_services.delete_note(note_id)
