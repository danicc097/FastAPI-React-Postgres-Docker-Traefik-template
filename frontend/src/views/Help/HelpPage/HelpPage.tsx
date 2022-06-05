import {
  EuiPage,
  EuiPageBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
  EuiButtonEmpty,
  EuiTourState,
  useEuiTour,
  EuiButton,
} from '@elastic/eui'
import { LandingTitle, StyledEuiPage } from 'src/components/StyledComponents/StyledComponents'
import { StyledEuiPageContent, StyledEuiPageContentBody } from './HelpPage.styles'

import React, { useEffect, useState } from 'react'
import { EuiPageTemplate } from '@elastic/eui'
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'
import { demoTourSteps, STORAGE_KEY, tourConfig } from 'src/components/TourProvider/TourProvider'

type CustomTab = 'tour' | 'faq' | 'bugReport'
type CustomTabs = {
  [key in CustomTab]: { bottomBar: ReactJSXElement; label: string; onClick: () => void }
}

export default function HelpPage({ button = <></>, content, sideNav }: any) {
  const [showBottomBar, setshowBottomBar] = useState(false)
  const [currentTab, setCurrentTab] = useState('tour' as CustomTab)

  // TODO refactor to hook useTour
  const _state = localStorage.getItem(STORAGE_KEY)
  let state: EuiTourState
  if (_state) {
    state = JSON.parse(_state)
  } else {
    state = tourConfig
  }

  const [_, actions, reducerState] = useEuiTour(demoTourSteps, state)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reducerState))
  }, [reducerState])

  const resetTour = () => {
    actions.resetTour()
    console.log('Welcome page tour was reset')
  }

  const tabs: CustomTabs = {
    bugReport: {
      bottomBar: <EuiCallOut title="This section is not yet available" color="danger" iconType="alert" />,
      label: 'Bug Report',
      onClick: () => {
        setshowBottomBar(true)
        setCurrentTab('bugReport')
      },
    },
    tour: {
      bottomBar: (
        <EuiButton fill iconType="refresh" onClick={resetTour}>
          Reset tour
        </EuiButton>
      ),
      label: 'Tour',
      onClick: () => {
        setshowBottomBar(true)
        setCurrentTab('tour')
      },
    },
    faq: {
      bottomBar: <EuiCallOut title="This section is not yet available" color="danger" iconType="alert" />,
      label: 'FAQ',
      onClick: () => {
        setshowBottomBar(true)
        setCurrentTab('faq')
      },
    },
  }

  return (
    <EuiPageTemplate
      pageSideBar={sideNav}
      bottomBar={showBottomBar ? tabs[currentTab].bottomBar : <></>}
      pageHeader={{
        iconType: 'help',
        pageTitle: 'Help',
        rightSideItems: [button],
        tabs: Object.keys(tabs).map((tab) => ({
          label: tabs[tab].label,
          onClick: tabs[tab].onClick,
        })),
      }}
    >
      {content}
    </EuiPageTemplate>
  )
}

function _HelpPage() {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section" align="center"></EuiPageBody>
    </StyledEuiPage>
  )
}
