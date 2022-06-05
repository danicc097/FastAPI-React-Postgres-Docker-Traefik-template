import styled from 'styled-components'

export const AnimatedTitle = styled.div`
  margin-bottom: 1rem;
  & h1 {
    display: flex;
    color: 'dodgerblue';
    margin: 0 0.25rem;
  }
`
export const TitleWrapper = styled.span`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`
const width = '110px'
export const AnimatedCarouselTitle = styled.span`
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
