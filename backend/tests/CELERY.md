http://mikebian.co/lessons-learned-building-with-django-celery-and-pytest/#job-management-using-celery
takeaways:
-You can configure celery to store results. If you do, you are responsible for clearing out results. They do not expire automatically.
- Celery is threaded by default. If your code is not thread safe, you’ll need to set --concurrency=1.
- By default, tasks do not run inline. If you want to setup an integration test for your tasks, you need either
  - (a) run tasks in eager mode (not recommended as per docs) or
  - (b) setup a worker thread to run tasks for you during your tests.
    However, running a worker thread introduces another set of issues (like database cleanup not working properly).
  - There’s no real downside to using @shared_task instead of @app.task. It’s easier to do this from the start: less refactoring to do when your application grows.


routing tasks between differnet envs: e2e, prod, dev:
https://github.com/celery/celery/issues/2508
e2e should share dev celery worker, else huge overhead
``@shared_task(queue=f'myqueue{ENV}', name='mytask')``


memory not being freed up after tasks end leak:
set CELERYD_MAX_TASKS_PER_CHILD to something reasonable and
e.g. worker_max_memory_per_child = 12000  # 12MB
https://docs.celeryq.dev/en/latest/userguide/workers.html#max-memory-per-child-setting
