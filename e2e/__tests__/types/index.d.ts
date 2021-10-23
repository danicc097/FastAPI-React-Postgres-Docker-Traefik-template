declare type userType = 'admin' | 'verified' | 'unverified' | 'newUser' | 'unregisteredUser' | 'badUser'

declare type updatableUserType = 'profileTestUser' | 'toBeVerified' | 'passwordResetTestUser' | 'passwordResetTestUser2'

declare type usersType = {
  [key in userType]: {
    username: string
    email: string
    password: string
  }
}

declare type updatableUsersType = {
  [key in updatableUserType]: {
    username: string
    email: string
    password: string
  }
}
