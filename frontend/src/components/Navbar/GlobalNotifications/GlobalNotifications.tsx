import '@elastic/eui/dist/eui_theme_amsterdam_dark.css'
import React, { useEffect, useState } from 'react'

import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
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
import ComponentPermissions from 'src/components/Permissions/ComponentPermissions'
import { schema } from 'src/types/schema_override'
import GlobalNotificationsModalForm from 'src/components/Navbar/GlobalNotifications/GlobalNotificationsModalForm'
import { useGlobalNotificationsForm } from 'src/hooks/forms/useGlobalNotificationsForm'
import { Link } from 'react-router-dom'
import _ from 'lodash'

const Center = styled.div`
  align-self: center;
  & > * {
    margin-inline-end: 0.2rem;
  }
`

type GlobalNotificationsProps = {
  user: schema['UserPublic']
}
export default function GlobalNotifications({ user }: GlobalNotificationsProps) {
  const { deleteNotification } = useGlobalNotificationsForm()

  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)
  const newsFeedFlyoutId = useGeneratedHtmlId({ prefix: 'newsFeedFlyout' })
  const newsFeedFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'newsFeedFlyoutTitle',
  })

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

  type AlertProps = EuiHeaderAlertProps & { notificationId: number }

  const globalNotificationsAlerts: Array<AlertProps> = globalNotificationsFeedItems.map(
    (item: ArrayElement<typeof globalNotificationsFeedItems>) => {
      const { event_timestamp, id, title, body, label, link, event_type } = item

      const alertProps = {
        notificationId: id,
        title: event_type === 'is_update' ? '[UPDATE]' + title : title,
        text: <EuiText size="s">{body}</EuiText>,
        action: link ? (
          <EuiLink href={link} target="_blank">
            <EuiButtonEmpty size="s" color="primary">
              {_.truncate(link, { length: 30 })}
            </EuiButtonEmpty>
          </EuiLink>
        ) : null,
        date: (
          <EuiBadge color="lightblue">
            <Center>
              <EuiIcon type="clock" size="m" />
              {moment.utc(event_timestamp).local().fromNow()}
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
      } as AlertProps

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
        maxWidth={500}
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
            globalNotificationsAlerts.map((alert: AlertProps, i) => (
              <EuiHeaderAlert
                key={`alert-${i}`}
                title={alert.title}
                action={
                  <EuiFlexGroup alignItems="center" gutterSize="xs" justifyContent="spaceBetween">
                    <EuiFlexItem grow={false}>{alert.action}</EuiFlexItem>
                    <ComponentPermissions
                      requiredRole="admin"
                      user={user}
                      element={
                        <EuiFlexItem grow={false}>
                          <EuiButtonIcon
                            iconType="trash"
                            size="xs"
                            color="danger"
                            aria-label="Delete notification"
                            onClick={() => deleteNotification({ id: alert.notificationId })}
                          />
                        </EuiFlexItem>
                      }
                    ></ComponentPermissions>
                  </EuiFlexGroup>
                }
                text={alert.text}
                date={alert.date}
                badge={alert.badge}
              />
            ))
          )}
          {globalNotificationsErrorList.length !== 0 ? (
            <EuiText>
              <p>{globalNotificationsErrorList}</p>
            </EuiText>
          ) : globalNotificationsAlerts.length === 0 ? (
            <EuiText size="s">
              <p>No new notifications</p>
            </EuiText>
          ) : null}
        </EuiFlyoutBody>

        {/* FOOTER */}
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButton size="s" fill>
                Load more
              </EuiButton>
            </EuiFlexItem>
            <ComponentPermissions
              requiredRole={'admin'}
              element={
                <EuiFlexItem grow={false}>
                  <GlobalNotificationsModalForm />
                </EuiFlexItem>
              }
              user={user}
            />
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
