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
import RegistrationForm from '../RegistrationForm/RegistrationForm'
import React from 'react'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from 'src/components/StyledComponents/StyledComponents'

export default function RegistrationPage() {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={1}>
            <StyledEuiPageHeader>
              <LandingTitle>Sign Up</LandingTitle>
            </StyledEuiPageHeader>
          </EuiFlexItem>
          <EuiFlexItem grow={10}>
            <EuiPageContent horizontalPosition="center">
              <EuiPageContentBody>
                <RegistrationForm />
              </EuiPageContentBody>
            </EuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
