import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { ThemeProvider } from 'styled-components'
import { EuiGlobalToastList } from '@elastic/eui'
import { useToasts } from 'src/hooks/ui/useToasts'
import Navbar from '../Navbar/Navbar'
import { useTheme } from 'src/themes/useTheme'
import { StyledLayout, StyledMain, StyledFooter } from './Layout.styles'

type LayoutProps = {
  children: React.ReactElement
}

export default function Layout({ children }: LayoutProps) {
  const { toasts, removeToast } = useToasts()

  const { providerTheme, styleSheet } = useTheme()

  useEffect(() => {
    const themeStyle = document.getElementById('theme-style') as HTMLLinkElement

    if (themeStyle?.href !== styleSheet && themeStyle) {
      themeStyle.href = styleSheet
    } else if (!themeStyle) {
      const link = document.createElement('link')
      link.id = 'theme-style'
      link.rel = 'styleSheet'
      link.href = styleSheet
      document.head.appendChild(link)
    }
  }, [styleSheet])

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>MYAPP</title>
        <link rel="canonical" href="#" />
      </Helmet>
      <ThemeProvider theme={providerTheme}>
        <StyledLayout>
          <Navbar />
          <StyledMain>{children}</StyledMain>
          <StyledFooter>
            <span className="footer-info">
              <p>Copyright © {new Date().getFullYear()} *~*~*</p>
              <p>Build version: {import.meta.env.VITE_BUILD_NUMBER ?? 'DEVELOPMENT'}</p>
            </span>
          </StyledFooter>

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
