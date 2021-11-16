import {
  Direction,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiText,
  EuiTextColor,
  EuiTitle,
  formatDate,
} from '@elastic/eui'
import React, { Fragment, useState } from 'react'
import { usePasswordResetUsers } from 'src/hooks/admin/usePasswordResetUsers'
import { AdminActionType } from 'src/redux/modules/admin/admin'
import { createTextFileWithCreds } from 'src/utils/files'
import AdminPageTemplate from '../AdminPageTemplate/AdminPageTemplate'

export default function PasswordResetRequestsPage() {
  //   const [pageIndex, setPageIndex] = useState(0)
  //   const [pageSize, setPageSize] = useState(5)
  const [sortField, setSortField] = useState('') // broken when specifying any field first
  const [sortDirection, setSortDirection] = useState<Direction>('asc')

  const { deletePasswordResetRequest, resetPasswordForUser, passwordResetRequests } = usePasswordResetUsers()

  const onTableChange = ({ page = {}, sort = {} }) => {
    const { field: sortField, direction: sortDirection }: any = sort

    setSortField(sortField)
    setSortDirection(sortDirection)
  }

  const resetPassword = async (user: ArrayElement<typeof passwordResetRequests>) => {
    const action = await resetPasswordForUser({ email: user.email })

    if (action?.type === AdminActionType.RESET_PASSWORD_FOR_USER_SUCCESS) {
      createTextFileWithCreds({ email: user.email, password: action.data })
    }
    console.log(`user`, user.email)
  }

  const deleteRequest = async (request: ArrayElement<typeof passwordResetRequests>) => {
    const action = await deletePasswordResetRequest({ request })
    if (action?.type !== AdminActionType.DELETE_PASSWORD_RESET_REQUEST_SUCCESS) {
      console.log(`error`, action.error)
    }

    console.log(`request`, request.email)
  }

  const actions = [
    {
      name: 'Reset',
      description: 'Reset password',
      icon: 'refresh',
      type: 'icon',
      color: 'warning',
      'data-test-subj': 'passwordResetTable__resetAction',
      onClick: resetPassword,
    },
    {
      name: 'Delete',
      description: 'Delete request',
      icon: 'trash',
      type: 'icon',
      color: 'danger',
      'data-test-subj': 'passwordResetTable__deleteAction',
      onClick: deleteRequest,
    },
  ]

  // field must match the object field name
  const columns: any = [
    {
      field: 'email',
      name: 'Email',
      sortable: true,
      truncateText: false,
      'data-test-subj': 'passwordResetTable__emailCell',
      mobileOptions: {
        show: true,
      },
    },
    {
      field: 'message',
      name: 'Message',
      sortable: true,
      truncateText: false,
      'data-test-subj': 'passwordResetTable__messageCell',
      mobileOptions: {
        show: true,
      },
    },
    {
      field: 'created_at',
      name: 'Creation Date',
      sortable: true,
      truncateText: true,
      render: (date) => formatDate(date, 'dobLong'),
      mobileOptions: {
        show: true,
      },
    },
    {
      name: 'Actions',
      actions,
    },
  ]

  const sorting: any = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    allowNeutralSort: true,
  }

  const title = (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="lockOpen" size="m" />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3 style={{ color: 'dodgerblue' }}>Manage password reset requests</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiText size="s">
        <p>
          <EuiTextColor color="subdued">Approve or deny existing user password reset requests.</EuiTextColor>
        </p>
      </EuiText>
    </div>
  )

  const element = (
    <Fragment>
      <EuiInMemoryTable
        rowProps={() => ({
          'data-test-subj': 'passwordResetTable__row',
        })}
        items={passwordResetRequests ?? []}
        message={passwordResetRequests?.length ? null : 'There are no password reset requests.'}
        itemId="email" // how to extract a unique ID from each item, for selections & expanded rows
        columns={columns}
        sorting={sorting}
        onChange={onTableChange}
        rowHeader="email"
        data-test-subj="passwordResetTable"
      />
    </Fragment>
  )

  return <AdminPageTemplate title={title} element={element} />
}
