import { Router } from 'itty-router'
import { acsess_Entity, QrInfo, UserInfo } from './bli'
import { v4 as uuidv4 } from 'uuid'
import { getCookie } from '../../Util/HttpUtil'
import BiliHelper from './Bhelper'
import { formatDate, getZoneTime, isOneDay } from '../../Util/Time'
import { IndexHtml } from './Html/template'
const biRoute = Router({ base: '/bili' })

export async function BiliBiliInit(route: Router<unknown>) {
  //显示首页
  biRoute.get('/', async () => new Response(await IndexHtml(), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } }))
  //获取登录url
  biRoute.get('/getLoginUrl', async () => {
    return BiliHelper.getLoginUrl()
      .then((res) => {
        if (!res) {
          return new Response(
            JSON.stringify({ code: 500, msg: '不可预料到的错误！' }),
            { status: 500 },
          )
        }
        return new Response(JSON.stringify({ code: 200, data: res }))
      })
      .catch((err) => {
        return new Response(
          JSON.stringify({ code: 500, data: '系统错误:' + err }),
          { status: 500 },
        )
      })
  })
  //获取登录信息
  biRoute.get('/getLoginInfo', async (req: Request) => {
    let urlInfo = new URL(req.url).searchParams
    let code = urlInfo.get('code')
    if (!code) {
      return new Response(JSON.stringify({ code: 500, msg: 'code不能为空！' }))
    }
    return BiliHelper.getLoginInfo(code + '')
      .then(async (res) => {
        if (res == null) {
          return new Response(
            JSON.stringify({ code: 500, msg: '不可预料到的错误！' }),
            { status: 500 },
          )
        }
        //登录成功
        if (typeof res == 'string') {
          let dbDataStr: string = (await MykvDB.get('B_DB')) || '[]'
          let dbData: Array<acsess_Entity> = JSON.parse(dbDataStr)
          //获取出使用的cookie字符串
          let biliCookie = `sid=${getCookie(res, 'sid')};DedeUserID=${getCookie(
            res,
            'DedeUserID',
          )};DedeUserID__ckMd5=${getCookie(
            res,
            'DedeUserID__ckMd5',
          )};SESSDATA=${getCookie(res, 'SESSDATA')}`
          let userinfo: UserInfo | undefined =
            await BiliHelper.getCurrentUserInfo(biliCookie)
          console.log(`[Bli]:用户${userinfo?.uname}登录成功`)
          if (!userinfo) {
            return new Response(
              JSON.stringify({ code: 500, msg: '用户信息获取失败，请重试！' }),
            )
          } else {
            let user: acsess_Entity | undefined = dbData.find(
              (e) => e.userinfo != null && e.userinfo.mid == userinfo?.mid,
            )
            if (user != null) {
              user.cookie = biliCookie
              //存在的用户
            } else {
              //新用户
              let uid = uuidv4()
              user = { tid: uid, cookie: biliCookie, userinfo: userinfo, logs: [], operate: { liveSign: null, mangaSign: null }, setting: { liveSign: null, mangaSign: null } }
              dbData.push(user)
            }
            await MykvDB.put('B_DB', JSON.stringify(dbData))
            return new Response(
              JSON.stringify({ code: 200, data: { pwd: user?.tid, userinfo } }),
            )
          }
        }
        return new Response(JSON.stringify({ code: 200, data: res }))
      })
      .catch((err) => {
        return new Response(
          JSON.stringify({ code: 500, data: '系统错误:' + err }),
          { status: 500 },
        )
      })
  })
  //获取用户信息
  biRoute.get('/getInfo', async (req: Request) => {
    let urlInfo = new URL(req.url).searchParams
    let pwd = urlInfo.get('pwd')
    if (!pwd) {
      return new Response(JSON.stringify({ code: 500, msg: 'pwd不能为空！' }))
    }
    let dbDataStr: string = (await MykvDB.get('B_DB')) || '[]'
    let dbData: Array<acsess_Entity> = JSON.parse(dbDataStr)
    let currentUser: acsess_Entity | undefined = dbData.find(
      (e) => e.tid == pwd,
    );
    if (currentUser != null) {
      let UserInfo = await BiliHelper.getCurrentUserInfo(currentUser?.cookie)
      return new Response(JSON.stringify({ code: 200, data: UserInfo }));
    }
    return new Response(JSON.stringify({ code: 500, msg: 'token 错误！' }));
  })
  //获取日志
  biRoute.get('/getlogs', async (req: Request) => {
    let urlInfo = new URL(req.url).searchParams
    let pwd = urlInfo.get('pwd')
    if (!pwd) {
      return new Response(JSON.stringify({ code: 500, msg: 'pwd不能为空！' }))
    }
    let dbDataStr: string = (await MykvDB.get('B_DB')) || '[]'
    let dbData: Array<acsess_Entity> = JSON.parse(dbDataStr)
    let currentUser: acsess_Entity | undefined = dbData.find(
      (e) => e.tid == pwd,
    );
    return new Response(JSON.stringify({ code: 200, data: currentUser?.logs }));
  })
  //获取ip
  biRoute.get('/getServerIp', async (req: Request) => {
    return BiliHelper.getIP().then(res => new Response(JSON.stringify(res)))
  })

  //进入工具面板
  biRoute.get('/login', async (req: Request) => {
    let urlInfo = new URL(req.url).searchParams
    let pwd = urlInfo.get('pwd')
    if (!pwd) {
      return new Response(JSON.stringify({ code: 500, msg: 'pwd不能为空！' }))
    }
    let dbDataStr: string = (await MykvDB.get('B_DB')) || '[]'
    let dbData: Array<acsess_Entity> = JSON.parse(dbDataStr)
    let currentUser: acsess_Entity | undefined = dbData.find(
      (e) => e.tid == pwd,
    )
    if (!currentUser) {
      return new Response(
        JSON.stringify({ code: 500, msg: '没有找到当前用户' }),
      )
    }
    let currentInfo = await BiliHelper.getCurrentUserInfo(currentUser.cookie)
    return new Response(JSON.stringify({ code: 200, data: currentInfo }))
  })
  //执行计划任务
  biRoute.get('/task/runTask', async (req: Request) => {
    global.FetchCtx.waitUntil(new Promise<void>(async (s, f) => {
      await DoliveSign()
      s()
    }));
    return new Response(JSON.stringify({ code: 200, msg: '任务已发布！' }))
  })
  //全局路由
  route.all('/bili/*', req => {
    console.log(req)
  }, biRoute.handle)
}

