import { EuiEmptyPrompt } from '@elastic/eui'
import _ from 'lodash'
import React from 'react'
import { schema } from 'src/types/schema_override'
import { getAllowedRoles } from 'src/utils/permissions'

type ComponentPermissionsProps = {
  element: JSX.Element
  requiredRole?: schema['Role']
  user: schema['UserPublic']
}

/**
 * Wrap elements to be visible only to users with the required role
 */
export default function ComponentPermissions({ element, requiredRole = 'user', user }: ComponentPermissionsProps) {
  const allowedRoles = getAllowedRoles(requiredRole)
  const isAllowed = _.includes(allowedRoles, user.role)
  console.log(`${user.role} is ${isAllowed ? 'allowed' : 'not allowed'} to view ${requiredRole}`)
  if (!isAllowed) {
    return null
  }

  return element
}
