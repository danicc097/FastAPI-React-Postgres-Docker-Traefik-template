import { schema } from 'src/types/schemaOverride'

type RolePermissions = {
  [key in schema['Role']]: schema['Role'][]
}

export const ROLE_PERMISSIONS: RolePermissions = {
  user: ['user'],
  manager: ['manager', 'user'],
  admin: ['admin', 'manager', 'user'],
}

export const getAllowedRoles = (requiredRole: schema['Role']) => {
  return Object.keys(ROLE_PERMISSIONS).filter((role) => ROLE_PERMISSIONS[role].includes(requiredRole))
}

export const getImplicitRoles = (userRole: schema['Role']) => {
  return ROLE_PERMISSIONS[userRole]
}
