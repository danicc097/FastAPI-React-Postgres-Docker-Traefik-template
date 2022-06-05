import { EuiAccordion, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPageBody, EuiHorizontalRule } from '@elastic/eui'
import React from 'react'

import _ from 'lodash'
import { useNavigate } from 'react-router-dom'
import {
  LandingTitle,
  StyledEuiHorizontalRule,
  StyledEuiPage,
  StyledEuiPageHeader,
} from 'src/components/StyledComponents/StyledComponents'
import { StyledEuiPageContent } from './AdminPageBase.styles'

type AdminPageBaseProps = {
  title: React.ReactNode
  element: JSX.Element
}

export default function AdminPageBase({ title, element }: AdminPageBaseProps) {
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
