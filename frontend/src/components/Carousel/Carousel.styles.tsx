import { EuiPanel } from '@elastic/eui'
import styled from 'styled-components'

export const CarouselWrapper = styled.div`
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
export const StyledEuiPanel = styled(EuiPanel)`
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
