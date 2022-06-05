import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CarouselItems } from '../../views/Home/LandingPage/LandingPage'
import { CarouselWrapper, StyledEuiPanel } from './Carousel.styles'

const transitionDuration = 0.4
const transitionEase = [0.68, -0.55, 0.265, 1.55]

export interface CarouselProps {
  items: CarouselItems[]
  current: number
}

export default function Carousel({ items = [], current }: CarouselProps) {
  return (
    <CarouselWrapper>
      <AnimatePresence exitBeforeEnter>
        {items.map((item, i) =>
          current === i ? (
            <React.Fragment key={i}>
              <motion.div
                key={i}
                initial="left"
                animate="present"
                exit="right"
                variants={{
                  left: { opacity: 0, x: -70 },
                  present: { opacity: 1, x: 0 },
                  right: { opacity: 0, x: 70 },
                }}
                transition={{ duration: transitionDuration, ease: transitionEase }}
              >
                <StyledEuiPanel paddingSize="l">{item.content}</StyledEuiPanel>
              </motion.div>
            </React.Fragment>
          ) : null,
        )}
      </AnimatePresence>
    </CarouselWrapper>
  )
}
