import React from 'react'
import { EuiAvatar } from '@elastic/eui'
import { getAvatarName } from 'src/utils/format'
import { schema } from 'src/types/schema_override'

export type UserAvatarPropTypes = {
  user: schema['UserPublic']
  size?: typeof EuiAvatar.defaultProps.size
  initialsLength?: typeof EuiAvatar.defaultProps.initialsLength
  type?: typeof EuiAvatar.defaultProps.type
  color?: string
}

export default function UserAvatar({
  user,
  size = 'l',
  initialsLength = 2,
  type = 'user',
  color = '#eee',
}: UserAvatarPropTypes) {
  const imageUrl = user?.profile?.image
  const EuiAvatarProps = {
    size: size,
    name: getAvatarName({ user }),
    // imageUrl: imageUrl,
    // initialsLength: imageUrl ? null : initialsLength,
    type: type,
    color: color,
    ...(imageUrl ? { imageUrl } : { initialsLength }), // either initials are passed as prop, or an image.
  }

  return <EuiAvatar {...EuiAvatarProps} />
}
