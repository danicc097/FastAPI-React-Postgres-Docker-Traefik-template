import React from 'react'
import { Helmet } from 'react-helmet'
import styled, { ThemeProvider } from 'styled-components'
import euiVarsLight from '@elastic/eui/dist/eui_theme_amsterdam_light.json'
import euiVarsDark from '@elastic/eui/dist/eui_theme_amsterdam_dark.json'
import { EuiGlobalToastList } from '@elastic/eui'
import { useToasts } from 'src/hooks/ui/useToasts'
import Navbar from '../Navbar/Navbar'
import { ThemeSwitcher } from '../ThemeSwitcher/ThemeSwitcher'

// override predefined EuiTheme for all eui components

export const customThemeLight: any = {
  ...euiVarsLight,
  euiTitleColor: 'dodgerblue',
}

export const customThemeDark: any = {
  ...euiVarsDark,
  euiTitleColor: 'dodgerblue',
}

const StyledLayout = styled.div`
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const StyledFooterHeight = '50px'

const StyledMain = styled.main`
  min-height: calc(100vh - ${(props) => props.theme.euiHeaderHeight} - ${StyledFooterHeight});
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: ${StyledFooterHeight};
  margin-top: 50px; /* StyledEuiHeader height */

  & h1 {
    color: ${(props) => props.theme.euiTitleColor};
  }
`

type LayoutPropTypes = {
  children: React.ReactElement
}

const StyledFooter = styled.footer`
  /* position: fixed; */
  width: 100%;
  height: ${StyledFooterHeight};
  bottom: 0px;
  display: flex;
  align-items: center; /* align vertical */
  box-shadow: 0px -9px 14px 20px rgb(0 0 0 / 5%);
  justify-content: space-between;
  /* for some reason there's no background with amsterdam css */
  /* position: fixed;  */
  /* background-color: hsl(231, 11%, 13%); */

  .footer-info {
    margin-left: 1rem;
    color: #1e90ff;
    font-weight: bold;
    font-size: 1rem;
  }
`

export default function Layout({ children }: LayoutPropTypes) {
  const { toasts, removeToast } = useToasts()
  const [theme, setTheme] = React.useState(localStorage.getItem('theme'))
  const [providerTheme, setProviderTheme] = React.useState(theme === 'light' ? customThemeLight : customThemeDark)

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>My App</title>
        <link rel="canonical" href="#" />
      </Helmet>
      <ThemeProvider theme={providerTheme}>
        <StyledLayout>
          <Navbar />
          <StyledMain>{children}</StyledMain>
          <StyledFooter>
            <span className="footer-info">
              <p>Copyright © 2021 ______</p>
              <p>Build version: {process.env.REACT_APP_BUILD_NUMBER ?? 'DEVELOPMENT'}</p>
            </span>
            {/* we can use hooks in children */}
            <ThemeSwitcher currentTheme={theme} setTheme={setTheme} setProviderTheme={setProviderTheme} />
          </StyledFooter>
          {/* handle toasts everywhere in the app. */}
          <EuiGlobalToastList
            toasts={toasts}
            dismissToast={removeToast}
            toastLifeTimeMs={10000}
            side="right"
            className="auth-toast-list"
          />
        </StyledLayout>
      </ThemeProvider>
    </>
  )
}
