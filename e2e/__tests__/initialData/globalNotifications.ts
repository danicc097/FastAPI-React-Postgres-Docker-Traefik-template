import e2eData from './e2e.json'
import { schema } from '../types/schemaOverride'

export type GlobalNotifications = {
  [key in keyof typeof e2eData['global_notifications']]: schema['CreateGlobalNotificationParams']
}

export const globalNotifications: GlobalNotifications = {
  ...(e2eData['global_notifications'] as GlobalNotifications),
}
