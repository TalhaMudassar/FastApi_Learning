from tables import create_tables
from services import *

create_tables()


# create_user("sonam","sonam@example.com")
# create_user("raj","raj@example.com")
# create_post("1","Hello World","This is sonam first post")
# create_post("1","Bye world","This is sonam second post")
# create_post("1","No world","This is sonam Third post")
# create_post("2","Raj's post 1","Hi from Raj 1")
# create_post("2","Raj's post 2","Hi from Raj 2")


print(get_posts_with_author())