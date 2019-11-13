const Util = {
    webp: (function() {
        try {
            return (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0);
        } catch (err) {
            return false;
        }
    })(),
    blackList: ['MI NOTE LTE Build/MMB29M'],
    cookie (name, value, options) {
        if (typeof value !== 'undefined') {
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            let expires = '';
            if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
                let date;
                if (typeof options.expires === 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
            }
            const path = options.path ? '; path=' + (options.path) : '';
            const domain = options.domain ? '; domain=' + (options.domain) : '';
            const secure = options.secure ? '; secure' : '';
            document.cookie = [ name, '=', encodeURIComponent(value), expires, path, domain, secure ].join('');
        } else {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[ i ].replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    },
    trimHttp (url) {
        return url ? url.replace(/^http(s)?:/, '') : '';
    },
    webpImage (url, w, h, c = false) {
        if (!url) {
            return url;
        }
        const suffix = url.match(/(.*\.(jpg|jpeg|gif|png))(\?.*)?/);
        // 路径是否包含/bfs/
        const isBfs = url.indexOf('/bfs/') !== -1;
        // 是否是GIF图片
        if (!suffix || suffix[2] === 'gif' || !isBfs) {
            return this.trimHttp(url);
        }
        // 裁剪规则
        w = Math.ceil(w);
        h = Math.ceil(h);
        let cut = w && h ? `@${w}w_${h}h` : (w ? `@${w}w` : (h ? `@${h}h` : '@'));
        if (c) {
            cut += '_1c';
        }
        // 图片后参数 比如视频动态图
        const args = suffix[3] ? suffix[3] : '';
        if (this.webp) {
            return this.trimHttp(`${suffix[1]}${cut}.webp${args}`);
        } else {
            return this.trimHttp(`${suffix[1]}${cut}.${suffix[2]}${args}`);
        }
    },
    getQueryString (name, hasParams = false) {
        var reg = new RegExp('(^|&|#)' + name + '=([^&]*)(&|$)', 'i');
        let r = location.hash.match(reg) || window.location.search.slice(1).match(reg);
        return r == null ? (hasParams ? null : '') : decodeURI(r[2]);
    },
    ver: (function (u) {
        u = u === undefined ? window.navigator.userAgent : u;
        let uaList = u.split('BiliApp/')[1] || '';
        let verStr = uaList.split(' ')[0] || '';
        let ver = isNaN(Number(verStr)) ? 0 : Number(verStr);
        let isIos = (/\(i[^;]+;( U;)? CPU.+Mac OS X/i).test(u);
        let isAndroid = (/Android/i).test(u) || (/Linux/i).test(u);
        let matchSafari = u.match(/Version\/(\d+)/) || [];
        let matchOs = u.match(/OS\s(\d+)/) || [];
        let matchAndroid = u.match(/Android\s(\d+)/) || [];
        return u ? {
            ios: isIos, // ios终端
            android: isAndroid, // android终端或者uc浏览器
            iPhone: (/iPhone/i).test(u), // 是否为iPhone
            osCheck (check, ver) {
                if (check === 'gt') {
                    return matchOs[1] > ver || matchSafari[1] > ver;
                } else if (check === 'lt') {
                    return matchOs[1] < ver || matchSafari[1] < ver;
                } else if (check === 'gte') {
                    return matchOs[1] >= ver || matchSafari[1] >= ver;
                } else if (check === 'lte') {
                    return matchOs[1] <= ver || matchSafari[1] <= ver;
                }
            },
            androidCheck (check, ver) {
                if (check === 'gt') {
                    return matchAndroid[1] && matchAndroid[1] > ver;
                } else if (check === 'lt') {
                    return matchAndroid[1] && matchAndroid[1] < ver;
                } else if (check === 'gte') {
                    return matchAndroid[1] && matchAndroid[1] >= ver;
                } else if (check === 'lte') {
                    return matchAndroid[1] && matchAndroid[1] <= ver;
                }
            },
            ios9: (/iPhone OS\ 9_/i).test(u),
            iPad: (/iPad/i).test(u), // 是否iPad
            bili: (/bili/i).test(u),
            biliVer: ver
        } : {};
    })(),
    getScrollTop(element = window) {
        if (element === window) {
            return Math.max(window.pageYOffset || 0, window.document.documentElement.scrollTop || window.document.body.scrollTop);
        } else {
            // @ts-ignore
            return element.scrollTop;
        }
    },
    jumpToTop (scrollTop = 0) {
        if (document.documentElement.scrollTop !== 0) {
            document.documentElement.scrollTop = scrollTop;
        } else {
            document.body.scrollTop = scrollTop;
        }
    }
};

const storage = {
    support: (function () {
        try {
            window.localStorage.setItem('storage', '');
            window.localStorage.removeItem('storage');
        } catch (e) {
            if (e.name === 'SECURITY_ERR' || e.name === 'QuotaExceededError') {
                console.warn('Warning: localStorage isn\'t enabled. Please confirm browser cookie or privacy option');
            }
            return false;
        }
        return true;
    })(),
    get (key) {
        if (this.support) {
            return window.localStorage.getItem(key);
        } else {
            return Util.cookie(key);
        }
    },
    set (key, value) {
        if (this.support) {
            window.localStorage.setItem(key, value);
        } else {
            Util.cookie(key, value);
        }
    }
};

/**
 * 通用的浏览器检测的模块
 * @module browser
 */
const getVersion = (u) => {
    u = u === undefined ? window.navigator.userAgent : u;
    let uaList = u.split('BiliApp/')[1] || '';
    let verStr = uaList.split(' ')[0] || '';
    let ver = isNaN(Number(verStr)) ? 0 : Number(verStr);
    let isIos = (/\(i[^;]+;( U;)? CPU.+Mac OS X/i).test(u);
    let isAndroid = (/Android/i).test(u) || (/Linux/i).test(u);
    return u ? {
        mobile: (/AppleWebKit.*Mobile.*/i).test(u), // 是否为移动终端
        ios: isIos, // ios终端
        android: isAndroid, // android终端或者uc浏览器
        windowsPhone: (/Windows Phone/i).test(u), // Windows Phone
        iPhone: (/iPhone/i).test(u), // 是否为iPhone或者QQHD浏览器
        ios9: (/iPhone OS\ 9_/i).test(u),
        iPad: (/iPad/i).test(u), // 是否iPad
        webApp: !(/Safari/i).test(u), // 是否web应该程序，没有头部与底部
        microMessenger: (/MicroMessenger/i).test(u), // 是否为微信
        weibo: (/Weibo/i).test(u), // 是否为微博
        uc: (/UCBrowser/i).test(u), // 是否为UC
        qq: (/MQQBrowser/i).test(u), // 是否为QQ浏览器
        baidu: (/Baidu/i).test(u), // 是否为百度浏览器
        mqq: (/QQ\/([\d\.]+)/i).test(u), // 是否为手机QQ
        mBaidu: (/baiduboxapp/i).test(u), // 是否为手机百度
        iqiyi: (/iqiyi/i).test(u),
        qqLive: (/QQLive/i).test(u),
        safari: (/Safari/i).test(u),
        youku: (/youku/i).test(u),
        ie: (/MSIE/i).test(u) || (/Trident/i).test(u),
        edge: (/Edge/i).test(u),
        bili: (/bili/i).test(u),
        biliVer: ver
    } : {};
}

Util.storage = storage;

export default Util;
