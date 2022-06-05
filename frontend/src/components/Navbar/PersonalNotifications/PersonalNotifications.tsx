import React, { useState } from 'react'

import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeaderAlert,
  EuiHeaderAlertProps,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiLink,
  EuiPanel,
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
import _ from 'lodash'
import { schema } from 'src/types/schemaOverride'
import { Center } from 'src/components/Navbar/GlobalNotifications/GlobalNotifications.styles'
import { usePersonalNotificationsFeed } from 'src/hooks/feed/usePersonalNotificationsFeed'
import { motion } from 'framer-motion'

type PersonalNotificationsProps = {
  user: schema['UserPublic']
}

export default function PersonalNotifications({ user }: PersonalNotificationsProps) {
  const [isPopoverVisible, setIsPopoverVisible] = useState(false)

  const newsFeedPopoverId = useGeneratedHtmlId({ prefix: 'newsFeedPopover' })

  const {
    hasNewPersonalNotifications,
    feedItems: personalNotificationsFeedItems,
    unreadItems: personalNotificationsUnreadItems,
    isLoading,
    errorList: personalNotificationsErrorList,
    fetchFeedItems,
    setHasNewPersonalNotifications,
  } = usePersonalNotificationsFeed()

  const loadMoreNotifications = async () => {
    const lastDateUTC = personalNotificationsFeedItems[personalNotificationsFeedItems?.length - 1]?.event_timestamp
    await fetchFeedItems({ starting_date: new Date(moment.utc(lastDateUTC).format()) })
  }
  const unreadIds = personalNotificationsUnreadItems?.map((personal_notification_id) => personal_notification_id) || []
  const badgeColors = {
    task: 'lightyellow',
  }
  type AlertProps = EuiHeaderAlertProps & { notificationId: number }
  const personalNotificationsAlerts: Array<AlertProps> = personalNotificationsFeedItems?.map(
    (item: ArrayElement<typeof personalNotificationsFeedItems>) => {
      const {
        event_timestamp,
        personal_notification_id,
        sender,
        receiver_email,
        title,
        body,
        label,
        link,
        event_type,
      } = item

      const alertProps = {
        notificationId: personal_notification_id,
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
              <EuiIcon type="clock" size="s" />
              {moment.utc(event_timestamp).local().fromNow()}
            </Center>
          </EuiBadge>
        ),
        badge: (
          <EuiFlexGroup alignItems="center" gutterSize="xs">
            <EuiFlexItem grow={false}>
              {unreadIds.includes(personal_notification_id) ? <EuiBadge color="danger">NEW</EuiBadge> : null}
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

  const closePopover = () => {
    setIsPopoverVisible(false)
  }

  const showPopover = async () => {
    if (!isPopoverVisible) {
      await fetchFeedItems({})
      setHasNewPersonalNotifications(false)
    }
    setIsPopoverVisible(!isPopoverVisible)
  }

  const bellButtonNotificationColor: any = 'orange'

  const bellButton = (
    <EuiHeaderSectionItemButton
      aria-controls="headerPopoverNewsFeed"
      aria-expanded={isPopoverVisible}
      aria-haspopup="true"
      aria-label={"News feed: Updates available'"}
      onClick={showPopover}
      notification={hasNewPersonalNotifications}
      notificationColor={bellButtonNotificationColor}
      data-test-subj="headerPersonalNotificationsButton"
    >
      <motion.div
        animate={{ rotate: hasNewPersonalNotifications ? [0, 45, -45, 25, -25, 0] : 0 }}
        transition={{ duration: 2.5, ...(hasNewPersonalNotifications ? { repeat: Infinity } : {}) }}
      >
        <EuiIcon type="bell" />
      </motion.div>
    </EuiHeaderSectionItemButton>
  )

  function renderPersonalNotificationAlerts() {
    return isLoading ? (
      <InfiniteSpinner size="xl" />
    ) : (
      personalNotificationsAlerts?.map((alert: AlertProps, i) => (
        <EuiHeaderAlert
          key={`personal-notifications-alert-${alert.notificationId}`}
          data-test-subj={`personal-notifications-alert-${alert.notificationId}`}
          title={alert.title}
          action={alert.action}
          text={alert.text}
          date={alert.date}
          badge={alert.badge}
        />
      ))
    )
  }

  const popover = (
    <EuiPopover
      id={newsFeedPopoverId}
      ownFocus
      button={bellButton}
      isOpen={isPopoverVisible}
      closePopover={closePopover}
      panelPaddingSize="s"
    >
      <EuiPopoverTitle paddingSize="s">Personal notifications</EuiPopoverTitle>
      <div className="eui-yScroll" style={{ maxHeight: '40vh', maxWidth: '50vh', overflowY: 'auto', padding: 4 }}>
        <EuiSpacer size="s" />
        {renderPersonalNotificationAlerts()}
      </div>
      {personalNotificationsAlerts?.length === 0 ? (
        <EuiText size="relative">
          <p>No new notifications</p>
        </EuiText>
      ) : (
        <EuiPopoverFooter paddingSize="s">
          <EuiText color="subdued" size="s">
            <EuiButton size="s" fill onClick={loadMoreNotifications}>
              Load more
            </EuiButton>
          </EuiText>
        </EuiPopoverFooter>
      )}
    </EuiPopover>
  )

  return <>{popover}</>
}
