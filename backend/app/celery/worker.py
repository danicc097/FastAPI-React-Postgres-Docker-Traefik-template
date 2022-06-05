import os

from celery import Celery

from app.core import config

celery_app = Celery(f"app.celery.worker.{config.APP_ENV}")
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["application/json", "application/x-python-serialize"]
celery_app.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "redis://redis_myapp:6379/0")
celery_app.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "redis://redis_myapp:6379/0")
celery_app.conf.singleton_backend_url = celery_app.conf.result_backend
celery_app.conf.result_expires = 60 * 60 * 8
celery_app.conf.ONCE = {
    "backend": "celery_once.backends.Redis",
    "settings": {"url": celery_app.conf.result_backend, "default_timeout": 60 * 60},
}
# TODO manual routing so prod and dev use their respective queues, else tasks get randomly distributed
# https://docs.celeryq.dev/en/latest/userguide/routing.html#manual-routing
celery_app.conf.task_default_queue = f"myapp_queue_{config.APP_ENV}"

celery_app.autodiscover_tasks(["app.celery.tasks"])
