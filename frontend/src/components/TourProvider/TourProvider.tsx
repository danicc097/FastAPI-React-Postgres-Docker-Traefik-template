import { EuiCodeBlock, EuiSpacer, EuiText, EuiTourState, EuiTourStep, useEuiTour } from '@elastic/eui'
import { useEffect } from 'react'
import React from 'react'

export const demoTourSteps: any = [
  {
    step: 1,
    title: (
      <EuiText color="dodgerblue">
        <b>Welcome page</b>
      </EuiText>
    ),
    content: (
      <>
        <p>
          Welcome to <b>MYAPP</b>.
        </p>
        <p>Go to your profile to see and modify your personal data.</p>
      </>
    ),
    anchorPosition: 'downLeft',
    anchor: '#avatar-menu',
    display: 'block',
    onFinish: () => {
      console.log('finished step 1')
    },
    stepsTotal: 2,
  },
  {
    step: 2,
    title: (
      <EuiText color="dodgerblue">
        <b>Welcome page</b>
      </EuiText>
    ),
    content: (
      <p>
        You can reset this tour at any time in the <b style={{ color: 'dodgerblue' }}>Help</b> page.
      </p>
    ),
    display: 'block',
    anchorPosition: 'upLeft',
    anchor: '.help-header-link',
    onFinish: () => {
      console.log('finished step 2')
    },
    stepsTotal: 2,
  },
]

export function getTourState() {
  const _state = localStorage.getItem(STORAGE_KEY)
  let state: EuiTourState
  if (_state) {
    state = JSON.parse(_state)
  } else {
    state = tourConfig
  }
  return state
}

export const tourConfig: EuiTourState = {
  currentTourStep: 1,
  isTourActive: true,
  tourPopoverWidth: 360,
  tourSubtitle: 'Welcome tour',
}

export const STORAGE_KEY = 'tourWelcome_Managed'

export const TourProvider = ({ children }: any) => {
  const state: EuiTourState = getTourState()
  const [euiTourSteps, actions, reducerState] = useEuiTour(demoTourSteps, state)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reducerState))

    const avatarMenu = document.querySelector('#avatar-menu')
    if (avatarMenu) {
      avatarMenu.addEventListener('click', () => {
        console.log('currentTourStep', reducerState.currentTourStep)
        if (reducerState.currentTourStep === 1) {
          actions.incrementStep()
        }
      })
    }

    const helpHeaderLink = document.querySelector('.help-header-link')
    if (helpHeaderLink) {
      console.log('currentTourStep', reducerState.currentTourStep)
      helpHeaderLink.addEventListener('click', () => {
        if (reducerState.currentTourStep === 2) {
          actions.finishTour()
        }
      })
    }
  }, [reducerState])

  return (
    <div className="tours">
      <EuiTourStep {...euiTourSteps[0]} />
      <EuiTourStep {...euiTourSteps[1]} />

      {children}
    </div>
  )
}