/**
 * bili的执行任务
 */
export async function BILITask() {
  await DoliveSign()
}
/**
 * 直播间签到
 */
async function DoliveSign() {
  let dbDataStr: string = (await MykvDB.get('B_DB')) || '[]'
  let dbData: Array<acsess_Entity> = JSON.parse(dbDataStr)
  let task: Promise<void>[] = [];
  dbData.forEach(async item => {
    //直播签到
    if (!item.setting.liveSign || item.setting.liveSign) {
      task.push(new Promise(async (s, f) => {
        let now = new Date(getZoneTime(8));
        if (item.operate.liveSign == null || !isOneDay(now, new Date(item.operate.liveSign))) {
          let dosign = await BiliHelper.liveDoSign(item.cookie)
          item.operate.liveSign = new Date(getZoneTime(8));
          let msg = `[${formatDate(new Date(getZoneTime(8)), 'yyyy-MM-dd hh:mm:ss')}] 直播签到  ${item.userinfo?.uname} ${dosign?.message}`;
          item.logs.push(msg)
          console.log(msg);
        } else {
          let msg = `[${formatDate(new Date(getZoneTime(8)), 'yyyy-MM-dd hh:mm:ss')}] 直播签到 ${item.userinfo?.uname} 今日已签到自动忽略`;
          console.log(msg);
        }
        s()
      }))
    }
    //漫画签到
    if (!item.setting.mangaSign || item.setting.mangaSign) {
      task.push(new Promise(async (s, f) => {
        let now = new Date(getZoneTime(8));
        if (item.operate.mangaSign == null || !isOneDay(now, new Date(item.operate.mangaSign))) {
          try {
            let dosign = await BiliHelper.mangaSign(item.cookie)
            item.operate.mangaSign = new Date(getZoneTime(8));
            let msg = `[${formatDate(new Date(getZoneTime(8)), 'yyyy-MM-dd hh:mm:ss')}] 漫画签到 ${item.userinfo?.uname} ${dosign?.message}`;
            item.logs.push(msg)
            console.log(msg);
          } catch (error) {
            console.log('errr' + "漫画签到失败！");
          }

        } else {
          let msg = `[${formatDate(new Date(getZoneTime(8)), 'yyyy-MM-dd hh:mm:ss')}] 漫画签到 ${item.userinfo?.uname} 今日已签到自动忽略`;
          console.log(msg);
        }
        s()
      }))
    }

  });
  await Promise.all(task)
  await MykvDB.put('B_DB', JSON.stringify(dbData))
}