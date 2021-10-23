import React from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from '@elastic/eui'
import styled from 'styled-components'
import LoginForm from '../LoginForm/LoginForm'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from '../StyledComponents/StyledComponents'

export default function LoginPage() {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={1}>
            <StyledEuiPageHeader>
              <LandingTitle>Login</LandingTitle>
            </StyledEuiPageHeader>
          </EuiFlexItem>
          <EuiFlexItem grow={10}>
            <EuiPageContent horizontalPosition="center">
              <EuiPageContentBody>
                <LoginForm />
              </EuiPageContentBody>
            </EuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
