from functools import wraps
from typing import Any, Callable
import timeit
from loguru import logger


def func_timer(method: Callable):
    """
    Log execution time of a function.
    """

    @wraps(method)
    def __func_timer(*args, **kwargs):

        start_time = timeit.default_timer()
        result = method(*args, **kwargs)
        elapsed = timeit.default_timer() - start_time

        logger.info(
            "Timing",
            method=method.__name__,
            seconds=elapsed,
        )

        return result

    return __func_timer
