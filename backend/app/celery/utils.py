import asyncio
import functools
from itertools import repeat
from multiprocessing.pool import Pool

from loguru import logger


def force_sync(fn):
    """
    turn an async function to sync function
    """
    import asyncio

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        res = fn(*args, **kwargs)
        if asyncio.iscoroutine(res):
            return asyncio.get_event_loop().run_until_complete(res)
        return res

    return wrapper


def async_to_sync(func):
    @functools.wraps(func)
    def wrapped(*args, **kwargs):
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            logger.critical("loop and loop.is_running()")
            # return loop.create_task(func(*args, **kwargs)) # possibly when we run 2 tasks at the same time, we get an error
            future = loop.run_in_executor(
                None, functools.partial(func, *args, **kwargs)
            )  # this seems to work fine, everything passing. Ensure error isnt elsewhere if tests fail due to asyncio issues
            # response = yield from future # cant use generator, not pickable or json serializable, tests fail then
            return future

        else:
            logger.critical("async_to_sync: Starting new event loop")
            return asyncio.run(func(*args, **kwargs))

        # return asyncio.run(func(*args, **kwargs))

    return wrapped


def starstarmap(pool: Pool, fn, args_iter, kwargs_iter):
    """
    Usage:
    args_iter = zip(repeat(project_name), api_extensions)
    kwargs_iter = repeat(dict(payload={'a': 1}, key=True))
    branches = starstarmap(pool, fetch_api, args_iter, kwargs_iter)
    ref: https://stackoverflow.com/questions/45718523/pass-kwargs-to-starmap-while-using-pool-in-python
    """
    args_for_starmap = zip(repeat(fn), args_iter, kwargs_iter)
    return pool.starmap(apply_args_and_kwargs, args_for_starmap)


def apply_args_and_kwargs(fn, args, kwargs):
    return fn(*args, **kwargs)
