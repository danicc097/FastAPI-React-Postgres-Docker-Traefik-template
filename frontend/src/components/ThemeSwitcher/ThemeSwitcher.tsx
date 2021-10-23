import { EuiSwitch, EuiText } from '@elastic/eui'
import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { customThemeDark, customThemeLight } from 'src/components/Layout/Layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

const Switch = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
  align-items: center;
`

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  padding-right: 5px;
  font-size: large;
`

type ThemeSwitcherPropTypes = {
  currentTheme: string
  setTheme: Dispatch<any>
  setProviderTheme: Dispatch<any>
}

export function ThemeSwitcher({ currentTheme, setTheme, setProviderTheme }: ThemeSwitcherPropTypes) {
  const [checked, setChecked] = React.useState(currentTheme === 'dark' ? true : false)

  // only way to have both of them in the build output. Additionally,
  // they override each other upon import, hence reloading the page is needed
  const ThemeDark = React.lazy(() => import('src/themes/ThemeDarkAmsterdam'))
  const ThemeLight = React.lazy(() => import('src/themes/ThemeLightAmsterdam'))

  React.useEffect(() => {
    // checked has been changed to the desired value already
    localStorage.setItem('theme', checked ? 'dark' : 'light')
    if (checked) {
      setTheme(customThemeDark)
      setProviderTheme(customThemeDark)
    } else {
      setTheme(customThemeLight)
      setProviderTheme(customThemeLight)
    }
    setProviderTheme(checked ? customThemeDark : customThemeLight)
  }, [checked])

  const toggleTheme = () => {
    setChecked(!checked)

    setTimeout(() => {
      // only way to force re-render and get rid of old css
      // without writing more abominable code
      window.location.reload()
    }, 50)
  }
  return (
    <Switch className="theme-switcher">
      <React.Suspense fallback={null}>
        {localStorage.getItem('theme') === 'dark' && <ThemeDark />}
        {localStorage.getItem('theme') === 'light' && <ThemeLight />}
      </React.Suspense>
      <StyledFontAwesomeIcon icon={faSun} size="lg" />
      <EuiSwitch label="" checked={checked} onChange={toggleTheme} />
      <StyledFontAwesomeIcon icon={faMoon} size="lg" />
    </Switch>
  )
}
