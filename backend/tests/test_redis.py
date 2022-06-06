import fakeredis
import pytest
import redis_lock
from loguru import logger

from app.celery.locking import rds


def flaky(fn, timeout=10, max_runs=3):
    _flaky = pytest.mark.flaky(max_runs=max_runs)
    _timeout = pytest.mark.timeout(timeout=timeout)
    return _timeout(_flaky(fn))


# @pytest.mark.usefixtures("celery_session_app")
# @pytest.mark.usefixtures("celery_session_worker")
# class TestRedis:
#     def test_redis_locking(self):
#         # see https://github.com/cameronmaske/celery-once/blob/master/tests/integration/test_tasks.py
#         # below from : https://github.com/cameronmaske/celery-once/blob/master/tests/integration/flask_app/test_flask.py
#         # TODO ditch celery-once and use https://gist.github.com/aaronpolhamus/cb305a3350f943215d00b66c85f576ea
#         # with redis locks https://redis-py.readthedocs.io/en/stable/#redis.Redis.lock
#         # also see https://breadcrumbscollector.tech/what-is-celery-beat-and-how-to-use-it-part-2-patterns-and-caveats/
#         # for redis locks,  and
#         # https://github.com/ionelmc/python-redis-lock/blob/master/tests/test_redis_lock.py
#         _rds = fakeredis.FakeStrictRedis()
#         with redis_lock.Lock(rds, "test_lock", expire=1) as lock:
#             logger.critical(f"acquired lock {lock.get_owner_id()}")
#             logger.critical(f"acquired lock {lock.id}")
#             with redis_lock.Lock(rds, "test_lock", expire=1) as lock2:
#                 logger.critical(f"acquired lock {lock2.get_owner_id()}")
#                 logger.critical(f"acquired lock {lock2.id}")
