import { EuiPageContent, EuiPageContentBody } from '@elastic/eui'
import styled from 'styled-components'

export const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    border-radius: 50%;
  }
`

export const StyledEuiPageContentBody = styled(EuiPageContentBody)`
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
