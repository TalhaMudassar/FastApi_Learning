from app.main import add,divide
import pytest

# assert condition, [message]
# we also write differnt assert in the same function accourding to our need 
def test_add():  # write the function name with test for better understanding 
    assert add(2,3) == 5  # we check here equality and other things like conditions we also check exception here 
    assert add(-1,1) == 0
    assert add(0,0) == 0  
    
    
def test_divide():
    assert divide(6,2) == 3 
    assert divide(5,2) == 2.5
    
def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10,0)
        
    