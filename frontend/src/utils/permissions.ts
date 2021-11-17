import { schema } from 'src/types/schema_override'

export const ROLE_PERMISSIONS: { [key in Partial<schema['Roles']>]: schema['Roles'][] } = {
  user: ['user'],
  manager: ['manager', 'user'],
  admin: ['admin', 'manager', 'user'],
}

/**
 * Returns the roles allowed to access an element restricted to role ``requiredRole``
 */
export const getAllowedRoles = (requiredRole: Partial<schema['Roles']>) => {
  return Object.keys(ROLE_PERMISSIONS).filter((role) => ROLE_PERMISSIONS[role].includes(requiredRole))
}
