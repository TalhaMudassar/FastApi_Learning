from tables import create_tables
from services import *

# Create tables
create_tables()

# ==================================================
# CREATE DATA
# ==================================================
# create_user("sonam", "sonam@example.com", "1234567890")
# create_user("bajwa", "bajwa@example.com")
# create_user("raj", "raj@example.com")

# create_post(1, "Hello World", "This is Sonam's first post")
# create_post(2, "Bajwa's Post", "Hi from Bajwa")

# ==================================================
# READ DATA
# ==================================================
# print(get_user_by_id(1))
# print(get_all_users())
# print(get_posts_by_user(2))

# ==================================================
# UPDATE DATA
# ==================================================
# update_user_email(1, "sonam@newdomain.com")
# update_user_posts_title(2, "Updated title for Bajwa")

# ==================================================
# DELETE DATA
# ==================================================
# delete_post(2)
