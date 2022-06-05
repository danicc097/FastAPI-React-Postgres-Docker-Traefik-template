import { EuiEmptyPrompt } from '@elastic/eui'
import _ from 'lodash'
import React from 'react'
import { schema } from 'src/types/schemaOverride'
import { getAllowedRoles } from 'src/services/permissions'

type ComponentPermissionsProps = {
  element: JSX.Element
  requiredRole?: schema['Role']
  user: schema['UserPublic']
}

export default function ComponentPermissions({ element, requiredRole = 'user', user }: ComponentPermissionsProps) {
  const allowedRoles = getAllowedRoles(requiredRole)
  const isAllowed = _.includes(allowedRoles, user?.role)
  console.log(`${user?.role} is ${isAllowed ? 'allowed' : 'not allowed'} to view ${requiredRole}`)
  if (!isAllowed) {
    return null
  }

  return element
}
