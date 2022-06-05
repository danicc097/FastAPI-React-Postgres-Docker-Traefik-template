import { EuiAccordion, EuiFieldPassword } from '@elastic/eui'
import styled from 'styled-components'

export const StyledEuiAccordion = styled(EuiAccordion)`
  &&& {
    margin-top: 2rem;
  }
`
export const StyledEuiFieldPassword = styled(EuiFieldPassword)`
  &&& {
    -webkit-text-security: disc;
  }
`
