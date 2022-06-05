from celery.result import AsyncResult
from fastapi import APIRouter, Depends, Query
from starlette.status import HTTP_202_ACCEPTED

from app.api.dependencies.auth import RoleVerifier, email_is_verified
from app.api.routes.utils.errors import task_exception_handler
from app.celery.models import TaskAccepted, TaskStatus, TaskType
from app.celery.worker import celery_app
from app.db.gen.queries.models import Role

router = APIRouter()


@router.get(
    "/tasks/{task_id}/",
    name="celery:get-task-status",
    response_model=TaskStatus,
    dependencies=[Depends(email_is_verified)],
)
def get_status(task_id):
    task_result = AsyncResult(task_id, app=celery_app)
    return TaskStatus(
        task_id=task_id,
        # task_type=task_result.task_type,
        task_status=task_result.status,
        task_result=task_result.result,
    )

@router.get(
    "/vacuum-analyze/",
    status_code=HTTP_202_ACCEPTED,
    response_model=TaskAccepted,
    name="celery:vacuum-analyze",
    dependencies=[Depends(RoleVerifier(Role.ADMIN))],
)
def run_vacuum_analyze_task():
    with task_exception_handler():
        task = celery_app.send_task("vacuum_analyze_task")
        return TaskAccepted(task_id=task.id, task_type=TaskType.VACUUM_ANALYZE)
