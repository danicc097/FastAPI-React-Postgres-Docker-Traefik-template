import { globalNotifications } from '../initialData/globalNotifications'
import { users } from '../initialData/users'
import profilePo from '../pages/profile.po'
import { schema } from '../types/schemaOverride'

jest.retryTimes(3)

beforeEach(async () => {
  await profilePo.login('admin', true)
})

describe('Test global notifications', () => {
  it('should let us see notifications', async () => {
    const notification = await profilePo.viewGlobalNotificationData(1)
    expect(Object.keys(notification)).toEqual(
      expect.arrayContaining(['label', 'title', 'body', 'link'] as Array<
        keyof schema['CreateGlobalNotificationParams']
      >),
    )
  })
})

describe('Test personal notifications', () => {
  it('should let us see notifications', async () => {
    const notification = await profilePo.viewPersonalNotificationData(1)
    expect(Object.keys(notification)).toEqual(
      expect.arrayContaining(['label', 'title', 'body', 'link'] as Array<
        keyof schema['CreatePersonalNotificationParams']
      >),
    )
  })
})
