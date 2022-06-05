import styled from 'styled-components'

export const StyledLayout = styled.div`
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const StyledFooterHeight = '50px'
export const StyledMain = styled.main`
  min-height: calc(100vh - ${(props) => props.theme.euiHeaderHeight} - ${StyledFooterHeight});
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: ${StyledFooterHeight};
  margin-top: 50px;

  & h1 {
    color: ${(props) => props.theme.euiTitleColor};
  }
`
export const StyledFooter = styled.footer`
  width: 100%;
  height: ${StyledFooterHeight};
  bottom: 0px;
  display: flex;
  align-items: center;
  box-shadow: 0px -9px 14px 20px rgb(0 0 0 / 5%);
  justify-content: space-between;

  /* position: fixed;  */
  /* background-color: hsl(231, 11%, 13%); */

  .footer-info {
    margin-left: 1rem;
    color: #1e90ff;
    font-weight: bold;
    font-size: 0.9rem;
  }
`
