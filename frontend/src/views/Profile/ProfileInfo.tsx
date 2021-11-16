import { EuiHorizontalRule, EuiIcon, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import moment from 'moment'
import React from 'react'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import styled from 'styled-components'
import UserAvatar from 'src/components/UserAvatar/UserAvatar'

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

export default function ProfileInfo() {
  const { user } = useAuthenticatedUser()

  return (
    <>
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
    </>
  )
}
