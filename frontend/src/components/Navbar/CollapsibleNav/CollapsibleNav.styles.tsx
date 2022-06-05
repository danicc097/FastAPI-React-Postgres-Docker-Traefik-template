import { EuiCollapsibleNav } from '@elastic/eui'
import styled from 'styled-components'

export const StyledEuiCollapsibleNav = styled(EuiCollapsibleNav)`
  &&& {
    margin-top: ${(props) => props.theme.euiHeaderHeight};

    padding-bottom: ${(props) => props.theme.euiHeaderHeight};
  }
`
