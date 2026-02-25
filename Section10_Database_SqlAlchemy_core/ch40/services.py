from db import engine
from tables import users,posts
from sqlalchemy import insert,select,asc,desc,func

def create_user(name:str,email:str,phoneno:str|None=None):
    with engine.connect() as conn:
        stmt = insert(users).values(name=name,email=email,phoneno=phoneno)
        conn.execute(stmt)
        conn.commit()
        
        
def create_post(user_id: int, title: str, content: str):
    with engine.connect() as conn:
        stmt = insert(posts).values(user_id=user_id, title=title, content=content)
        conn.execute(stmt)
        conn.commit()


# Join Users And Posts (List All posts with author's Name)
def get_posts_with_author():
    with engine.connect() as conn:
        stmt = select(
            posts.c.id,
            posts.c.title,
            users.c.name.label("author_name")
        ).join(users,posts.c.user_id == users.c.id)
        result = conn.execute(stmt).fetchall()
        return result
        
