from db import engine
from tables import users, posts
from sqlalchemy import insert, select, delete, update

# ==================================================
# CREATE (Insert)
# ==================================================

def create_user(name: str, email: str, phoneno: str | None = None):
    with engine.connect() as conn:
        stmt = insert(users).values(name=name, email=email, phoneno=phoneno)
        conn.execute(stmt)
        conn.commit()

def create_post(user_id: int, title: str, content: str):
    with engine.connect() as conn:
        stmt = insert(posts).values(user_id=user_id, title=title, content=content)
        conn.execute(stmt)
        conn.commit()

# ==================================================
# READ (Select)
# ==================================================

# Get single user by ID
def get_user_by_id(user_id: int):
    with engine.connect() as conn:
        stmt = select(users).where(users.c.id == user_id)
        result = conn.execute(stmt).first()
        return result

# Get all users
def get_all_users():
    with engine.connect() as conn:
        stmt = select(users)
        result = conn.execute(stmt).fetchall()
        return result

# Get all posts of a specific user
def get_posts_by_user(user_id: int):
    with engine.connect() as conn:
        stmt = select(posts).where(posts.c.user_id == user_id)
        result = conn.execute(stmt).fetchall()
        return result

# ==================================================
# UPDATE
# ==================================================

# Update user email
def update_user_email(user_id: int, new_email: str):
    with engine.connect() as conn:
        stmt = update(users).where(users.c.id == user_id).values(email=new_email)
        conn.execute(stmt)
        conn.commit()

# Update all posts title of a user
def update_user_posts_title(user_id: int, new_title: str):
    with engine.connect() as conn:
        stmt = update(posts).where(posts.c.user_id == user_id).values(title=new_title)
        conn.execute(stmt)
        conn.commit()

# ==================================================
# DELETE
# ==================================================

# Delete a post by post ID
def delete_post(post_id: int):
    with engine.connect() as conn:
        stmt = delete(posts).where(posts.c.id == post_id)
        conn.execute(stmt)
        conn.commit()
