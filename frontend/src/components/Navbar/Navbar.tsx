import React, { Dispatch, useEffect } from 'react'

import {
  EuiAvatar,
  EuiIcon,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiHeaderLinks,
  EuiHeaderLink,
  EuiPopover,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiHorizontalRule,
  htmlIdGenerator,
  EuiButton,
  EuiSpacer,
  EuiButtonEmpty,
  useEuiTour,
  EuiTourState,
  EuiTourStep,
} from '@elastic/eui'
import { Link, useNavigate } from 'react-router-dom'
import loginIcon from 'src/assets/img/loginIcon.svg'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import UserAvatar from '../UserAvatar/UserAvatar'
import CollapsibleNav from './CollapsibleNav/CollapsibleNav'
import GlobalNotifications from 'src/components/Navbar/GlobalNotifications/GlobalNotifications'
import { ThemeSwitcher } from 'src/components/ThemeSwitcher/ThemeSwitcher'
import { useNotificationApi } from 'src/hooks/ui/useNotificationApi'
import arenaDark from 'src/assets/logo/two-white-clouds.svg'
import arenaLight from 'src/assets/logo/two-black-clouds.svg'
import { useTheme } from 'src/themes/useTheme'
import { eagerImportDefault } from 'src/utils/eagerImport'
import { AvatarMenu, StyledEuiHeader, LogoSection } from './Navbar.styles'
import PersonalNotifications from 'src/components/Navbar/PersonalNotifications/PersonalNotifications'

export default function Navbar() {
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState<boolean>(false)
  const navigate = useNavigate()
  const { user, logUserOut, avatarColor } = useAuthenticatedUser()
  const { showTestNotification } = useNotificationApi()
  const { theme } = useTheme()
  const [notify, setNotify] = React.useState<boolean>(false)
  const [logo, setLogo] = React.useState<string>(getLogo(theme))

  useEffect(() => {
    if (user && notify) {
      showTestNotification(user.email)
      setNotify(false)
    }
  }, [user, showTestNotification, notify])

  useEffect(() => {
    setLogo(getLogo(theme))
  }, [theme])

  function getLogo(theme: string) {
    return theme === 'dark' ? arenaDark : arenaLight
  }

  const toggleAvatarMenu = () => setAvatarMenuOpen(!avatarMenuOpen)
  const closeAvatarMenu = () => setAvatarMenuOpen(false)
  const handleLogout = () => {
    closeAvatarMenu()
    logUserOut()
    navigate('/')
  }

  const avatarButton = (
    <EuiHeaderSectionItemButton
      aria-label="User avatar"
      data-test-subj="avatar"
      onClick={() => user?.email && toggleAvatarMenu()}
    >
      {user?.email ? (
        <UserAvatar size="l" user={user} color={avatarColor} initialsLength={2} />
      ) : (
        <Link to="/login">
          <EuiAvatar size="l" color="#1E90FF" name="user" imageUrl={loginIcon} />
        </Link>
      )}
    </EuiHeaderSectionItemButton>
  )

  const renderAvatarMenu = () => {
    if (!user?.email) return null
    return (
      <AvatarMenu>
        <EuiFlexGroup
          gutterSize="xs"
          direction="column"
          alignItems="center"
          justifyContent="center"
          className="avatar-dropdown"
          style={{ alignItems: 'center' }}
        >
          <EuiFlexItem grow style={{ alignItems: 'center', flexGrow: 1 }}>
            <EuiFlexGroup direction="row" alignItems="center">
              <EuiFlexItem grow>
                <UserAvatar size="l" user={user} color={avatarColor} initialsLength={2} />
              </EuiFlexItem>
              <EuiFlexGroup direction="column" alignItems="flexStart" className="avatar-dropdown-user">
                <EuiFlexItem grow>
                  <strong>{user?.username}</strong>
                </EuiFlexItem>
                <EuiFlexItem grow>{user?.email}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiHorizontalRule margin="m" />

          <ThemeSwitcher />

          <EuiHorizontalRule margin="m" />

          <EuiFlexGroup
            direction="row"
            alignItems="center"
            className="avatar-dropdown-actions"
            style={{ alignSelf: 'flex-start' }}
          >
            <EuiFlexItem grow={1}>
              <EuiIcon type="user" size="m" />
            </EuiFlexItem>
            <EuiFlexItem grow={8}>
              <Link to="/profile">Profile</Link>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="s" />

          <EuiFlexGroup
            direction="row"
            alignItems="center"
            className="avatar-dropdown-actions"
            style={{ alignSelf: 'flex-start' }}
          >
            <EuiFlexItem grow={1}>
              <EuiIcon type="push" size="m" />
            </EuiFlexItem>
            <EuiFlexItem grow={3}>
              <a onClick={() => setNotify(true)}>Notification</a>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiHorizontalRule margin="m" />

          <EuiFlexGroup
            direction="row"
            alignItems="center"
            justifyContent="flexStart"
            className="avatar-dropdown-actions"
            style={{ alignSelf: 'flex-start' }}
          >
            <EuiFlexItem grow={1}>
              <EuiIcon type="exit" size="m" />
            </EuiFlexItem>
            <EuiFlexItem grow={8}>
              <EuiLink onClick={handleLogout} color="danger" data-test-subj="logout">
                Log out
              </EuiLink>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </AvatarMenu>
    )
  }

  return (
    <StyledEuiHeader
      sections={[
        {
          items: [
            user?.is_verified ? <CollapsibleNav user={user} /> : null,

            <LogoSection href="/" key={0}>
              <EuiIcon type={logo} size="l" />
            </LogoSection>,

            <EuiHeaderLinks aria-label="app navigation links" key={0}>
              <EuiHeaderLink
                iconType="documentation"
                target="_blank"
                href={import.meta.env.VITE_WIKI_URL}
                data-test-subj="wiki"
              >
                Wiki
              </EuiHeaderLink>
              <EuiHeaderLink
                iconType="help"
                onClick={() => {
                  navigate('/help')
                }}
                className="help-header-link"
              >
                Help
              </EuiHeaderLink>
            </EuiHeaderLinks>,
          ],
          borders: 'right',
        },
        {
          items: [
            user?.is_verified ? <GlobalNotifications user={user} /> : null, // TODO only receiver is user's role
            // user?.is_verified ? <PersonalNotifications user={user} /> : null, // TODO only where receiver is user's email
            user?.is_superuser ? <PersonalNotifications user={user} /> : null, // TODO enable when ready
            <EuiPopover
              id="avatar-menu"
              key={'765'}
              isOpen={avatarMenuOpen}
              closePopover={closeAvatarMenu}
              anchorPosition="downRight"
              button={avatarButton}
              panelPaddingSize="m"
            >
              {renderAvatarMenu()}
            </EuiPopover>,
          ],
        },
      ]}
    ></StyledEuiHeader>
  )
}
