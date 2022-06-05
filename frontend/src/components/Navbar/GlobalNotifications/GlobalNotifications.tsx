import React, { useState } from 'react'

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
  EuiHeader,
  EuiHeaderAlert,
  EuiHeaderAlertProps,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiLink,
  EuiPortal,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui'
import { useGeneratedHtmlId } from '@elastic/eui'
import { useGlobalNotificationsFeed } from 'src/hooks/feed/useGlobalNotificationsFeed'
import moment from 'moment'
import { motion } from 'framer-motion'
import InfiniteSpinner from 'src/components/Loading/InfiniteSpinner'
import ComponentPermissions from 'src/components/Permissions/ComponentPermissions'
import { schema } from 'src/types/schemaOverride'
import GlobalNotificationsModalForm from 'src/components/Navbar/GlobalNotifications/GlobalNotificationsModalForm'
import { useGlobalNotificationsForm } from 'src/hooks/forms/useGlobalNotificationsForm'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { Center } from './GlobalNotifications.styles'

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
    hasNewGlobalNotifications,
    feedItems: globalNotificationsFeedItems,
    unreadItems: globalNotificationsUnreadItems,
    isLoading,
    errorList: globalNotificationsErrorList,
    fetchFeedItems,
    setHasNewGlobalNotifications,
  } = useGlobalNotificationsFeed()

  const loadMoreNotifications = async () => {
    const lastDateUTC = globalNotificationsFeedItems[globalNotificationsFeedItems?.length - 1]?.event_timestamp
    await fetchFeedItems({ starting_date: new Date(moment.utc(lastDateUTC).format()) })
  }

  const unreadIds = globalNotificationsUnreadItems?.map((global_notification_id) => global_notification_id) || []
  const badgeColors = {
    task: 'lightyellow',
  }

  type AlertProps = EuiHeaderAlertProps & { notificationId: number }

  const globalNotificationsAlerts: Array<AlertProps> = globalNotificationsFeedItems?.map(
    (item: ArrayElement<typeof globalNotificationsFeedItems>) => {
      const { event_timestamp, global_notification_id, title, body, label, link, event_type } = item
      const alertProps = {
        notificationId: global_notification_id,
        title: event_type === 'is_update' ? '[UPDATE] ' + title : title,
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
              {unreadIds.includes(global_notification_id) ? <EuiBadge color="danger">NEW</EuiBadge> : null}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color={badgeColors[label] || 'lightgreen'}>{label}</EuiBadge>
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

  const showFlyout = async () => {
    if (!isFlyoutVisible) {
      await fetchFeedItems({})
      setHasNewGlobalNotifications(false)
    }
    setIsFlyoutVisible(!isFlyoutVisible)
  }

  const globeButtonNotificationColor: any = 'lightgreen'

  const globeButton = (
    <EuiHeaderSectionItemButton
      aria-controls="headerFlyoutNewsFeed"
      aria-expanded={isFlyoutVisible}
      aria-haspopup="true"
      aria-label={'Alerts feed: Updates available'}
      onClick={showFlyout}
      notification={hasNewGlobalNotifications}
      notificationColor={globeButtonNotificationColor}
      data-test-subj="headerGlobalNotificationsButton"
    >
      <EuiIcon type="globe" />
    </EuiHeaderSectionItemButton>
  )

  function renderGlobalNotificationAlerts() {
    return isLoading ? (
      <InfiniteSpinner size="xl" />
    ) : (
      globalNotificationsAlerts?.map((alert: AlertProps, i) => (
        <EuiHeaderAlert
          key={`global-notifications-alert-${alert.notificationId}`}
          data-test-subj={`global-notifications-alert-${alert.notificationId}`}
          title={alert.title}
          action={
            <EuiFlexGroup alignItems="center" gutterSize="xs" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>{alert.action}</EuiFlexItem>
              <ComponentPermissions
                requiredRole="admin"
                user={user}
                element={
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="top" content="Delete Notification" display="block">
                      <EuiButtonIcon
                        iconType="trash"
                        size="xs"
                        color="danger"
                        aria-label="Delete notification"
                        onClick={() => deleteNotification({ id: alert.notificationId })}
                      />
                    </EuiToolTip>
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
    )
  }
  {
    globalNotificationsErrorList?.length !== 0 ? (
      <EuiText>
        <p>{globalNotificationsErrorList}</p>
      </EuiText>
    ) : (
      <EuiText size="s">
        <p>No new notifications</p>
      </EuiText>
    )
  }

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
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="s">
            <h2 className="eui-textInheritColor" id={newsFeedFlyoutTitleId}>
              News
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody data-test-subj="globalNotificationsFlyoutBody">{renderGlobalNotificationAlerts()}</EuiFlyoutBody>

        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButton size="s" fill onClick={async () => await loadMoreNotifications()}>
                Load more
              </EuiButton>
            </EuiFlexItem>
            <ComponentPermissions
              requiredRole="admin"
              element={
                <EuiFlexItem grow={false}>
                  <GlobalNotificationsModalForm closeFlyout={closeFlyout} />
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
      {globeButton}
      {isFlyoutVisible && flyout}
    </>
  )
}
