from models import create_table,drop_table
import asyncio
from services import *

async def main():
    #create Table
    # await create_table()
    
    #create data
    # await create_user("talha","talha@gmail.com")
    # await create_user("sonam","sonam@gmail.com")
    
    
    #Read data
    # userca = await get_user_by_id(2)
    # print(userca)
    
    #Read All data
    #Read data
    # userca = await get_all_users()
    # print(userca)
    
    
    #Update  email
    # await update_user_email(1,"talha@newdomain.com")
    
    #Delete user
    await delete_user(2)
    
asyncio.run(main())