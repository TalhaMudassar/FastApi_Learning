from tables import create_table,drop_table
import asyncio
from services import *

async def main():
    # Create table
    # await create_table()
    
    # Create Data
    # await create_user("talha","talha@gmail.com")
    # await create_user("mudassar","mudassar@gmail.com")
    
    #Get_single_user_by_id
    # user = await get_user_by_id(1)  
    # print(user)
    
    # Update user email
    # await update_user_email(1, "talha@newdomain.com")
    
    # Optional: verify update
    # user = await get_user_by_id(1)
    # print(user)
    
    
    await delete_user(2)
    
    
      
asyncio.run(main())

