import asyncio
import time

from celery.utils.log import get_task_logger
from celery_once import QueueOnce
from sqlalchemy.pool import NullPool

from app.celery.locking import task_lock
from app.celery.models import TaskResult
from app.celery.utils import async_to_sync as async_to_sync_util
from app.celery.worker import celery_app
from app.core import config
from app.db.gen.queries.personal_notifications import (
    CreatePersonalNotificationParams,
)
from app.db.tasks import connect_to_db
from app.services.maintenance import MaintenanceService
from app.services.personal_notifications import PersonalNotificationsService

logger = get_task_logger(f"app.celery.worker.{config.APP_ENV}")
TASK_LOCK_TEST_SLEEP = 1


@celery_app.task(name="async_test_task_lock")
@task_lock(main_key="async_test_task_lock", timeout=5)
def async_test_task_lock(game_id):
    print(f"processing game_id {game_id}")
    time.sleep(TASK_LOCK_TEST_SLEEP)


@celery_app.task(
    name="tests.integration.sleep_task",
    base=QueueOnce,
    queue=f"myapp_queue_{config.APP_ENV}",
)
@async_to_sync_util
async def sleep_task(value):
    return await asyncio.sleep(value)


engine = connect_to_db(poolclass=NullPool)

# TODO task errors should have state.FAILURE, by default tasks always return with SUCCESS: https://stackoverflow.com/questions/7672327/how-to-make-a-celery-task-fail-from-within-the-task
@celery_app.task(
    name="vacuum_analyze_task",
    base=QueueOnce,
    queue=f"myapp_queue_{config.APP_ENV}",
)
@async_to_sync_util
async def vacuum_analyze_task(conn=None):
    return await vacuum_analyze(conn=conn)

# TODO https://stackoverflow.com/questions/28441143/celery-i-want-only-one-instance-of-my-task-in-the-queue-at-a-time
async def vacuum_analyze(conn=None):
    if engine is None:
        return TaskResult(message="Engine was not initialized").json()
    if conn is None:
        conn = await engine.connect()
    maintenance_service = MaintenanceService(conn)
    pn_service = PersonalNotificationsService(conn)
    try:
        await maintenance_service.vacuum_analyze()
        message = "Successfully vacuumed and analyzed."
        noti = await pn_service.create_personal_notification(
            notification=CreatePersonalNotificationParams(
                title="Vacuum analyze",
                body=message,
                label="task",
                receiver_email=config.ADMIN_EMAIL,
                sender=config.ADMIN_EMAIL,
            )  # type: ignore
        )
        await conn.commit() if not config.is_testing() else None
        return TaskResult(message=message).json()
    except Exception as e:
        await conn.rollback() if not config.is_testing() else None
        return TaskResult(message=f"Error: {e}").json()
    finally:
        await conn.close() if not config.is_testing() else None
