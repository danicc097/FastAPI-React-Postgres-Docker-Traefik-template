import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import React from 'react'
import styled from 'styled-components'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from 'src/components/StyledComponents/StyledComponents'
import UserAvatar from 'src/components/UserAvatar/UserAvatar'
import UserUpdateForm from '../UserUpdateForm'
import PictureUpload from '../PictureUpload'
import ProfileInfo from '../ProfileInfo'

const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    max-width: 80%;
    /* min-width: 500px ; */
  }
`

const StyledEuiPageContentBody = styled(EuiPageContentBody)`
  &&& {
    display: flex;
    flex-direction: column;
    align-items: center;

    & h2 {
      margin-bottom: 1rem;
    }

    & p {
      margin-bottom: 0.2rem;
    }
  }
`

export default function ProfilePage() {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={1}>
            <StyledEuiPageHeader>
              <LandingTitle>Profile</LandingTitle>
            </StyledEuiPageHeader>
          </EuiFlexItem>
          <EuiFlexItem grow={10}>
            <StyledEuiPageContent horizontalPosition="center">
              <StyledEuiPageContentBody>
                <ProfileInfo />
                <PictureUpload />
                <UserUpdateForm />
              </StyledEuiPageContentBody>
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
