from db import create_table
from services import create_user,get_all_users,get_single_user,get_user_with_get

# create_table()

# new_user = create_user("sonam","sonam@ucp.edu.pk")
# print(new_user)

# get_user = get_all_users()
# print(get_user)
# user = get_single_user(1)
# print(user)

print(get_user_with_get(1))
