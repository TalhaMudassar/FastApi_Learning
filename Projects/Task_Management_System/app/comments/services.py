from app.db.config import async_session
from app.comments.models import Comments
from app.tasks.models import Tasks
from app.users.models import Users
from sqlalchemy import select
from fastapi import HTTPException
from app.comments.schemas import CommentCreate, CommentUpdate, CommentPatch

from sqlalchemy.ext.asyncio import AsyncSession


# ---------------------------
# CREATE
# ---------------------------
async def create_comment(session:AsyncSession,new_comment: CommentCreate):
  

        # Validate task exists
        task = await session.get(Tasks, new_comment.task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Validate user exists
        user = await session.get(Users, new_comment.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        comment = Comments(
            content=new_comment.content,
            task_id=new_comment.task_id,
            user_id=new_comment.user_id
        )

        session.add(comment)
        await session.commit()
        await session.refresh(comment)
        return comment


# ---------------------------
# GET ONE
# ---------------------------
async def get_comment(session:AsyncSession,comment_id: int):
   
        comment = await session.get(Comments, comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        return comment


# ---------------------------
# GET ALL
# ---------------------------
async def get_all_comments(session:AsyncSession):
  
        result = await session.scalars(select(Comments))
        return result.all()


# ---------------------------
# UPDATE (PUT)
# ---------------------------
async def update_comment(session:AsyncSession,comment_id: int, new_comment: CommentUpdate):

        comment = await session.get(Comments, comment_id)

        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        comment.content = new_comment.content
        comment.task_id = new_comment.task_id
        comment.user_id = new_comment.user_id

        await session.commit()
        await session.refresh(comment)
        return comment


# ---------------------------
# PATCH
# ---------------------------
async def patch_comment(session:AsyncSession,comment_id: int, new_comment: CommentPatch):

        comment = await session.get(Comments, comment_id)

        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        if new_comment.content is not None:
            comment.content = new_comment.content

        await session.commit()
        await session.refresh(comment)
        return comment


# ---------------------------
# DELETE
# ---------------------------
async def delete_comment(session:AsyncSession,comment_id: int):
  
        comment = await session.get(Comments, comment_id)

        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        await session.delete(comment)
        await session.commit()

        return {"message": "Comment deleted successfully"}