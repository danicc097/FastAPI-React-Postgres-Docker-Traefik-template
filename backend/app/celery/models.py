from enum import Enum
from typing import Any, Optional

from app.models.core import CoreModel


class TaskType(str, Enum):
    VACUUM_ANALYZE = "vacuum_analyze"


class TaskStatus(CoreModel):
    task_id: str
    task_status: Optional[str]
    task_result: Optional[Any]


class TaskAccepted(CoreModel):
    task_id: Optional[str]
    task_type: Optional[TaskType]


class TaskResult(CoreModel):
    message: str
