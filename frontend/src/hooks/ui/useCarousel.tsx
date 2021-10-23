import { useEffect, useRef, useState } from 'react'

export function useCarousel(items: any[], interval: number): GenObjType<any> {
  // We use React.useRef to give ourselves access to the timeout reference. useRef is
  // like a “box” that can hold a mutable value in its .current property.
  const timeoutRef: any = useRef()

  // references to state slices
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true) // start/stop the animation if we need to
  const [current, setCurrent] = useState<number>(0)

  useEffect(() => {
    const next = (current + 1) % items.length // cycle through item indexes
    if (shouldAnimate) {
      timeoutRef.current = setTimeout(() => setCurrent(next), interval)
    }
    // specify a cleanup function as return (if any)
    return () => clearTimeout(timeoutRef.current)
  }, [current, items.length, interval, shouldAnimate])

  // use all this functionality anywhere
  return { current, setShouldAnimate, timeoutRef }
}
