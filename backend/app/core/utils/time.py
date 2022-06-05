import timeit
from functools import wraps
from typing import Callable

from loguru import logger


def func_timer(fn: Callable):
    @wraps(fn)
    def __func_timer(*args, **kwargs):

        start_time = timeit.default_timer()
        result = fn(*args, **kwargs)
        elapsed = timeit.default_timer() - start_time

        logger.info(
            "Timing",
            fn=fn.__name__,
            seconds=elapsed,
        )

        return result

    return __func_timer
