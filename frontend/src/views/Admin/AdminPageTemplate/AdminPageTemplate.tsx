import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPageBody,
  EuiPageContent,
  EuiText,
  EuiTextColor,
  EuiTitle,
  EuiHorizontalRule,
} from '@elastic/eui'
import React from 'react'

import styled from 'styled-components'
import { useUnverifiedUsers } from 'src/hooks/admin/useUnverifiedUsers'
import { usePasswordResetUsers } from 'src/hooks/admin/usePasswordResetUsers'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from 'src/components/StyledComponents/StyledComponents'
import UnverifiedUsersPage from '../UnverifiedUsersPage/UnverifiedUsersPage'
import PasswordResetPage from '../PasswordResetPage/PasswordResetPage'
import PasswordResetRequestsPage from '../PasswordResetRequestsPage/PasswordResetRequestsPage'

const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    max-width: 70%;
    min-width: 800px;
  }
`

const StyledEuiHorizontalRule = styled(EuiHorizontalRule)`
  &&& {
    background-color: dodgerblue;
  }
`

type AdminPageTemplateProps = {
  title: React.ReactNode
  element: React.ReactNode
}

export default function AdminPageTemplate({ title, element }: AdminPageTemplateProps) {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={1}>
            <StyledEuiPageHeader>
              <LandingTitle>Admin panel</LandingTitle>
            </StyledEuiPageHeader>
          </EuiFlexItem>
          <EuiFlexItem grow={10}>
            <StyledEuiPageContent horizontalPosition="center">
              {title}
              <StyledEuiHorizontalRule margin="m" />
              {element}
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
