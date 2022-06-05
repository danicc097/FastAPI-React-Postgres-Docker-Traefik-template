// https://stackoverflow.com/questions/48047362/how-to-remove-imported-css-in-reactjs/67352039#67352039
// until emotion fully implemented in eui

import { useEffect } from 'react'

// global list of all the StyleSheets that are touched in useDisableImportedStyles
const switchableGlobalStyleSheets: StyleSheet[] = []

// just to clarify what createUseDisableImportedStyles() returns
type useDisableImportedStyles = () => void

export const createUseDisableImportedStyles = (
  immediatelyUnloadStyle = true,
  // if true: immediately unloads the StyleSheet when the component is unmounted
  // if false: waits to unloads the StyleSheet until another instance of useDisableImportedStyles is called.This avoids a flash of unstyled content
): useDisableImportedStyles => {
  let localStyleSheet: StyleSheet
  return () => {
    useEffect(() => {
      // if there are no stylesheets, you did something wrong...
      if (document.styleSheets.length < 1) return

      // set the localStyleSheet if this is the first time this instance of this useEffect is called
      if (localStyleSheet == null) {
        localStyleSheet = document.styleSheets[document.styleSheets.length - 1]
        switchableGlobalStyleSheets.push(localStyleSheet)
      }

      // if we are switching StyleSheets, disable all switchableGlobalStyleSheets
      if (!immediatelyUnloadStyle) {
        switchableGlobalStyleSheets.forEach((styleSheet) => (styleSheet.disabled = true))
      }

      // enable our StyleSheet!
      localStyleSheet.disabled = false

      // if we are NOT switching StyleSheets, disable this StyleSheet when the component is unmounted
      if (immediatelyUnloadStyle)
        return () => {
          if (localStyleSheet != null) localStyleSheet.disabled = true
        }
    })
  }
}
