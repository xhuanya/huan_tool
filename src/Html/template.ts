import Mustache from 'mustache'
let indexHtml = require('./index.html')
export function IndexHtml() {
  let SiteData = {
    title: SiteName,
    description:Description,
    keywords:Keywords
  }
  return Mustache.render(indexHtml.default, SiteData)
}
