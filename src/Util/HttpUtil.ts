/**
 *
 * @param code http状态码
 * @returns httpcat 各个状态的的响应
 */
export async function HttpStatusResponse(code: number): Promise<Response> {
  let httpCat = await fetch('https://http.cat/' + code)
  return new Response(httpCat.body, { status: code })
}
/**
 * 
 * @param cookies cookie 字符串
 * @param key 要获取的cookie
 * @returns 
 */
export function getCookie(cookies: string, key: string) {
  let reg = new RegExp('\\S*' + key + '=[^;]*', 'gi')
  var result = cookies.match(reg)
  return result && result[0].substr(0, key.length) === key
    ? result[0].substr(key.length + 1)
    : false
}
