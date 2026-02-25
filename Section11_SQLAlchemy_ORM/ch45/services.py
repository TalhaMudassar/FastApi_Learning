from models import Post, User
from db import SessionLocal
from sqlalchemy import select, asc


# ==================================================
# CREATE
# ==================================================

# Create User
def create_user(name: str, email: str):
    with SessionLocal() as session:
        user = User(name=name, email=email)
        session.add(user)
        session.commit()
        session.refresh(user)   # get updated data (id)
        return user


# Create Post
def create_post(user_id: int, title: str, content: str):
    with SessionLocal() as session:
        post = Post(user_id=user_id, title=title, content=content)
        session.add(post)
        session.commit()
        session.refresh(post)
        return post


# ==================================================
# READ
# ==================================================

# Get User by ID
def get_user_by_id(user_id: int):
    with SessionLocal() as session:
        return session.get(User, user_id)


# Get Post by ID (using select)
def get_post_by_id(post_id: int):
    with SessionLocal() as session:
        stmt = select(Post).where(Post.id == post_id)
        return session.scalars(stmt).one_or_none()


# Get All Users
def get_all_users():
    with SessionLocal() as session:
        stmt = select(User)
        return session.scalars(stmt).all()


# Get All Posts of Specific User
def get_all_posts_by_user(user_id: int):
    with SessionLocal() as session:
        user = session.get(User, user_id)
        return user.posts if user else []


# ==================================================
# UPDATE
# ==================================================

# Update User Email
def update_user_email(user_id: int, new_email: str):
    with SessionLocal() as session:
        user = session.get(User, user_id)
        if user:
            user.email = new_email
            session.commit()
            session.refresh(user)
        return user


# Update Post Title
def update_post_title(post_id: int, new_title: str):
    with SessionLocal() as session:
        post = session.get(Post, post_id)
        if post:
            post.title = new_title
            session.commit()
            session.refresh(post)
        return post


# ==================================================
# DELETE
# ==================================================

# Delete Post
def delete_post_by_id(post_id: int):
    with SessionLocal() as session:
        post = session.get(Post, post_id)
        if post:
            session.delete(post)
            session.commit()
            return True
        return False


# Delete User
def delete_user_by_id(user_id: int):
    with SessionLocal() as session:
        user = session.get(User, user_id)
        if user:
            session.delete(user)
            session.commit()
            return True
        return False


# ==================================================
# ORDER BY
# ==================================================

# Get Users Ordered by Name
def get_users_ordered_by_name():
    with SessionLocal() as session:
        stmt = select(User).order_by(asc(User.name))
        return session.scalars(stmt).all()
