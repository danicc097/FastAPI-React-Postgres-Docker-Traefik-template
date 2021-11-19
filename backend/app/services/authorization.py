# export const ROLE_PERMISSIONS: RolePermissions = {
#   user: ['user'],
#   manager: ['manager', 'user'],
#   admin: ['admin', 'manager', 'user'],
# }

# /**
#  * Returns the roles allowed to access an element restricted to role ``requiredRole``
#  */
# export const getAllowedRoles = (requiredRole: Partial<schema['Roles']>) => {
#   return Object.keys(ROLE_PERMISSIONS).filter((role) => ROLE_PERMISSIONS[role].includes(requiredRole))
# }


# convert the above typescript code to python to allow authorization
# to be used in the backend
from app.models.user import Roles

ROLE_PERMISSIONS = {
    Roles.user: [
        Roles.user.value,
    ],
    Roles.manager: [
        Roles.manager.value,
        Roles.user.value,
    ],
    Roles.admin: [
        Roles.admin.value,
        Roles.manager.value,
        Roles.user.value,
    ],
}
"""
Determine what access privileges a certain ``role`` has.
"""


def is_authorized(required_role: Roles, user_role: Roles) -> bool:
    """
    Determine if a user is authorized to access an element restricted to role ``requiredRole``.
    """
    return user_role in ROLE_PERMISSIONS[required_role]
