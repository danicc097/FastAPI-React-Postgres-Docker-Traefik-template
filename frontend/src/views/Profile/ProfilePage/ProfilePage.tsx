import { EuiFlexGroup, EuiFlexItem, EuiPageBody, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import React from 'react'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from 'src/components/StyledComponents/StyledComponents'
import UserAvatar from 'src/components/UserAvatar/UserAvatar'
import UserUpdateForm from '../UserUpdateForm'
import PictureUpload from '../PictureUpload'
import ProfileInfo from '../ProfileInfo'
import { StyledEuiPageContent, StyledEuiPageContentBody } from './ProfilePage.styles'

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
                {/* <PictureUpload /> */}
                <UserUpdateForm />
              </StyledEuiPageContentBody>
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
