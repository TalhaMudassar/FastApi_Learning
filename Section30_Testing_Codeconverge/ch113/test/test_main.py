from app.main import async_add,async_divide
import pytest

@pytest.mark.asyncio
async def test_async_add():
    assert await async_add(2,3) == 5
    assert await async_add(-1,1) == 0
    assert await async_add(0,0) == 0
    
    
@pytest.mark.asyncio
async def test_async_divide_by_zero():
    with pytest.raises(ValueError):
        await async_divide(10,0)