import React from 'react'
import { EuiAvatar, EuiAvatarProps } from '@elastic/eui'
import { getAvatarName } from 'src/utils/format'
import { schema } from 'src/types/schemaOverride'

export type UserAvatarProps = {
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
}: UserAvatarProps) {
  const imageUrl = user?.image
  const EuiAvatarProps: EuiAvatarProps = {
    size: size,
    name: getAvatarName({ user }),
    style: {
      fontWeight: 'bold',
    },
    type: type,
    color: color,
    ...(imageUrl ? { imageUrl } : { initialsLength }),
  }

  return <EuiAvatar {...EuiAvatarProps} />
}
