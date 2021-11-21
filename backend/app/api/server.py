import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api.routes import router as api_router
from app.core import config, tasks


def get_application():
    """
    Factory function that returns a FastAPI app with CORS middleware configured.
    """
    app = FastAPI(title=config.PROJECT_NAME, version=config.VERSION)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # TODO restrict this to front-end and dev/ci domain later
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # https://fastapi.tiangolo.com/advanced/events/
    app.add_event_handler("startup", tasks.create_start_app_handler(app))
    app.add_event_handler("shutdown", tasks.create_stop_app_handler(app))

    app.include_router(api_router, prefix="/api")

    return app


app = get_application()


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
