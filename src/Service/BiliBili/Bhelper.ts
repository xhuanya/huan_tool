import {  FetchResponse, QrInfo, UserInfo, UserInfo_Level } from './bli'

/**
 * 操作方法封装
 */
let BiliHelper = {
  /**
   * 获取用户是否扫码
   * @param code 扫码的code
   * @returns
   */
  getLoginInfo: function (code: string) {
    return fetch('http://passport.bilibili.com/qrcode/getLoginInfo', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `oauthKey=${code}`,
    }).then(async (res) => {
      if (res.status == 200) {
        let cookie = res.headers.get('set-cookie')
        let data: any = await res.json()
        console.log(data)
        if (data.status) {
          return cookie
        }
        return data
      }
      let msg = `[BiliBili]:获取登录信息错误！ B站服务器响应错误：${res.status}|${res.statusText}`
      console.log(msg)
      throw new Error(msg)
    })
  },
  /**
   * 获取登录二维码信息
   * @returns 二维码信息
   */
  getLoginUrl: async function (): Promise<QrInfo | undefined> {
    return fetch('https://passport.bilibili.com/qrcode/getLoginUrl')
      .then((res) => {
        if (res.status == 200) {
          return res.json()
        }
        let msg = `[BiliBili]:获取登录UrL错误！ B站服务器响应错误：${res.status}|${res.statusText}`
        console.log(msg)
        throw new Error(msg)
      })
      .then((res: any) => {
        if (res.code == 0) {
          return res.data
        }
        return null
      })
  },
  /**
   * 获取用户登录信息
   * @param cookies 小饼干
   * @returns 
   */
  getCurrentUserInfo(cookies: string): Promise<UserInfo | undefined> {
    return fetch('http://api.bilibili.com/x/web-interface/nav', {
      headers: { cookie: cookies },
    })
      .then((res) => {
        if (res.status == 200) {
          return res.json()
        }
        let msg = `[BiliBili]:获取登录UrL错误！ B站服务器响应错误：${res.status}|${res.statusText}`
        console.log(msg)
        throw new Error(msg)
      })
      .then((res: any) => {
        if (res.code == 0) {
          let leve: UserInfo_Level = {
            current_level: res.data.level_info.current_level,
            current_min: res.data.level_info.current_min,
            current_exp: res.data.level_info.current_exp,
            next_exp: res.data.level_info.next_exp,
          }
          let rs: UserInfo = {
            face: res.data.face,
            level_info: leve,
            uname: res.data.uname,
            money: res.data.money,
            moral: res.data.moral,
            mid: res.data.mid,
          }
          return rs
        } else if (res.code == -101) {
          let msg = `[BiliBili]:用户cookie已过期请从新获取`
          console.log(msg)
          throw new Error(msg)
        }
      })
  },
  /**
   * 直播签到
   * @param cookie 小饼干
   */
  liveDoSign(cookies: string):Promise<FetchResponse|undefined> {
    return fetch('http://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign', {
      headers: { cookie: cookies },
    })
      .then((res) => {
        if (res.status == 200) {
          return res.json()
        }
        let msg = `[BiliBili]:获取登录UrL错误！ B站服务器响应错误：${res.status}|${res.statusText}`
        console.log(msg)
        throw new Error(msg)
      })
      .then((res: any) => {
        if (res.code == 0) {
          let rs: FetchResponse = {
            code: 0,
            message: `${res.data.text} ${res.data.specialText} 已签到${res.data.hadSignDays} 天 本月可签到次数${res.data.allDays}`,
          }
          return rs;
        } else {
          let rs: FetchResponse = {
            code: 1,
            message: res.message,
          }
          return rs;
        }
      })
  },
  /**
   * 获取ip
   */
  getIP():Promise<any>{
   return fetch('http://api.bilibili.com/x/web-interface/zone').then(res=>res.json()).then((res:any)=>res.data)
  },
  /**
   * 漫画签到
   * @param cookies 
   */
  mangaSign(cookies: string):Promise<FetchResponse|undefined>{

    let formData = new FormData();
    formData.append('platform','android')
    return fetch('https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn', {
      headers: { cookie: cookies },
      method:"POST",
      body:formData,
    })
      .then(async (res) => {
        if (res.status == 200) {
          return res.json()
        }
        let msg = `[BiliBili]:获取登录UrL错误！ B站服务器响应错误：${res.status}|${res.statusText}|${await res.text()}`
        console.log(msg)
        throw new Error(msg)
      })
      .then((res: any) => {
        console.log('响应了00000',JSON.stringify(res))
        if (res.code == 0) {
          let rs: FetchResponse = {
            code: 0,
            message: `漫画签到成功！`,
          }
          return rs;
        } else {
          let rs: FetchResponse = {
            code: 1,
            message: res.message,
          }
          return rs;
        }
      })
  }
}
export default BiliHelper
