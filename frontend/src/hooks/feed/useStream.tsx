import moment from 'moment'
import { useEffect, useCallback, useState } from 'react'
import { shallowEqual } from 'react-redux'
import { useToasts } from 'src/hooks/ui/useToasts'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { GlobalNotificationsActionCreators } from 'src/redux/modules/feed/globalNotifications'
import { extractErrorMessages } from 'src/utils/errors'
import { schema } from 'src/types/schemaOverride'
import { useGlobalNotificationsFeed } from 'src/hooks/feed/useGlobalNotificationsFeed'
import apiClient, { simpleApiClient } from 'src/services/apiClient'
import { usePersonalNotificationsFeed } from 'src/hooks/feed/usePersonalNotificationsFeed'
import { PersonalNotificationsActionCreators } from 'src/redux/modules/feed/personalNotifications'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import { formatURL } from 'src/utils/urls'

export function useStream() {
  const dispatch = useAppDispatch()
  const { user } = useAuthenticatedUser()
  const { addToast } = useToasts()
  const [isFetching, setIsFetching] = useState(false)
  const fetchNotificationStream = async () => {
    setIsFetching(true)
    let fetchFailures = 0
    const token = encodeURIComponent(localStorage.getItem('access_token'))
    const analyzeStreamChunk = (chunk: string) => {
      fetchFailures = 0
      if (chunk) {
        console.log('chunk -', chunk)
        try {
          const data = chunk.replace('data: ', '')
          const parsedMsg = JSON.parse(data)
          const hasNewGlobalNotifications = parsedMsg['has_new_global_notifications']?.toLowerCase() === 'true'
          dispatch(GlobalNotificationsActionCreators.setHasNewGlobalNotifications({ hasNewGlobalNotifications }))
          const hasNewPersonalNotifications = parsedMsg['has_new_personal_notifications']?.toLowerCase() === 'true'
          dispatch(PersonalNotificationsActionCreators.setHasNewPersonalNotifications({ hasNewPersonalNotifications }))
        } catch (e) {
          console.log('ignoring stream chunk:', chunk)
        }
      }
    }

    const streamURL = formatURL('/stream/notifications/', {})

    try {
      const res = await fetch(streamURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      processChunkedResponse(res)
    } catch (error) {
      setIsFetching(false)
      onChunkedResponseError(error)
    }

    function onChunkedResponseError(error) {
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

    function processChunkedResponse(res) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      return readChunk()

      function readChunk() {
        return reader.read().then(appendChunks)
      }

      function appendChunks(result) {
        console.log('result', result)
        const chunk = decoder.decode(result.value || new Uint8Array(), { stream: !result.done })
        analyzeStreamChunk(chunk)
        if (result.done) {
          console.log('result.done')
          setIsFetching(false)
          return Promise.resolve(chunk)
        } else {
          return readChunk()
        }
      }
    }
  }

  useEffect(() => {
    const _fetchNotificationStream = async () => {
      await fetchNotificationStream()
    }
    if (user?.is_verified && !isFetching) {
      setTimeout(() => {
        _fetchNotificationStream()
      }, 5000)
    }
  }, [user, isFetching])
}
