import { EuiTitle } from '@elastic/eui'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import { CarouselProps } from '../Carousel/Carousel'
import React from 'react'

const AnimatedTitle = styled.div`
  margin-bottom: 1rem;
  & h1 {
    display: flex;
    color: #212121;
    margin: 0 0.25rem;
  }
`

const TitleWrapper = styled.span`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

const width = '110px'

const AnimatedCarouselTitle = styled.span`
  position: relative;
  display: flex;
  justify-content: center;
  margin: 0 10px;
  width: ${width};
  white-space: nowrap;
  & .underline {
    width: ${width};
    height: 2px;
    border-radius: 4px;
    position: absolute;
    bottom: -4px;
    background: black;
    background: dodgerblue;
  }
`
const transitionDuration = 0.8
const transitionEase = [0.68, -0.55, 0.265, 1.55]

// This component looks very similar to the iamge Carousel, with a few key differences.
// We're animating from top down - a change of the y position from -150 to 150.
// We're also animating words instead of images, so the layout and styles are changed considerably.
// We're also adding an underline to the animated word, so that the animation appears
// to go down through the underline.
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
