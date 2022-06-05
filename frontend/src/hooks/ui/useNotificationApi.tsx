import { createAvatarImageDataUrl } from 'src/utils/files'

export const useNotificationApi = () => {
  const showTestNotification = (email: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Hello world!', {
        body: 'Push notification.\n\nUse this to test the notification system.',
        // image: './notification_icon.png',
        icon: createAvatarImageDataUrl(email),
        data: {
          test: 'test',
        },
      })
    }
  }
  return {
    showTestNotification,
  }
}
