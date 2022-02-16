/**
 * 响应数据
 */
export interface FetchResponse {
  /**
   * 二维码内容url
   */
  code: number;
  /**
   * 扫码登录秘钥
   */
  message: string | undefined;
}

/**
 * 扫码
 */
export interface QrInfo {
  /**
   * 二维码内容url
   */
  url: string
  /**
   * 扫码登录秘钥
   */
  oauthKey: string
}
/**
 * 用户信息（简化）
 */
export interface UserInfo {
  /**
   * 头像
   */
  face: string
  /**
   * 等级
   */
  level_info: UserInfo_Level
  /**
   * 用户名
   */
  uname: string
  /**
   * 拥有硬币数
   */
  money: number
  /**
   * 当前节操值
   */
  moral: number
  /**
   * 登录用户mid
   */
  mid: number
}
/**
 * 等级
 */
export interface UserInfo_Level {
  /**
   * 当前等级
   */
  current_level: number
  /**
   * 当前等级经验最低值
   */
  current_min: number
  /**
   * 当前经验
   */
  current_exp: number
  /**
   * 升级需要的经验值
   */
  next_exp: string
}

export interface acsess_Entity {
  /**
   * 用户随机uid
   */
  tid: string
  /**
   * 小饼干
   */
  cookie: string
  /**
   * 用户信息
   */
  userinfo: UserInfo | null,
  /**
   * 日志
   */
  logs: string[];
  /**
   * 操作标识
   */
  operate: operate_Entity;
  /**
   * 设置实体
   */
  setting: Setting_Entity

}
/**
 * 设置
 */
export interface Setting_Entity {
  /**
   * 直播签到
   */
  liveSign: boolean | null,
  /**
   * 动漫签到
   */
  mangaSign: boolean | null,
}
/**
 * 操作标识
 */
export interface operate_Entity {
  liveSign: Date | null
  mangaSign: Date | null

}

