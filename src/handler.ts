import { Router } from 'itty-router'
import { IndexHtml } from './Html/template'
import { BiliBiliInit, BILITask } from './Service/BiliBili/BliBli'
import { ProxyDownloadInit } from './Service/ProxyDownload'
import { HttpStatusResponse } from './Util/HttpUtil'

/**
 * 全局主路由
 */
const router = Router()
/**
 * 处理方法
 * @param request 请求
 * @returns 路由解析的响应
 */
export async function handleRequest(request: Request): Promise<Response> {
  //哔哩哔哩自动签到
  await BiliBiliInit(router)
  //代理下载
  await ProxyDownloadInit(router)
  InitDefaultRoute()
  return router.handle(request)
}
export async function handleScheduled(event: ScheduledEvent): Promise<any> {
  event.waitUntil(new Promise(async (s, f) => {
    await BILITask();

    s()
  }))
  return null;
}


/**
 * 初始化默认路由
 */
function InitDefaultRoute() {
  //默认首页
  router.get('/', () => new Response(IndexHtml(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } }))

  router.get('/test', () => {

    return fetch('https://my-app.ak-47.workers.dev/bili/login?pwd=6d107c37-1e33-4d20-a55c-3bda6de0cd10').then(res => { return new Response(res.body) })

  })


  //全局404路由
  router.all('*', async () => await HttpStatusResponse(404))

}
