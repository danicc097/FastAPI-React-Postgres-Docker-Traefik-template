import React from 'react'
import { EuiPanel } from '@elastic/eui'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import { CarouselItems } from '../../views/Home/LandingPage/LandingPage'

const CarouselWrapper = styled.div`
  &&& {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 450px;
    min-width: 450px;
    @media screen and (max-width: 450px) {
      min-height: calc(100vw - 25px);
      min-width: calc(100vw - 25px);
    }
  }
`

const StyledEuiPanel = styled(EuiPanel)`
  &&& {
    height: 450px;
    width: 450px;
    max-width: 450px;
    max-height: 450px;
    border-radius: 50%;
    & > img {
      width: 100%;
      border-radius: 50%;
    }
    @media screen and (max-width: 450px) {
      height: calc(100vw - 25px);
      width: calc(100vw - 25px);
    }
  }
`

// 2 items are animated, duration is halved
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
        {/* exitBeforeEnter animates out of the DOM before the next item appears */}
        {items.map((item, i) =>
          current === i ? (
            <React.Fragment key={i}>
              {/* convert the div wrapping the StyledEuiPanel into a motion.div
          This works like a normal div, but accepts additional props */}
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
