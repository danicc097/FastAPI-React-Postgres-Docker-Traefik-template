import {
  Direction,
  EuiIcon,
  EuiInMemoryTable,
  EuiInMemoryTableProps,
  EuiTableSortingType,
  EuiText,
  EuiTextColor,
  EuiTitle,
  formatDate,
} from '@elastic/eui'
import React, { useState, Fragment, useRef } from 'react'

import { EuiBasicTable, EuiLink, EuiHealth, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui'
import { useUnverifiedUsers } from 'src/hooks/admin/useUnverifiedUsers'
import styled from 'styled-components'
import { schema } from 'src/types/schema_override'
import AdminPageTemplate from '../AdminPageTemplate/AdminPageTemplate'

export default function UnverifiedUsersPage() {
  //   const [pageIndex, setPageIndex] = useState(0)
  //   const [pageSize, setPageSize] = useState(5)
  const [sortField, setSortField] = useState('') // broken when specifying any field first
  const [selectedItems, setSelectedItems] = useState<typeof unverifiedUsers>([])
  const [sortDirection, setSortDirection] = useState<Direction>('asc')
  const { verifyUsers, fetchAllNonVerifiedUsers, removeVerifiedUsersFromStore, unverifiedUsers } = useUnverifiedUsers()

  const onTableChange = ({ page = {}, sort = {} }) => {
    const { field: sortField, direction: sortDirection }: any = sort

    setSortField(sortField)
    setSortDirection(sortDirection)
  }

  const onSelectionChange = (selectedItems) => {
    setSelectedItems(selectedItems)
  }

  // don't forget async...
  const onClickVerify = async () => {
    // return list of user.email from selectedItems
    // verifyUsers needs to return whatever dispatch returns to be able to await the response
    const action = await verifyUsers({ userEmails: selectedItems.map((user) => user.email) })
    console.log(
      `selectedItems.map((user) => user.email)`,
      selectedItems.map((user) => user.email),
    )
    if (action.success) {
      await fetchAllNonVerifiedUsers()
      removeVerifiedUsersFromStore({ users: selectedItems })
      setSelectedItems([])
    }
  }

  const renderVerifyButton = () => {
    if (selectedItems.length === 0) {
      return
    }
    return (
      <EuiButton
        color="primary"
        iconType="checkInCircleFilled"
        onClick={onClickVerify}
        data-test-subj="verify-users-submit"
      >
        Verify {selectedItems?.length} Users
      </EuiButton>
    )
  }
  const verifyButton = renderVerifyButton()

  // field must match the object field name
  const columns = [
    {
      field: 'email',
      name: 'Email',
      sortable: true,
      truncateText: true,
      mobileOptions: {
        show: true,
      },
    },
    {
      field: 'username',
      name: 'Username',
      sortable: true,
      truncateText: true,
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
  ]

  const sorting: any = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    allowNeutralSort: true,
  }

  const selection = {
    selectable: (user) => !user.is_verified,
    selectableMessage: (selectable) => (!selectable ? 'User is already verified' : undefined),
    onSelectionChange: onSelectionChange,
    initialSelected: [selectedItems],
  }

  const title = (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="lockOpen" size="m" />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3 style={{ color: 'dodgerblue' }}>Manage user verification</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiText size="s">
        <p>
          <EuiTextColor color="subdued">Approve or deny new user account registrations.</EuiTextColor>
        </p>
      </EuiText>
    </div>
  )

  const element = (
    <Fragment>
      {verifyButton}
      <EuiSpacer size="s" />
      <EuiInMemoryTable
        items={unverifiedUsers ?? []}
        message={unverifiedUsers?.length ? null : 'There are no unverified users'}
        itemId="email" // how to extract a unique ID from each item, for selections & expanded rows
        columns={columns}
        sorting={sorting}
        selection={selection}
        onChange={onTableChange}
        rowHeader="email"
      />
    </Fragment>
  )

  return <AdminPageTemplate title={title} element={element} />
}
