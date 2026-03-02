from sqlmodel import SQLModel,Field

class User(SQLModel, table = True):
    id: int = Field(primary_key=True)
    name: str
    email: str
    
    
#Junction Table  for (Many to Many table)
class UserAddressLink(SQLModel,table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    address_id: int = Field(foreign_key="address.id",primary_key=True)
    


#One to One
class Profile(SQLModel, table = True):
    id: int = Field(primary_key=True)
    user_id : int = Field(foreign_key="user.id", unique=True)
    bio : str
    
    
    
#One to Many
class Post(SQLModel, table = True):
    id: int = Field(primary_key=True)
    user_id : int = Field(foreign_key="user.id")
    title : str
    content : str
    
#Many to Many
class   Address(SQLModel, table = True):
    id: int = Field(primary_key=True)
    street: str
    city: str