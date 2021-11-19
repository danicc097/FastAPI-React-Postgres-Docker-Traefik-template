import '@elastic/eui/dist/eui_theme_amsterdam_dark.css'
import React, { useState } from 'react'

import {
  EuiBadge,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeaderAlert,
  EuiHeaderAlertProps,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiLink,
  EuiPopover,
  EuiPopoverFooter,
  EuiPopoverTitle,
  EuiSpacer,
  EuiText,
} from '@elastic/eui'
import { useGeneratedHtmlId } from '@elastic/eui'
import { useGlobalNotificationsFeed } from 'src/hooks/feed/useGlobalNotificationsFeed'
import moment from 'moment'
import InfiniteSpinner from 'src/components/Loading/InfiniteSpinner'

export default function PersonalNotifications() {
  const [isPopoverVisible, setIsPopoverVisible] = useState(false)

  const newsFeedPopoverId = useGeneratedHtmlId({ prefix: 'newsFeedPopover' })

  const {
    hasNewNotifications,
    fetchFeedItemsByLastRead,
    feedItems: globalNotificationsFeedItems,
    unreadItems: globalNotificationsUnreadItems,
    isLoading,
    errorList: globalNotificationsErrorList,
    fetchFeedItems,
  } = useGlobalNotificationsFeed()

  const unreadIds = globalNotificationsUnreadItems.map((item) => item.id)

  const globalNotificationsAlerts: Array<EuiHeaderAlertProps> = globalNotificationsFeedItems.map(
    (item: ArrayElement<typeof globalNotificationsFeedItems>) => {
      const {
        row_number,
        event_timestamp,
        id,
        created_at,
        updated_at,
        sender,
        receiver_role,
        title,
        body,
        label,
        link,
        event_type,
      } = item

      const alertProps = {
        title: event_type === 'is_update' ? '[UPDATE]' + title : title,
        text: <EuiText size="m">{body}</EuiText>,
        action: link ? (
          <EuiLink href={link} target="_blank">
            {label}
          </EuiLink>
        ) : null,
        date: moment.utc(event_timestamp).local().fromNow(),
        badge: (
          <EuiFlexGroup alignItems="center" gutterSize="xs">
            <EuiFlexItem grow={false}>
              {unreadIds.includes(id) ? <EuiBadge color="danger">NEW</EuiBadge> : null}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge>{label}</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        ),
      } as EuiHeaderAlertProps

      return alertProps
    },
  )

  const closePopover = () => {
    setIsPopoverVisible(false)
  }

  const showPopover = () => {
    if (!isPopoverVisible) {
      fetchFeedItemsByLastRead()
      fetchFeedItems()
    }
    setIsPopoverVisible(!isPopoverVisible)
  }

  const cheerButtonNotificationColor: any = 'orange' // bad eui typing

  const cheerButton = (
    <EuiHeaderSectionItemButton
      aria-controls="headerPopoverNewsFeed"
      aria-expanded={isPopoverVisible}
      aria-haspopup="true"
      aria-label={"News feed: Updates available'"}
      onClick={showPopover}
      notification={hasNewNotifications}
      notificationColor={cheerButtonNotificationColor}
    >
      <EuiIcon type="calendar" />
    </EuiHeaderSectionItemButton>
  )

  const popover = (
    <EuiPopover
      id={newsFeedPopoverId}
      ownFocus
      button={cheerButton}
      isOpen={isPopoverVisible}
      closePopover={closePopover}
      panelPaddingSize="s"
    >
      <EuiPopoverTitle paddingSize="s">Reminders</EuiPopoverTitle>
      <div style={{ maxHeight: '40vh', overflowY: 'auto', padding: 4 }}>
        <EuiSpacer size="s" />
        {isLoading ? (
          <InfiniteSpinner size="xl" />
        ) : (
          globalNotificationsAlerts.map((alert, i) => (
            <EuiHeaderAlert
              key={`alert-${i}`}
              title={alert.title}
              action={alert.action}
              text={alert.text}
              date={alert.date}
              badge={alert.badge}
            />
          ))
        )}
      </div>
      {globalNotificationsAlerts.length === 0 ? (
        <EuiText size="relative">
          <p>No new notifications</p>
        </EuiText>
      ) : (
        <EuiPopoverFooter paddingSize="s">
          <EuiText color="subdued" size="s">
            <EuiButtonEmpty iconType="refresh" onClick={null} size="m">
              Load more
            </EuiButtonEmpty>
          </EuiText>
        </EuiPopoverFooter>
      )}
    </EuiPopover>
  )

  return <>{popover}</>
}
