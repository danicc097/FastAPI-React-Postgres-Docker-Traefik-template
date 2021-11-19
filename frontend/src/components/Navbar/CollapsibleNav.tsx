import React, { useState } from 'react'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'

import {
  EuiCollapsibleNav,
  EuiCollapsibleNavGroup,
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiHeader,
  EuiIcon,
  EuiButton,
  EuiButtonEmpty,
  EuiPageTemplate,
  EuiPinnableListGroup,
  EuiPinnableListGroupItemProps,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiImage,
  EuiListGroup,
  useGeneratedHtmlId,
} from '@elastic/eui'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { schema } from 'src/types/schema_override'

const StyledEuiCollapsibleNav = styled(EuiCollapsibleNav)`
  &&& {
    /* push collapsible nav down */
    margin-top: ${(props) => props.theme.euiHeaderHeight};
    /* and then bring hidden items below up */
    padding-bottom: ${(props) => props.theme.euiHeaderHeight};
  }
`

type CollapsibleNavProps = {
  user: schema['UserPublic']
}

const CollapsibleNav = ({ user }: CollapsibleNavProps) => {
  const navigate = useNavigate()

  const TopLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: 'Home',
      iconType: 'home',
      isActive: true,
      'aria-current': true,
      onClick: () => {
        null
      },
      pinnable: false,
    },
  ]

  const LearnLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: 'Docs',
      onClick: () => {
        null
      },
    },
    {
      label: 'Blogs',
      onClick: () => {
        null
      },
    },
    {
      label: 'Webinars',
      onClick: () => {
        null
      },
    },
    { label: 'Elastic.co', href: 'https://elastic.co' },
  ]

  const SkillsLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: 'Knowledge levels',
      onClick: () => {
        null
      },
    },
    {
      label: 'Knowledge map',
      onClick: () => {
        null
      },
    },
    {
      label: 'Progress',
      onClick: () => {
        null
      },
    },
  ]

  const AdminLinks: EuiPinnableListGroupItemProps[] = [
    {
      label: 'User verification',
      onClick: () => {
        navigate('/admin/unverified-users')
      },
    },
    {
      label: 'User password reset',
      onClick: () => {
        navigate('/admin/password-reset')
      },
    },
    {
      label: 'User password reset requests',
      onClick: () => {
        navigate('/admin/password-reset-requests')
      },
    },
  ]

  const [navIsOpen, setNavIsOpen] = useState<boolean>(
    JSON.parse(String(localStorage.getItem('euiCollapsibleNavExample--isOpen'))) || false,
  )
  const [navIsDocked, setNavIsDocked] = useState<boolean>(
    JSON.parse(String(localStorage.getItem('euiCollapsibleNavExample--isDocked'))) || false,
  )
  /**
   * Accordion toggling
   */
  const [openGroups, setOpenGroups] = useState(
    JSON.parse(String(localStorage.getItem('openNavGroups'))) || ['Learn', 'Skills', 'Admin'],
  )

  // Save which groups are open and which are not with state and local store
  const toggleAccordion = (isOpen: boolean, title?: string) => {
    if (!title) return
    const itExists = openGroups.includes(title)
    if (isOpen) {
      if (itExists) return
      openGroups.push(title)
    } else {
      const index = openGroups.indexOf(title)
      if (index > -1) {
        openGroups.splice(index, 1)
      }
    }
    setOpenGroups([...openGroups])
    localStorage.setItem('openNavGroups', JSON.stringify(openGroups))
  }

  /**
   * Pinning
   */
  const [pinnedItems, setPinnedItems] = useState<EuiPinnableListGroupItemProps[]>(
    JSON.parse(String(localStorage.getItem('pinnedItems'))) || [],
  )

  const addPin = (item: any) => {
    if (!item || find(pinnedItems, { label: item.label })) {
      return
    }
    item.pinned = true
    const newPinnedItems = pinnedItems ? pinnedItems.concat(item) : [item]
    setPinnedItems(newPinnedItems)
    localStorage.setItem('pinnedItems', JSON.stringify(newPinnedItems))
  }

  const removePin = (item: any) => {
    const pinIndex = findIndex(pinnedItems, { label: item.label })
    if (pinIndex > -1) {
      item.pinned = false
      const newPinnedItems = pinnedItems
      newPinnedItems.splice(pinIndex, 1)
      setPinnedItems([...newPinnedItems])
      localStorage.setItem('pinnedItems', JSON.stringify(newPinnedItems))
    }
  }

  /**
   * Show links in navbar group according to state
   */
  function alterLinksWithCurrentState(
    links: EuiPinnableListGroupItemProps[],
    showPinned = false,
  ): EuiPinnableListGroupItemProps[] {
    return links.map((link) => {
      const { pinned, ...rest } = link
      return {
        pinned: showPinned ? pinned : false,
        ...rest,
      }
    })
  }

  function addLinkNameToPinTitle(listItem: EuiPinnableListGroupItemProps) {
    return `Pin ${listItem.label} to top`
  }

  function addLinkNameToUnpinTitle(listItem: EuiPinnableListGroupItemProps) {
    return `Unpin ${listItem.label}`
  }

  const collapsibleNavId = useGeneratedHtmlId({ prefix: 'collapsibleNav' })

  return (
    <StyledEuiCollapsibleNav
      id={collapsibleNavId}
      aria-label="Main navigation"
      isOpen={navIsOpen}
      isDocked={navIsDocked}
      button={
        <EuiHeaderSectionItemButton
          aria-label="Toggle main navigation"
          onClick={() => {
            setNavIsOpen(!navIsOpen)
            localStorage.setItem('euiCollapsibleNavExample--isOpen', JSON.stringify(!navIsOpen))
          }}
        >
          <EuiIcon type={'menu'} size="m" aria-hidden="true" />
        </EuiHeaderSectionItemButton>
      }
      paddingSize="none"
      onClose={() => {
        setNavIsOpen(false)
        localStorage.setItem('euiCollapsibleNavExample--isOpen', JSON.stringify(false))
      }}
      maskProps={{ headerZindexLocation: 'below' }} /* optional */
    >
      {/* Shaded pinned section always with a home item */}
      <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
        <EuiCollapsibleNavGroup background="light" style={{ maxHeight: '40vh' }}>
          <EuiPinnableListGroup
            aria-label="Pinned links" // A11y : Since this group doesn't have a visible `title` it should be provided an accessible description
            listItems={alterLinksWithCurrentState(TopLinks).concat(alterLinksWithCurrentState(pinnedItems, true))}
            unpinTitle={addLinkNameToUnpinTitle}
            onPinClick={removePin}
            maxWidth="none"
            color="text"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>

      {/* Dark deployments section */}
      <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
        <EuiCollapsibleNavGroup isCollapsible={false} background="dark">
          <EuiListGroup
            color="ghost"
            maxWidth="none"
            gutterSize="none"
            size="s"
            listItems={[
              {
                label: 'Manage deployment',
                href: '#',
                iconType: 'logoCloud',
                iconProps: {
                  color: 'ghost',
                },
              },
            ]}
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>

      <EuiHorizontalRule margin="none" />

      <EuiFlexItem>
        {/* Learn section */}
        <EuiCollapsibleNavGroup
          title={
            <a
              className="eui-textInheritColor"
              href="#/navigation/collapsible-nav"
              onClick={(e) => e.stopPropagation()}
            >
              Training
            </a>
          }
          iconType="training"
          isCollapsible={true}
          initialIsOpen={openGroups.includes('Learn')}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, 'Learn')}
        >
          <EuiPinnableListGroup
            aria-label="Learn" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(LearnLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>

      {/* use eui-yScroll to fix position of items _below_ */}
      <EuiFlexItem className="eui-yScroll">
        {/* Learn section */}
        <EuiCollapsibleNavGroup
          title={
            <a
              className="eui-textInheritColor"
              // href="#/navigation/collapsible-nav"
              onClick={(e) => {
                e.stopPropagation()
                navigate('/skills')
              }}
            >
              My skills
            </a>
          }
          iconType="canvasApp"
          isCollapsible={true}
          initialIsOpen={openGroups.includes('Skills')}
          onToggle={(isOpen: boolean) => toggleAccordion(isOpen, 'Skills')}
        >
          <EuiPinnableListGroup
            aria-label="Skills" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
            listItems={alterLinksWithCurrentState(SkillsLinks)}
            pinTitle={addLinkNameToPinTitle}
            onPinClick={addPin}
            maxWidth="none"
            color="subdued"
            gutterSize="none"
            size="s"
          />
        </EuiCollapsibleNavGroup>

        {/* Admin section */}
        {user?.profile && user?.is_superuser ? (
          <EuiCollapsibleNavGroup
            title={
              <a
                className="eui-textInheritColor"
                // href="#/navigation/collapsible-nav"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                Admin panel
              </a>
            }
            iconType="securityApp"
            isCollapsible={true}
            initialIsOpen={openGroups.includes('Admin')}
            onToggle={(isOpen: boolean) => toggleAccordion(isOpen, 'Admin')}
          >
            <EuiPinnableListGroup
              aria-label="Admin" // A11y : EuiCollapsibleNavGroup can't correctly pass the `title` as the `aria-label` to the right HTML element, so it must be added manually
              listItems={alterLinksWithCurrentState(AdminLinks)}
              pinTitle={addLinkNameToPinTitle}
              onPinClick={addPin}
              maxWidth="none"
              color="subdued"
              gutterSize="none"
              size="s"
            />
          </EuiCollapsibleNavGroup>
        ) : null}
      </EuiFlexItem>

      {/* (UN)DOCK BUTTON */}
      <EuiFlexItem grow={false}>
        <span />
        <EuiCollapsibleNavGroup>
          <EuiButton
            fullWidth
            onClick={() => {
              setNavIsDocked(!navIsDocked)
              localStorage.setItem('euiCollapsibleNavExample--isDocked', JSON.stringify(!navIsDocked))
            }}
          >
            {navIsDocked ? 'Undock sidebar' : 'Dock sidebar'}
          </EuiButton>
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>

      {/* ADD DATA BUTTON */}
      <EuiFlexItem grow={false}>
        {/* Span fakes the nav group into not being the first item and therefore adding a top border */}
        <span />
        <EuiCollapsibleNavGroup>
          <EuiButton fill fullWidth iconType="plusInCircleFilled">
            Add data
          </EuiButton>
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
    </StyledEuiCollapsibleNav>
  )
}

export default CollapsibleNav
