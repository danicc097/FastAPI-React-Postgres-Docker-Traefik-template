from app.db.gen.queries.models import Role

ROLE_PERMISSIONS = {
    Role.USER: [
        Role.USER,
    ],
    Role.MANAGER: [
        Role.MANAGER,
        Role.USER,
    ],
    Role.ADMIN: [
        Role.ADMIN,
        Role.MANAGER,
        Role.USER,
    ],
}
"""
Determine what access privileges a certain ``Role`` has.
"""
