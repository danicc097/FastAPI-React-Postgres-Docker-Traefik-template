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
    Roles.user: ["user"],
    Roles.manager: ["manager", "user"],
    Roles.admin: ["admin", "manager", "user"],
}
