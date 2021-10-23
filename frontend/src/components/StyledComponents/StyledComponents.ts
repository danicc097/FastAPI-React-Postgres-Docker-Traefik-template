import { EuiPage, EuiPageHeader } from '@elastic/eui'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const LandingTitle = styled.h1`
  font-weight: bold;
  font-size: 3.5rem;
  margin: 0 0 2rem;
  align-self: center;
`

export const BetaBadge = styled.span`
  background-color: #666;
  display: inline-block;
  padding: 0 16px;
  border-radius: 24px;
  vertical-align: super;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 24px;
  text-align: center;
  white-space: nowrap;
  cursor: default;
  border: none;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: none;
`

export const StyledEuiPageHeader = styled(EuiPageHeader)`
  &&& {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem 0;

    & h1 {
      font-size: 3.5rem;
    }
  }
`

export const StyledLink = styled(Link)`
  &&& {
    &:hover {
      text-decoration: underline;
    }
  }
`

export const StyledEuiPage = styled(EuiPage)`
  &&& {
    flex: 1;
  }
`
