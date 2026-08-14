import asyncio

async def async_add(a,b):
    await asyncio.sleep(1)
    return a+b


async def async_divide(a,b):
    await asyncio.sleep(1)
    if b == 0:
        raise ValueError("Cannot divide by 0!")
    return a/b
    