import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useToasts } from 'src/hooks/ui/useToasts'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { GlobalNotificationsActionCreators } from 'src/redux/modules/feed/globalNotifications'
import { extractErrorMessages } from 'src/utils/errors'
import { schema } from 'src/types/schemaOverride'
import { useGlobalNotificationsFeed } from 'src/hooks/feed/useGlobalNotificationsFeed'
import { PersonalNotificationsActionCreators } from 'src/redux/modules/feed/personalNotifications'
import { usePersonalNotificationsFeed } from 'src/hooks/feed/usePersonalNotificationsFeed'

// deprecated in favor of streams
export function useSSE() {
  // TODO microsoft's better SSE fetch api: https://github.com/Azure/fetch-event-source
  // (typescript)
  //   You can use any request method/headers/body, plus all the other functionality exposed by fetch(). You can even provide an alternate fetch()
  // implementation, if the default browser implementation doesn't work for you.
  // You have access to the response object if you want to do some custom validation/processing before parsing the event source.
  // This is useful in case you have API gateways (like nginx) in front of your application server:
  // if the gateway returns an error, you might want to handle it correctly.
  // If the connection gets cut or an error occurs, you have full control over the retry strategy.

  const dispatch = useAppDispatch()
  const { addToast } = useToasts()
  const { hasNewGlobalNotifications } = useGlobalNotificationsFeed()
  const { hasNewPersonalNotifications } = usePersonalNotificationsFeed()
  const SseWithEventSource = () => {
    let fetchFailures = 0
    const token = encodeURIComponent(localStorage.getItem('access_token'))
    const sse = new EventSource(`${import.meta.env.VITE_BACKEND_API}/sse/notifications-stream?token=${token}`, {
      withCredentials: true,
    })
    const getRealtimeData = (msg: MessageEvent<any>) => {
      fetchFailures = 0
      if (msg) {
        console.log(`data: ${msg.data}`)
        const hasNewGlobalNotifications = JSON.parse(msg.data)['has_new_global_notifications']?.toLowerCase() === 'true'
        dispatch(GlobalNotificationsActionCreators.setHasNewGlobalNotifications({ hasNewGlobalNotifications }))
        const hasNewPersonalNotifications =
          JSON.parse(msg.data)['has_new_personal_notifications']?.toLowerCase() === 'true'
        dispatch(PersonalNotificationsActionCreators.setHasNewPersonalNotifications({ hasNewPersonalNotifications }))
      }
    }

    sse.onmessage = (msg) => getRealtimeData(msg)
    sse.onerror = (error) => {
      fetchFailures += 1
      console.log('onerror', error)
      if (fetchFailures > 4) {
        addToast({
          id: 'global-notifications-fetch-error',
          title: 'Error fetching notifications',
          color: 'warning',
          iconType: 'alert',
          toastLifeTimeMs: 10000,
          text: 'Connection lost. Ensure you are connected to the intranet.',
        })
      }
    }
    return () => {
      sse.close()
    }
  }

  useEffect(() => {
    const _SseWithEventSource = async () => {
      await SseWithEventSource()
    }
    _SseWithEventSource()
  }, [])
}
