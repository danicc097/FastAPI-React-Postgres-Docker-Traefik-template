import { EuiSwitch, EuiText } from '@elastic/eui'
import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from 'src/themes/useTheme'
import { Switch, StyledFontAwesomeIcon } from './ThemeSwitcher.styles'

export function ThemeSwitcher() {
  const { setTheme } = useTheme()
  const [checked, setChecked] = React.useState(localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    setTheme(checked ? 'dark' : 'light')
  }, [checked])

  return (
    <Switch className="theme-switcher">
      <StyledFontAwesomeIcon icon={faSun} size="lg" />
      <EuiSwitch label="" checked={checked} onChange={() => setChecked(!checked)} />
      <StyledFontAwesomeIcon icon={faMoon} size="lg" />
    </Switch>
  )
}
