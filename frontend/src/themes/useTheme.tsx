import euiVarsLight from '@elastic/eui/dist/eui_theme_light.json'
import euiVarsDark from '@elastic/eui/dist/eui_theme_dark.json'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { UiActionCreators } from 'src/redux/modules/ui/ui'

const customThemeLight: any = {
  ...euiVarsLight,
  // euiTitleColor: 'dodgerblue',
}
const customThemeDark: any = {
  ...euiVarsDark,
  // euiTitleColor: 'dodgerblue',
}

export const useTheme = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)
  const styleSheet = useAppSelector((state) => state.ui.styleSheet)

  const [providerTheme, setProviderTheme] = useState(theme === 'dark' ? customThemeDark : customThemeLight)

  const setTheme = (theme: 'dark' | 'light') => {
    return dispatch(UiActionCreators.setTheme({ theme }))
  }

  return {
    theme,
    setTheme,
    providerTheme,
    setProviderTheme,
    styleSheet,
  }
}
