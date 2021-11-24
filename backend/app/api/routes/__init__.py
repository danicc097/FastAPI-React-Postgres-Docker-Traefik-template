from fastapi import APIRouter

from app.api.routes.admin import router as admin_router
from app.api.routes.profiles import router as profiles_router
from app.api.routes.users import router as users_router

router = APIRouter()


# we can also rely on the ``name`` of any route in the router to send
# HTTP requests, e.g. "cleanings:create-cleaning" (url reversing)
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
router.include_router(admin_router, prefix="/admin", tags=["admin"])
