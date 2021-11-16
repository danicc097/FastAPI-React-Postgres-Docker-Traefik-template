import ReactDOM from 'react-dom'
import '@elastic/eui/dist/eui_theme_amsterdam_dark.css'
import React, { useState } from 'react'

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
  EuiHeader,
  EuiHeaderAlert,
  EuiHeaderAlertProps,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
  EuiLink,
  EuiPopover,
  EuiPopoverFooter,
  EuiPopoverTitle,
  EuiPortal,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useGeneratedHtmlId } from '@elastic/eui'
import { useGlobalNotificationsFeed } from 'src/hooks/feed/useGlobalNotificationsFeed'
import moment from 'moment'

export default function Notifications() {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false)
  const [isPopoverVisible, setIsPopoverVisible] = useState(false)
  const newsFeedFlyoutId = useGeneratedHtmlId({ prefix: 'newsFeedFlyout' })
  const newsFeedFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'newsFeedFlyoutTitle',
  })
  const newsFeedPopoverId = useGeneratedHtmlId({ prefix: 'newsFeedPopover' })

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
        text: body,
        action: link ? (
          <EuiLink href={link} target="_blank">
            {label}
          </EuiLink>
        ) : null,
        // pretty format date with elastic ui helper
        date: moment(event_timestamp).fromNow(),
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

  const alerts: Array<EuiHeaderAlertProps> = [
    {
      title: 'Control access to features',
      text: 'Show or hide applications and features per space in Kibana.',
      action: <EuiLink href="">Learn about feature controls</EuiLink>,
      date: '1 May 2019',
      badge: <EuiBadge>7.1</EuiBadge>,
    },
    {
      title: 'Kibana 7.0 is turning heads',
      text: 'Simplified navigation, responsive dashboards, dark mode… pick your favorite.',
      action: (
        <EuiLink target="_blank" external href="https://www.elastic.co/blog/kibana-7-0-0-released">
          Read the blog
        </EuiLink>
      ),
      date: '10 April 2019',
      badge: <EuiBadge color="hollow">7.0</EuiBadge>,
    },
    {
      title: 'Enter dark mode',
      text: 'Kibana now supports the easy-on-the-eyes theme across the entire UI.',
      action: <EuiLink href="">Go to Advanced Settings</EuiLink>,
      date: '10 April 2019',
      badge: <EuiBadge color="hollow">7.0</EuiBadge>,
    },
    {
      title: 'Pixel-perfect Canvas is production ready',
      text: 'Your creative space for visualizing data awaits.',
      action: (
        <EuiLink
          target="_blank"
          external
          href="https://www.elastic.co/webinars/intro-to-canvas-a-new-way-to-tell-visual-stories-in-kibana"
        >
          Watch the webinar
        </EuiLink>
      ),
      date: '26 March 2019',
      badge: <EuiBadge color="hollow">6.7</EuiBadge>,
    },
    {
      title: '6.7 release notes',
      text: 'Stay up-to-date on the latest and greatest features.',
      action: (
        <EuiLink target="_blank" external href="https://www.elastic.co/guide/en/kibana/6.7/release-notes-6.7.0.html">
          Check out the docs
        </EuiLink>
      ),
      date: '26 March 2019',
      badge: <EuiBadge color="hollow">6.7</EuiBadge>,
    },
    {
      title: 'Rollups made simple in Kibana',
      text: 'Save space and preserve the integrity of your data directly in the UI.',
      action: (
        <EuiLink
          target="_blank"
          external
          href="https://www.elastic.co/blog/how-to-create-manage-and-visualize-elasticsearch-rollup-data-in-kibana"
        >
          Read the blog
        </EuiLink>
      ),
      date: '10 January 2019',
      badge: <EuiBadge color="hollow">6.5</EuiBadge>,
    },
  ]

  const closeFlyout = () => {
    setIsFlyoutVisible(false)
  }

  const closePopover = () => {
    setIsPopoverVisible(false)
  }

  const showFlyout = () => {
    if (!isFlyoutVisible) {
      fetchFeedItemsByLastRead()
      fetchFeedItems()
    }
    setIsFlyoutVisible(!isFlyoutVisible)
  }

  const showPopover = () => {
    if (!isPopoverVisible) {
      fetchFeedItemsByLastRead()
      fetchFeedItems()
    }
    setIsPopoverVisible(!isPopoverVisible)
  }

  const bellButtonNotificationColor: any = 'lightgreen' // bad eui typing
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
      <EuiIcon type="bell" />
    </EuiHeaderSectionItemButton>
  )
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

  const flyout = (
    <EuiPortal>
      <EuiFlyout onClose={closeFlyout} size="s" id={newsFeedFlyoutId} aria-labelledby={newsFeedFlyoutTitleId}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="s">
            <h2 id={newsFeedFlyoutTitleId}>News</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {globalNotificationsAlerts.map((alert, i) => (
            <EuiHeaderAlert
              key={`alert-${i}`}
              title={alert.title}
              action={alert.action}
              text={alert.text}
              date={alert.date}
              badge={alert.badge}
            />
          ))}
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="cross" onClick={closeFlyout} flush="left">
                Close
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" size="s">
                <EuiButton size="s" fill>
                  Load more
                </EuiButton>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </EuiPortal>
  )

  const popover = (
    <EuiPopover
      id={newsFeedPopoverId}
      ownFocus
      repositionOnScroll
      button={cheerButton}
      isOpen={isPopoverVisible}
      closePopover={closePopover}
      panelPaddingSize="none"
    >
      <EuiPopoverTitle paddingSize="s">Reminders</EuiPopoverTitle>
      <div style={{ maxHeight: '40vh', overflowY: 'auto', padding: 4 }}>
        <EuiSpacer size="s" />
        {globalNotificationsAlerts.map((alert, i) => (
          <EuiHeaderAlert
            key={`alert-${i}`}
            title={alert.title}
            action={alert.action}
            text={alert.text}
            date={alert.date}
            badge={alert.badge}
          />
        ))}
      </div>
      <EuiPopoverFooter paddingSize="s">
        <EuiText color="subdued" size="s">
          <EuiButtonEmpty iconType="refresh" onClick={null} size="m">
            Load more
          </EuiButtonEmpty>
        </EuiText>
      </EuiPopoverFooter>
    </EuiPopover>
  )

  return (
    <>
      {bellButton}
      {popover}
      {isFlyoutVisible && flyout}
    </>
  )
}
