declare global {
  interface Window {
    env: any
  }
}

// change with your own variables
type EnvType = {
  VITE_COLOR: string
  VITE_MAIN_TEXT: string
  VITE_LINK_URL: string
  VITE_LOGO_URL: string
}
export const env: EnvType = { ...process.env, ...window.env }
