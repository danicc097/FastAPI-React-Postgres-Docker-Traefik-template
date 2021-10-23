"""
This pattern has emerged in every one of our routes:
    1. Use the dependency injection system for:
        - supplying the database interface,
        - gathering the correct resources, and
        - checking permissions.
    2. Modify database records and return the proper response.

The workflow is basically:
    1. Write tests.
    2. Write api dependencies.
    3. Set up the api routes.
    4. Write db repository logic.

Don't have a table and corresponding models yet? Then:
    1. ``alembic downgrade base``
    2. Edit the migrations file
    3. ``alembic upgrade head``
    4. Create pydantic models.
    5.
"""


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
