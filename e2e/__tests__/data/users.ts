// merge usersType and updatableUsersType
export const users: Required<MergeObjects<Readonly<usersType>, updatableUsersType>> = {
  // required sync with initial_data for e2e
  admin: {
    username: 'admin',
    email: 'admin@myapp.com',
    password: '12341234',
  },
  // required sync with initial_data for e2e
  manager: {
    username: 'manager',
    email: 'manager@myapp.com',
    password: '12341234',
  },
  // required sync with initial_data for e2e
  verified: {
    username: 'verified',
    email: 'verified@myapp.com',
    password: '12341234',
  },
  // required sync with initial_data for e2e
  unverified: {
    username: 'unverified',
    email: 'unverified@myapp.com',
    password: '12341234',
  },
  // not initially registered
  newUser: {
    username: 'newuser',
    email: 'newuser@myapp.com',
    password: '12341234',
  },
  // not initially registered
  unregisteredUser: {
    username: 'notregistered',
    email: 'notregistered@myapp.com',
    password: 'notregistered',
  },
  badUser: {
    username: 'a',
    email: 'b',
    password: 'c',
  },
  // required sync with initial_data for e2e
  profileTestUser: {
    username: 'thiscanbeupdated',
    email: 'thiscanbeupdated@myapp.com',
    password: 'thiscanbeupdated',
  },
  // required sync with initial_data for e2e
  toBeVerified: {
    username: 'toBeVerified',
    email: 'toBeVerified@myapp.com',
    password: '12341234',
  },
  // required sync with initial_data for e2e
  passwordResetTestUser: {
    username: 'pwdresetuser1',
    email: 'pwdresetuser1@myapp.com',
    password: 'pwdresetuser1',
  },
  // required sync with initial_data for e2e
  passwordResetTestUser2: {
    username: 'pwdresetuser2',
    email: 'pwdresetuser2@myapp.com',
    password: 'pwdresetuser2',
  },
}
