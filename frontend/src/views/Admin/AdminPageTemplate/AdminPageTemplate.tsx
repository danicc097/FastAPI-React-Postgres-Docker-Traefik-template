import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPageBody,
  EuiPageContent,
  EuiHorizontalRule,
} from '@elastic/eui'
import React from 'react'

import styled from 'styled-components'
import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import { LandingTitle, StyledEuiPage, StyledEuiPageHeader } from 'src/components/StyledComponents/StyledComponents'

const StyledEuiPageContent = styled(EuiPageContent)`
  &&& {
    max-width: 70%;
    min-width: 800px;
  }
`

const StyledEuiHorizontalRule = styled(EuiHorizontalRule)`
  &&& {
    background-color: dodgerblue;
  }
`

type AdminPageTemplateProps = {
  title: React.ReactNode
  element: JSX.Element
}

export default function AdminPageTemplate({ title, element }: AdminPageTemplateProps) {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiFlexGroup direction="column" alignItems="center">
          <EuiFlexItem grow={1}>
            <StyledEuiPageHeader>
              <LandingTitle>Admin panel</LandingTitle>
            </StyledEuiPageHeader>
          </EuiFlexItem>
          <EuiFlexItem grow={10}>
            <StyledEuiPageContent horizontalPosition="center">
              {title}
              <StyledEuiHorizontalRule margin="m" />
              {element}
            </StyledEuiPageContent>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
