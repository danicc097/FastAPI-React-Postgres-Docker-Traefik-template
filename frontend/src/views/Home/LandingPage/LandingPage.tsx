import { EuiPage, EuiPageBody, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import heroGirl from 'src/assets/img/HeroGirl.svg'
import share from 'src/assets/img/books-illustration-1.svg'
import discover from 'src/assets/img/books-illustration-2.svg'
import learn from 'src/assets/img/books-illustration-3.svg'
import { useCarousel } from '../../../hooks/ui/useCarousel'
import CarouselTitle from 'src/components/CarouselTitle/CarouselTitle'
import Carousel from 'src/components/Carousel/Carousel'
import React from 'react'
import { LandingTitle, StyledEuiPage } from 'src/components/StyledComponents/StyledComponents'
import { StyledEuiPageContent, StyledEuiPageContentBody } from './LandingPage.styles'
import { TourProvider } from 'src/components/TourProvider/TourProvider'

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
    <TourProvider>
      <StyledEuiPage>
        <EuiPageBody component="section" align="center">
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
    </TourProvider>
  )
}
