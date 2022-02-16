
export function isOneDay(day1: Date, day2: Date) {
    return day1.getFullYear() == day2.getFullYear() && day1.getMonth() == day2.getMonth() && day1.getDate() == day2.getDate()
}
export function formatDate(v: Date, format: string) {
    if (!v) return "";
    var d = v;
    var o:any = {
        "M+": d.getMonth() + 1,  //month
        "d+": d.getDate(),       //day
        "h+": d.getHours(),      //hour
        "m+": d.getMinutes(),    //minute
        "s+": d.getSeconds(),    //second
        "q+": Math.floor((d.getMonth() + 3) / 3),  //quarter
        "S": d.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
//北京是getZoneTime(8),纽约是getZoneTime(-5),班加罗尔是getZoneTime(5.5). 偏移值是本时区相对于格林尼治所在时区的时区差值
export function getZoneTime(offset:number) {
    // 取本地时间
    var localtime = new Date();
    // 取本地毫秒数
    var localmesc = localtime.getTime();
    // 取本地时区与格林尼治所在时区的偏差毫秒数
    var localOffset = localtime.getTimezoneOffset() * 60000;
    // 反推得到格林尼治时间
    var utc = localOffset + localmesc;
    // 得到指定时区时间
    var calctime = utc + (3600000 * offset);
    var nd = new Date(calctime);

    return nd.toJSON().replace("T"," ").replace("Z"," ");
    //return nd.getFullYear()+"-"+nd.getUTCMonth()+"-"+nd.getDay() + " " + nd.toLocaleTimeString() ;
}