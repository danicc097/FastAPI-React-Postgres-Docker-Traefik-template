import { EuiEmptyPrompt } from '@elastic/eui'
import _ from 'lodash'
import React from 'react'

type PagePermissionsProps = {
  element: JSX.Element
  isAllowed: boolean
  adminRoute?: boolean
}

export default function PagePermissions({ element, isAllowed = false }: PagePermissionsProps) {
  if (!isAllowed) {
    return (
      <EuiEmptyPrompt
        iconType="securityApp"
        iconColor={null}
        title={<h2 className="eui-textInheritColor">Access Denied</h2>}
        body={<p>{`You don't have the required permissions to access this content.`}</p>}
      />
    )
  }

  return element
}
