import React from 'react'
// centralized user auth, without duplicating logic in every component:
// We remove any references to redux,
// no longer need to connect the component,
// and can simply default export
import {
  EuiAvatar,
  EuiIcon,
  EuiHeader,
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
} from '@elastic/eui'
import { Link, useNavigate } from 'react-router-dom'
import loginIcon from 'src/assets/img/loginIcon.svg'
import styled from 'styled-components'
import { useAuthenticatedUser } from 'src/hooks/auth/useAuthenticatedUser'
import UserAvatar from '../UserAvatar/UserAvatar'
import CollapsibleNav from './CollapsibleNav'
import Notifications from './Notifications'

const LogoSection = styled(EuiHeaderLink)`
  &&& {
    padding: 0 2rem;
  }
`

const StyledEuiHeader = styled(EuiHeader)`
  &&& {
    width: 100%;
    top: 0px;
    z-index: 1000;
    left: 0px;
    right: 0px;
    margin-top: 0px;
    position: fixed; /* cant override theme css else */
    align-items: center; /* AvatarMenu */
  }
`

const AvatarMenu = styled.div`
  & .avatar-dropdown {
    align-items: center; /* EuiFlexItem's */
    padding: 1rem;
  }

  &&& {
    & .avatar-dropdown-user > * {
      margin-bottom: 0.2rem;
      margin-top: 0.2rem;
    }
  }
`

export default function Navbar() {
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState<boolean>(false)
  const navigate = useNavigate()
  const { user, logUserOut } = useAuthenticatedUser()

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
      onClick={() => user?.profile && toggleAvatarMenu()}
    >
      {user?.profile ? (
        <UserAvatar size="l" user={user} initialsLength={2} />
      ) : (
        <Link to="/login">
          <EuiAvatar size="l" color="#1E90FF" name="user" imageUrl={loginIcon} />
        </Link>
      )}
    </EuiHeaderSectionItemButton>
  )

  const renderAvatarMenu = () => {
    if (!user?.profile) return null
    return (
      <AvatarMenu>
        <EuiFlexGroup direction="column" alignItems="center" justifyContent="spaceBetween" className="avatar-dropdown">
          <EuiFlexGroup direction="row" alignItems="center">
            <EuiFlexItem grow={false}>
              <UserAvatar size="l" user={user} initialsLength={2} />
            </EuiFlexItem>
            <EuiFlexGroup direction="column" alignItems="flexStart" className="avatar-dropdown-user">
              <EuiFlexItem>
                <strong>{user.username}</strong>
              </EuiFlexItem>
              <EuiFlexItem>{user.email}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexGroup>

          <EuiHorizontalRule margin="m" />

          <EuiFlexGroup direction="column" alignItems="center" className="avatar-dropdown-actions">
            <EuiFlexItem grow={1}>
              <Link to="/profile">Profile</Link>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiHorizontalRule margin="m" />

          <EuiFlexGroup direction="column" alignItems="center" className="avatar-dropdown-actions">
            <EuiFlexItem grow={2}>
              <EuiLink onClick={() => handleLogout()} color="danger" data-test-subj="logout">
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
            user.is_verified ? <CollapsibleNav key={0} user={user} /> : null,
            ,
            <LogoSection href="/" key={0}>
              <EuiIcon type="training" color="#1E90FF" size="l" /> My App
            </LogoSection>,
            // allow responsive grouping with EuiHeaderLinks
            <EuiHeaderLinks aria-label="app navigation links" key={0}>
              <EuiHeaderLink
                iconType="help"
                onClick={() => {
                  navigate('/help')
                }}
              >
                Help
              </EuiHeaderLink>
            </EuiHeaderLinks>,
          ],
          borders: 'right',
        },
        {
          items: [
            user.is_verified ? <Notifications key={0} /> : null,
            <EuiPopover
              id="avatar-menu"
              key={0}
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
