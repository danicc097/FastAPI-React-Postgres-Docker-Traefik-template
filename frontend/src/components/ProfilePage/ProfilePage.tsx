import {
  EuiButton,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormHelpText,
  EuiHorizontalRule,
  EuiIcon,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import moment from 'moment'
import React, { Fragment, useRef, useState } from 'react'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import styled from 'styled-components'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from '../StyledComponents/StyledComponents'
import UserAvatar from '../UserAvatar/UserAvatar'
import UserUpdateAccordion from './UserUpdateAccordion'

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

const StyledEuiText = styled(EuiText)`
  &&& {
    align-self: center;
    & p {
      /* override amsterdam theme css (check devtool styles for exact source) */
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-content: center;
      align-items: center;
    }

    & p > * {
      margin-right: 0.5rem;
    }
  }
`

export default function ProfilePage() {
  const { user } = useAuthenticatedUser()

  const [files, setFiles] = useState<GenObjType<any>>({})
  const filePickerRef: any = useRef()

  const onChange = (files) => {
    setFiles(files.length > 0 ? files : {})
  }

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
                <UserAvatar size="xl" user={user} initialsLength={2} color={'#DFE5EF'} />

                <EuiTitle size="l">
                  <h2>@{user.username}</h2>
                </EuiTitle>
                <StyledEuiText>
                  <p>
                    <EuiIcon type="email" /> {user.email}
                  </p>
                  <EuiHorizontalRule margin="xs" />
                  <p>
                    <EuiIcon type="clock" /> Member since {moment(user.created_at).format('DD-MM-YYYY')}
                  </p>
                  <EuiHorizontalRule margin="xs" />
                  <p>
                    <EuiIcon type="user" /> {user.profile.full_name ?? 'Full name not specified'}
                  </p>
                  <EuiHorizontalRule margin="xs" />
                  <p>
                    <EuiIcon type="number" /> {user.profile.phone_number ?? 'No phone number added'}
                  </p>
                  <EuiHorizontalRule margin="xs" />
                  <p>
                    <EuiIcon type="quote" /> {user.profile.bio ?? "This user hasn't written a bio yet"}
                  </p>
                  <EuiHorizontalRule margin="xs" />
                  <EuiSpacer size="m" />
                </StyledEuiText>
                <EuiFlexGroup direction="column">
                  <EuiFlexItem>
                    <EuiFormHelpText>Upload a profile picture</EuiFormHelpText>
                  </EuiFlexItem>
                  <Fragment>
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem grow={false}>
                        <EuiFilePicker
                          ref={filePickerRef}
                          id="programmatic"
                          multiple
                          initialPromptText="Select or drag and drop multiple files"
                          onChange={onChange}
                          display="default"
                          aria-label="Use aria labels when no actual label is in use"
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButton
                          color="danger"
                          iconType="trash"
                          disabled={files.length > 0 ? false : true}
                          onClick={() => filePickerRef.current.removeFiles()}
                        >
                          <h3>Remove files</h3>
                        </EuiButton>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </Fragment>
                </EuiFlexGroup>
                <UserUpdateAccordion />
              </StyledEuiPageContentBody>
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
