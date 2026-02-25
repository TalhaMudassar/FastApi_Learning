from db import engine
from tables import users, posts
from sqlalchemy import insert, select, asc, desc, func

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
# ORDER BY
# ==================================================

# 1️⃣ Get All Users Ordered by Name (A → Z)
def get_users_ordered_by_name():
    with engine.connect() as conn:
        stmt = select(users).order_by(asc(users.c.name))
        result = conn.execute(stmt).fetchall()
        return result


# 2️⃣ Get All Posts Latest First (Descending by ID)
def get_posts_latest_first():
    with engine.connect() as conn:
        stmt = select(posts).order_by(desc(posts.c.id))
        result = conn.execute(stmt).fetchall()
        return result


# ==================================================
# GROUP BY
# ==================================================

# 3️⃣ Count how many posts each user has
def get_post_count_per_user():
    with engine.connect() as conn:
        stmt = (
            select(
                posts.c.user_id,
                func.count(posts.c.id).label("total_posts")
            )
            .group_by(posts.c.user_id)
        )
        result = conn.execute(stmt).fetchall()
        return result


# ==================================================
# ADVANCED: GROUP BY + ORDER BY
# ==================================================

# 4️⃣ Get users with most posts first
def get_post_count_per_user_ordered():
    with engine.connect() as conn:
        stmt = (
            select(
                posts.c.user_id,
                func.count(posts.c.id).label("total_posts")
            )
            .group_by(posts.c.user_id)
            .order_by(desc(func.count(posts.c.id)))
        )
        result = conn.execute(stmt).fetchall()
        return result
