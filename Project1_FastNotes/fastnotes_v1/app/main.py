from fastapi import FastAPI
from app.notes import services as notes_services

app = FastAPI()


@app.post("/notes/")
async def note_create(new_note: dict):
    note = await notes_services.create_note(new_note["title"],new_note["content"])
    return note


@app.get("/notes/{note_id}")
async def get_notes(note_id:int):
    note = await notes_services.get_note(note_id)
    return note


@app.get("/notes")
async def get_all_notes():
    notes = await notes_services.get_all_note()
    return notes


@app.put("/notes/{note_id}")
async def update_note(note_id:int, new_note:dict):
    new_title = new_note.get("title")
    new_content = new_note.get("content")
    note = await notes_services.update_note(note_id,new_title,new_content)
    return note


@app.patch("/notes/{note_id}")
async def note_patch(note_id:int ,new_note:dict):
    new_title = new_note.get("title")
    new_content = new_note.get("content")
    note = await notes_services.patch_note(note_id,new_title,new_content)
    return note


@app.delete("/notes/{note_id}")
async def delete_note(note_id:int):
    response = await notes_services.delete_note(note_id)
    return response