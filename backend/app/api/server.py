import os
import time

import uvicorn
from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from starlette.requests import Request
from uvicorn.supervisors import ChangeReload

from app.api.dependencies.auth import RoleVerifier
from app.api.routes.admin import router as admin_router
from app.api.routes.celery import router as celery_router
from app.api.routes.fileserver import router as fileserver_router
from app.api.routes.profiles import router as profiles_router
from app.api.routes.sse import router as sse_router
from app.api.routes.stream import router as stream_router
from app.api.routes.users import router as users_router
from app.core import config, tasks
from app.db.gen.queries.models import Role


def get_application():

    app = FastAPI(
        title=config.PROJECT_NAME,
        version=config.VERSION,
        root_path=config.ROOT_PATH,
        servers=[
            {
                "url": f"https://myapp.{config.APP_ENV}.localhost{config.ROOT_PATH}",
                "description": f"{config.APP_ENV} server",
            }
        ],
    )
    origins = [
        config.DOMAIN,
        "https://myapp.e2e.localhost",
        "http://localhost",
        # probably not needed
        "http://localhost:8999",  # pytest
        "http://localhost:3000",  # local dev
        "https://localhost:3000",  # local dev
    ]  # related error: Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_event_handler("startup", tasks.create_startup_handler(app))
    app.add_event_handler("shutdown", tasks.create_shutdown_handler(app))

    router = APIRouter()

    router.include_router(users_router, prefix="/users", tags=["users"])
    router.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
    router.include_router(
        admin_router, prefix="/admin", tags=["admin"], dependencies=[Depends(RoleVerifier(Role.ADMIN))]
    )
    router.include_router(fileserver_router, prefix="/fileserver", tags=["fileserver"])
    router.include_router(sse_router, prefix="/sse", tags=["sse"])
    router.include_router(stream_router, prefix="/stream", tags=["stream"])
    router.include_router(celery_router, prefix="/celery", tags=["celery"])

    app.include_router(router, prefix=config.API_PREFIX)

    return app


app = get_application()


STREAMING_PATHS = ["notifications-stream"]


@app.middleware("http")
async def http_middleware(request: Request, call_next):
    start_time = time.time()

    logger.info(f"Received request: {request.url.path}")
    response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    # if not any(request.url.path in path for path in STREAMING_PATHS):
    response.headers["Access-Control-Allow-Origin"] = "*"
    logger.info(f"Finalized request: {request.url.path}")
    return response


if __name__ == "__main__":
    cfg = uvicorn.Config(
        "app.api.server:app",
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT")),
        log_level="debug",
        reload=True,
        reload_dirs=["app/"],
    )

    server = uvicorn.Server(config=cfg)

    server.force_exit = True
    sock = cfg.bind_socket()
    supervisor = ChangeReload(cfg, target=server.run, sockets=[sock])
    supervisor.run()


# NOTE: if adding fastapi's gzip middleware, check request path here and only act on the appropiate routes
# e.g. SSE on starlette wont work with gzip middleware.
# Disregard for traefik middleware
