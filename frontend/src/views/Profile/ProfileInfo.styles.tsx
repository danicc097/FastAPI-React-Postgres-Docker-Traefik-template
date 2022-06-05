import { EuiText } from '@elastic/eui'
import styled from 'styled-components'

export const StyledEuiText = styled(EuiText)`
  &&& {
    align-self: center;
    & p {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-content: center;
      align-items: center;
    }

    & p > * {
      margin-right: 0.5rem;
    }
  }
`
