from app.models.user import Role

ROLE_PERMISSIONS = {
    Role.user: [
        Role.user.value,
    ],
    Role.manager: [
        Role.manager.value,
        Role.user.value,
    ],
    Role.admin: [
        Role.admin.value,
        Role.manager.value,
        Role.user.value,
    ],
}
"""
Determine what access privileges a certain ``Role`` has.
"""
