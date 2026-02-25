from tables import create_tables
from services import raw_sql_insert, raw_sql_select

# Create tables (only run once)
create_tables()

# Insert using raw SQL
raw_sql_insert()

# Fetch using raw SQL
users = raw_sql_select()
print(users)








