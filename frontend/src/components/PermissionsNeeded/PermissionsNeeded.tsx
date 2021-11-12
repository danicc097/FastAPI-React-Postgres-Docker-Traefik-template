import { EuiEmptyPrompt } from '@elastic/eui'
import _ from 'lodash'
import React from 'react'

type PermissionsNeededPropTypes = {
  element: JSX.Element
  isAllowed: boolean
  adminRoute?: boolean
}

// props with same syntax as the Route component from react-router-dom
export default function PermissionsNeeded({
  element,
  isAllowed = false,
  adminRoute = false,
}: PermissionsNeededPropTypes) {
  if (!isAllowed) {
    return (
      <EuiEmptyPrompt
        iconType="securityApp"
        iconColor={null}
        title={<h2>Access Denied</h2>}
        body={
          adminRoute ? (
            <p>You are not authorized to access this content.</p>
          ) : (
            <>
              <p>{_.escape(`You don't have the required permissions to access this content.`)}</p>
            </>
          )
        }
      />
    )
  }

  return element
}
