import { EuiHorizontalRule, EuiIcon, EuiSpacer, EuiTitle } from '@elastic/eui'
import moment from 'moment'
import React from 'react'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import UserAvatar from 'src/components/UserAvatar/UserAvatar'
import { StyledEuiText } from './ProfileInfo.styles'

export default function ProfileInfo() {
  const { user, avatarColor } = useAuthenticatedUser()

  return (
    <>
      <UserAvatar size="xl" user={user} initialsLength={2} color={avatarColor} />
      <EuiTitle className="eui-textInheritColor" size="l">
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
          <EuiIcon type="user" /> {user.full_name ?? 'Full name not specified'}
        </p>
        <EuiHorizontalRule margin="xs" />
        <p>
          <EuiIcon type="number" /> {user.phone_number ?? 'No phone number added'}
        </p>
        <EuiHorizontalRule margin="xs" />
        <p>
          <EuiIcon type="quote" /> {user.bio ?? "This user hasn't written a bio yet"}
        </p>
        <EuiHorizontalRule margin="xs" />
        <EuiSpacer size="m" />
      </StyledEuiText>
    </>
  )
}
