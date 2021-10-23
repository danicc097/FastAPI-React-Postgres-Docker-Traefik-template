import {
  EuiAccordion,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiText,
  EuiTextArea,
  EuiTextColor,
  EuiTitle,
  formatDate,
  EuiSpacer,
  EuiHorizontalRule,
} from '@elastic/eui'
import React, { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import styled from 'styled-components'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from '../StyledComponents/StyledComponents'
import UnverifiedUsersTable from './UnverifiedUsersTable'
import { useUnverifiedUsers } from 'src/hooks/admin/useUnverifiedUsers'
import { usePasswordResetUsers } from 'src/hooks/admin/usePasswordResetUsers'
import PasswordResetRequestsTable from './PasswordResetRequestsTable'
import PasswordResetForm from './PasswordResetForm'

const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    max-width: 70%;
  }
`

const StyledEuiHorizontalRule = styled(EuiHorizontalRule)`
  &&& {
    background-color: dodgerblue;
  }
`

export default function AdminPage() {
  const navigate = useNavigate()

  const { unverifiedUsers } = useUnverifiedUsers()
  const { passwordResetRequests } = usePasswordResetUsers()

  const verifyUsersButtonContent = (
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

  const resetPasswordButtonContent = (
    <div>
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="eraser" size="m" />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiTitle size="xs">
            <h3 style={{ color: 'dodgerblue' }}>Reset user password</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiText size="s">
        <p>
          <EuiTextColor color="subdued">Manually reset a user&apos;s password.</EuiTextColor>
        </p>
      </EuiText>
    </div>
  )

  const resetPasswordTableButtonContent = (
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
              <EuiAccordion
                id="accordionForm1"
                className="UnverifiedUsersAccordion"
                buttonClassName="UnverifiedUsersAccordion__button"
                buttonContent={verifyUsersButtonContent}
                paddingSize="l"
              >
                <UnverifiedUsersTable unverifiedUsers={unverifiedUsers} />
              </EuiAccordion>
              <StyledEuiHorizontalRule color="dodgerblue" size="half" margin="m" />
              <EuiAccordion
                id="accordionForm2"
                className="PasswordResetAccordion"
                buttonClassName="PasswordResetAccordion__button"
                buttonContent={resetPasswordButtonContent}
                paddingSize="l"
              >
                <PasswordResetForm />
              </EuiAccordion>
              <StyledEuiHorizontalRule color="dodgerblue" size="half" margin="m" />
              <EuiAccordion
                id="accordionForm3"
                className="PasswordResetRequestsAccordion"
                buttonClassName="PasswordResetRequestsAccordion__button"
                buttonContent={resetPasswordTableButtonContent}
                paddingSize="l"
              >
                <PasswordResetRequestsTable passwordResetRequests={passwordResetRequests} />
              </EuiAccordion>
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
