import ReactDOM from 'react-dom'
import '@elastic/eui/dist/eui_theme_amsterdam_dark.css'
import React, { useEffect, useState } from 'react'

import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiHeaderAlert,
  EuiHeaderAlertProps,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiLink,
  EuiLoadingSpinner,
  EuiPortal,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useGeneratedHtmlId } from '@elastic/eui'
import { useGlobalNotificationsFeed } from 'src/hooks/feed/useGlobalNotificationsFeed'
import moment from 'moment'
import { motion } from 'framer-motion'
import InfiniteSpinner from 'src/components/Loading/InfiniteSpinner'
import styled from 'styled-components'

const Center = styled.div`
  align-self: center;
  & > * {
    margin-inline-end: 0.2rem;
  }
`

export default function Notifications() {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)
  const newsFeedFlyoutId = useGeneratedHtmlId({ prefix: 'newsFeedFlyout' })
  const newsFeedFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'newsFeedFlyoutTitle',
  })

  const {
    hasNewNotifications,
    fetchFeedItemsByLastRead,
    globalNotificationsFeedItems,
    globalNotificationsUnreadItems,
    isLoading,
    error,
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
        text: <EuiText size="s">{body}</EuiText>,
        action: link ? (
          <EuiLink href={link} target="_blank">
            {label}
          </EuiLink>
        ) : null,
        date: (
          <EuiBadge color="lightblue">
            <Center>
              <EuiIcon type="clock" size="m" />
              {/* TODO user timezones */}
              {moment(created_at).fromNow()}
            </Center>
          </EuiBadge>
        ),
        badge: (
          <EuiFlexGroup alignItems="center" gutterSize="xs">
            <EuiFlexItem grow={false}>
              {unreadIds.includes(id) ? <EuiBadge color="danger">NEW</EuiBadge> : null}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="lightgreen">{label}</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        ),
      } as EuiHeaderAlertProps

      return alertProps
    },
  )

  const closeFlyout = () => {
    setIsFlyoutVisible(false)
  }

  const showFlyout = () => {
    if (!isFlyoutVisible) {
      fetchFeedItemsByLastRead()
      fetchFeedItems()
    }
    setIsFlyoutVisible(!isFlyoutVisible)
  }

  const bellButtonNotificationColor: any = 'lightgreen' // bad eui typing

  const bellIconMotion = (
    <motion.div
      animate={{ rotate: hasNewNotifications ? [0, 45, -45, 25, -25, 0] : 0 }}
      transition={{ duration: 2.5, ...(hasNewNotifications ? { repeat: Infinity } : {}) }}
    >
      <EuiIcon type="bell" />
    </motion.div>
  )

  const bellButton = (
    <EuiHeaderSectionItemButton
      aria-controls="headerFlyoutNewsFeed"
      aria-expanded={isFlyoutVisible}
      aria-haspopup="true"
      aria-label={'Alerts feed: Updates available'}
      onClick={() => showFlyout()}
      notification={hasNewNotifications}
      notificationColor={bellButtonNotificationColor}
    >
      {bellIconMotion}
    </EuiHeaderSectionItemButton>
  )

  const flyout = (
    <EuiPortal>
      <EuiFlyout
        onClose={closeFlyout}
        size="s"
        id={newsFeedFlyoutId}
        aria-labelledby={newsFeedFlyoutTitleId}
        paddingSize="m"
      >
        {/* HEADER */}
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="s">
            <h2 id={newsFeedFlyoutTitleId}>News</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        {/* BODY */}
        <EuiFlyoutBody>
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
          {globalNotificationsAlerts.length === 0 ? (
            <EuiText size="s">
              <p>No new notifications</p>
            </EuiText>
          ) : null}
        </EuiFlyoutBody>

        {/* FOOTER */}
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="cross" onClick={closeFlyout} flush="left">
                Close
              </EuiButtonEmpty>
            </EuiFlexItem>
            {globalNotificationsAlerts.length === 0 ?? (
              <EuiFlexItem grow={false}>
                <EuiText color="subdued" size="s">
                  <EuiButton size="s" fill>
                    Load more
                  </EuiButton>
                </EuiText>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </EuiPortal>
  )

  return (
    <>
      {bellButton}
      {isFlyoutVisible && flyout}
    </>
  )
}
