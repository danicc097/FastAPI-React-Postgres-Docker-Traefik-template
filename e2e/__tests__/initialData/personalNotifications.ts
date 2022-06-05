import e2eData from './e2e.json'
import { schema } from '../types/schemaOverride'

export type PersonalNotifications = {
  [key in keyof typeof e2eData['personal_notifications']]: schema['CreatePersonalNotificationParams']
}

export const personalNotifications: PersonalNotifications = {
  ...(e2eData['personal_notifications'] as PersonalNotifications),
}
