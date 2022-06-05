import { EuiTitle } from '@elastic/eui'
import { motion, AnimatePresence } from 'framer-motion'
import { CarouselProps } from '../Carousel/Carousel'
import React from 'react'
import { AnimatedCarouselTitle, AnimatedTitle, TitleWrapper } from './CarouselTitle.styles'

const transitionDuration = 0.8
const transitionEase = [0.68, -0.55, 0.265, 1.55]

export default function CarouselTitle({ items = [], current }: CarouselProps) {
  const animatedKeyword = (
    <AnimatePresence exitBeforeEnter>
      <AnimatedCarouselTitle>
        {items.map(
          (item, i) =>
            current === i && (
              <React.Fragment key={i}>
                <motion.span
                  key={i}
                  initial="top"
                  animate="present"
                  exit="bottom"
                  style={{ color: 'dodgerblue' }}
                  variants={{
                    top: { opacity: 0, y: -150 },
                    present: { opacity: 1, y: 0 },
                    bottom: { opacity: 0, y: 150 },
                  }}
                  transition={{ duration: transitionDuration, ease: transitionEase }}
                >
                  {item.label}
                </motion.span>
              </React.Fragment>
            ),
        )}
        <div className="underline" />
      </AnimatedCarouselTitle>
    </AnimatePresence>
  )
  return (
    <AnimatedTitle>
      <EuiTitle>
        <TitleWrapper>
          {'Your place to'.split(' ').map((word, i) => (
            <h1 key={i}>{word}</h1>
          ))}
          {animatedKeyword}
          <h1>.</h1>
        </TitleWrapper>
      </EuiTitle>
    </AnimatedTitle>
  )
}
