import { Router } from "itty-router";
import { IndexHtml } from "./html/template";
const apiRoute = Router({ base: '/proxy' })
/**
 * 代理下载
 * @param route 
 */
export async function ProxyDownloadInit(route: Router<unknown>) {
    apiRoute.get('/', async (req: Request) => {
        let urlInfo = new URL(req.url).searchParams
        let url = urlInfo.get('url')
        if (!url) {
            return new Response(await IndexHtml(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
        }
        try {
            let urlobj = new URL(url)
            try {
                let result = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36' }, method: 'get' })
                let { readable, writable } = new TransformStream()
                result.body?.pipeTo(writable)
             
                if (!result.headers.get('Content-Disposition')) {
                    let head=new Headers();
                    let fileName = urlobj.pathname.substring(urlobj.pathname.lastIndexOf("/") + 1)
                    head.append('Content-type','application/octet-stream');
                    head.append('Accept-ranges','bytes');
                    head.append('Content-Disposition', 'attachment;filename=' + fileName);
                    return new Response(readable, {headers:head})
                }
                return new Response(readable,result)
            } catch (error) {
                return new Response(JSON.stringify({ 'code': 500, 'msg': '下载错误：'+error }), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
      
            }
        } catch (error) {
            console.error(error)
            return new Response(JSON.stringify({ 'code': 500, 'msg': '目标网址[' + url + ']错误！不是一个标准的url' }), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
        }
    })

    route.all('/proxy/*', apiRoute.handle)
}