import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export const IFrame = ({ children, ...props }: any) => {
  const [contentRef, setContentRef] = useState(null)
  const mountNode = contentRef?.contentWindow?.document?.body

  return (
    <iframe {...props} ref={setContentRef}>
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  )
}
