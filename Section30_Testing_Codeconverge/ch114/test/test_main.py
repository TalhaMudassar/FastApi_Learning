from app.main import async_add,async_divide
import pytest
import asyncio


@pytest.fixture
async def async_setup():
    await asyncio.sleep(1)
    return {'a':10, 'b':20}

@pytest.mark.asyncio
async def test_async_add_with_fixture(async_setup):
    assert await async_add(async_setup['a'],async_setup['b']) == 30
    

@pytest.mark.parametrize("a,b,expected",[(2,3,5),(-1,1,0)])
@pytest.mark.asyncio
async def test_async_add_parametrize(a,b,expected):
    assert await async_add(a,b) ==  expected
    