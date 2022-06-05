import { EuiPageContent, EuiPageContentBody } from '@elastic/eui'
import styled from 'styled-components'

export const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    max-width: 80%;
  }
`
export const StyledEuiPageContentBody = styled(EuiPageContentBody)`
  &&& {
    display: flex;
    flex-direction: column;
    align-items: center;

    & h2 {
      margin-bottom: 1rem;
    }

    & p {
      margin-bottom: 0.2rem;
    }
  }
`
