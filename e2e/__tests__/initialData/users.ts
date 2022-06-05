import e2eData from './e2e.json'
import { User } from '../types/initialData'

export type Users = {
  [key in keyof typeof e2eData['users']]: User
} & {
  newUser: User
  unregisteredUser: User
  badUser: User
}

export const users: Users = {
  ...(e2eData['users'] as Users),
  newUser: {
    admin: false,
    verified: false,
    role: 'user',
    username: 'newuser',
    email: 'newuser@myapp.com',
    password: '12341234',
  },
  unregisteredUser: {
    admin: false,
    verified: false,
    role: 'user',
    username: 'notregistered',
    email: 'notregistered@myapp.com',
    password: 'notregistered',
  },
  badUser: {
    admin: false,
    verified: false,
    role: 'user',
    username: 'a',
    email: 'b',
    password: 'c',
  },
}

// export type UpdatableUser = Pick<
//   Users,
//   'profileTestUser' | 'toBeVerified' | 'passwordResetTestUser0' | 'passwordResetTestUser1'
// >
