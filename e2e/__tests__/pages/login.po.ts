import { ElementHandle } from 'puppeteer'
import BasePO from './base.po'

class LoginPO extends BasePO {
  async go() {
    await this.navigate('/login')
  }
}

export default new LoginPO()
