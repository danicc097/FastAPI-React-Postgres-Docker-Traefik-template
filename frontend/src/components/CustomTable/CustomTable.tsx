//
//
//
// THIS PROBABLY ISNT WORTH IT.
//
//
//
//

import {
  Direction,
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiInMemoryTableProps,
  EuiTableSortingType,
  EuiText,
  formatDate,
} from '@elastic/eui'
import React, { useState, Fragment, useRef } from 'react'

import { EuiBasicTable, EuiLink, EuiHealth, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui'
import { useUnverifiedUsers } from 'src/hooks/admin/useUnverifiedUsers'
import styled from 'styled-components'
import { schema } from 'src/types/schema_override'
import { Action } from '@elastic/eui/src/components/basic_table/action_types'

type CustomTableProps = {
  columns: EuiBasicTableColumn<any>[]
  data: Array<GenObjType<string>>
  onClickSelectionAction?: () => Promise<void> // action to perform on selected rows
  actions?: Array<Action<any>> // possible actions to perform directly on a row
}

export default function CustomTable({ columns, data, onClickSelectionAction, actions }: CustomTableProps) {
  //   const [pageIndex, setPageIndex] = useState(0)
  //   const [pageSize, setPageSize] = useState(5)
  const [sortField, setSortField] = useState() // broken when specifying any field first
  const [selectedItems, setSelectedItems] = useState<Array<any>>([])
  const [sortDirection, setSortDirection] = useState<Direction>('asc')
  const { verifyUsers, fetchAllNonVerifiedUsers, removeVerifiedUsersFromStore } = useUnverifiedUsers()

  const onTableChange = ({ page = {}, sort = {} }) => {
    const { field: sortField, direction: sortDirection }: any = sort

    setSortField(sortField)
    setSortDirection(sortDirection)
  }

  const onSelectionChange = (selectedItems) => {
    setSelectedItems(selectedItems)
  }

  // don't forget async...
  const TODOonClickVerify = async () => {
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

  // since it depends on state (selectedItems),
  // it will be re-rendered every time the state changes
  const renderVerifyButton = () => {
    if (selectedItems.length === 0) {
      return
    }
    return (
      <EuiButton color="primary" iconType="checkInCircleFilled" onClick={onClickSelectionAction}>
        Verify {selectedItems?.length} Users
      </EuiButton>
    )
  }
  const verifyButton = renderVerifyButton()

  // field must match the object field name
  const TODOcolumns = [
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
    selectable: (user) => !user.email_verified,
    selectableMessage: (selectable) => (!selectable ? 'User is already verified' : undefined),
    onSelectionChange: onSelectionChange,
    initialSelected: [selectedItems],
  }

  return (
    <Fragment>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>{verifyButton}</EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />

      <EuiInMemoryTable
        items={data ?? []}
        message={data?.length ? null : 'There are no unverified users.'}
        itemId="email" // how to extract a unique ID from each item, for selections & expanded rows
        columns={columns}
        // allowNeutralSort={true}
        sorting={sorting}
        selection={selection}
        onChange={onTableChange}
        rowHeader="email"
      />
    </Fragment>
  )
}
