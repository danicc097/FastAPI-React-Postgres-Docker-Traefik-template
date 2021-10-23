// To sync the Carousel items, we initialize them here and pass
// the 'current' variable over each component.

import { EuiPage, EuiPageBody, EuiPageContent, EuiPageContentBody, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import heroGirl from 'src/assets/img/HeroGirl.svg'
import share from 'src/assets/img/books-illustration-1.svg'
import discover from 'src/assets/img/books-illustration-2.svg'
import learn from 'src/assets/img/books-illustration-3.svg'
import styled from 'styled-components'
import { useCarousel } from '../../hooks/ui/useCarousel'
import CarouselTitle from '../CarouselTitle/CarouselTitle'
import Carousel from '../Carousel/Carousel'
import React from 'react'
import { LandingTitle, StyledEuiPage } from '../StyledComponents/StyledComponents'

const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    border-radius: 50%;
  }
`

const StyledEuiPageContentBody = styled(EuiPageContentBody)`
  &&& {
    max-width: 400px;
    max-height: 400px;
    shape-rendering: geometricPrecision;

    & > img {
      max-width: 100%;
      border-radius: 50%;
      object-fit: cover;
      --webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }
  }
`

export interface CarouselItems {
  label: string
  content: JSX.Element
}

const carouselItems: CarouselItems[] = [
  { label: 'share', content: <img src={share} alt="share" /> },
  { label: 'discover', content: <img src={discover} alt="discover" /> },
  { label: 'learn', content: <img src={learn} alt="learn" /> },
]

export default function LandingPage() {
  const { current } = useCarousel(carouselItems, 3000)

  return (
    <StyledEuiPage>
      <EuiPageBody component="section" align>
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem>
            <LandingTitle>My App</LandingTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <CarouselTitle items={carouselItems} current={current} />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup direction="rowReverse" alignItems="center">
          <EuiFlexItem>
            <Carousel items={carouselItems} current={current} />
          </EuiFlexItem>
          <EuiFlexItem>
            <StyledEuiPageContent horizontalPosition="center">
              <StyledEuiPageContentBody>
                <img src={heroGirl} alt="girl" />
              </StyledEuiPageContentBody>
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
