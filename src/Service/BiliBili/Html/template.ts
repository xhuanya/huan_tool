import Mustache from 'mustache'
import BiliHelper from '../Bhelper'
let indexHtml = require('./index.html')
export async function IndexHtml() {
  let serverInfo = await BiliHelper.getIP();
  
  let SiteData = {
    title: SiteName,
    description: Description,
    keywords: Keywords,
    serverinfo:`运行节点：${serverInfo.country}-${serverInfo.province}`
  }
  return Mustache.render(indexHtml.default, SiteData)
}
