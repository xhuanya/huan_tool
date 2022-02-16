export {};

declare global {
  /**
   * 网站名称
   */
  const SiteName: string;
  /**
   * 描述
   */
  const Description:string;
  /**
   * 关键字
   */
  const Keywords:string;
  /**
   * 存储
   */
  const MykvDB: KVNamespace;
  /**
   * 上下文
   */
  var FetchCtx:FetchEvent;
}
