import { schema } from 'src/types/schema_override'

type RolePermissions = {
  [key in schema['Role']]: schema['Role'][]
}

export const ROLE_PERMISSIONS: RolePermissions = {
  user: ['user'],
  manager: ['manager', 'user'],
  admin: ['admin', 'manager', 'user'],
}

/**
 * Returns the roles allowed to access an element restricted to role ``requiredRole``
 * E.g. restricting to ``user`` role will make everyone able to access the element
 */
export const getAllowedRoles = (requiredRole: Partial<schema['Role']>) => {
  return Object.keys(ROLE_PERMISSIONS).filter((role) => ROLE_PERMISSIONS[role].includes(requiredRole))
}

/**
 * Returns the roles a given ``userRole`` has implicit access to
 */
export const getImplicitRoles = (userRole: Partial<schema['Role']>) => {
  return ROLE_PERMISSIONS[userRole]
}
