from pydantic import BaseModel, Field, ConfigDict


# Shared Base Fields
class NoteBase(BaseModel):
    title: str = Field(
        max_length=50,
        examples=["Write the title here"]  # Must be a list in Pydantic v2
    )
    content: str


# For creation (POST)
class NoteCreate(NoteBase):
    pass


# For full update (PUT)
class NoteUpdate(NoteBase):
    pass


# For partial update (PATCH)
class NotePatch(BaseModel):
    title: str | None = None
    content: str | None = None


# For response serialization
class NoteOut(NoteBase):
    id: int

    # Required for SQLAlchemy ORM → Pydantic conversion
    model_config = ConfigDict(from_attributes=True)