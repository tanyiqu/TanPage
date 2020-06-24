/**
 * 谷歌扩展本地存储
 * @param kv 键值
 */
function ChromeLocalSet(kv, cb) {
    // noinspection JSUnresolvedVariable
    chrome.storage.local.set(kv, cb);
}


/**
 * 字符串格式化辅助
 */
String.prototype.format = function (args) {
    let result = this;
    if (arguments.length > 0) {
        if (arguments.length === 1 && typeof (args) == "object") {
            for (let key in args) {
                if (args.key !== undefined) {
                    let reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args.key);
                }
            }
        } else {
            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) {
                    let reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};


/**
 * 判断字符串是否为空
 */
String.prototype.isEmpty = function () {
    return (this.trim() === "");
};


/**
 * 封装toast提示
 */
function Toast() {
    this.position = 'toast-top-right';
    this.timeOut = '1500';
}
initToast();
function initToast() {
    Toast.success = function (msg, position, timeOut) {
        if (!position) {
            position = this.position;
        }
        if (!timeOut) {
            timeOut = this.timeOut;
        }
        toastr.options.positionClass = position;
        toastr.options.timeOut = timeOut;
        toastr.success(msg);
    };
    Toast.error = function (msg, position, timeOut) {
        if (!position) {
            position = this.position;
        }
        if (!timeOut) {
            timeOut = this.timeOut;
        }
        toastr.options.positionClass = position;
        toastr.options.timeOut = timeOut;
        toastr.error(msg);
    };
    Toast.info = function (msg, position, timeOut) {
        if (!position) {
            position = this.position;
        }
        if (!timeOut) {
            timeOut = this.timeOut;
        }
        toastr.options.positionClass = position;
        toastr.options.timeOut = timeOut;
        toastr.info(msg);
    };
}


// 自定义jquery动画
jQuery.fn.slideLeftHide = function (speed, callback) {
    this.animate({
        width: "hide",
        paddingLeft: "hide",
        paddingRight: "hide",
        marginLeft: "hide",
        marginRight: "hide"
    }, speed, callback);
};
jQuery.fn.slideLeftShow = function (speed, callback) {
    this.animate({
        width: "show",
        paddingLeft: "show",
        paddingRight: "show",
        marginLeft: "show",
        marginRight: "show"
    }, speed, callback);
};


/**
 * 获取e1在浏览器中的位置
 * @param {*} el 
 */
function getPosition(el) {
    _x = 0, _y = 0;
    while (el.offsetParent !== null) {
        _x += el.offsetLeft;
        _y += el.offsetTop;
        el = el.offsetParent;
    }
    return { x: _x, y: _y };
}


/**
 * 实现StringBuilder
 */
function StringBuilder() {
    this._stringArray = new Array();
    StringBuilder.prototype.append = function (str) {
        this._stringArray.push(str);
    }
    StringBuilder.prototype.toString = function (joinGap) {
        return this._stringArray.join(joinGap);
    }
}


/**
 * 分割长的字符串
 * @param {*} str 
 */
function splitLongString(str) {
    strs = [];
    let len = str.length;
    // 计算能分割的次数
    let n = parseInt(len / 2048);
    let start = 0;
    let end = 2048;
    for (let i = 0; i < n; i++) {
        let tmp = str.slice(start, end);
        strs.push(tmp);
        start += 2048;
        end += 2048;
    }
    if (len % 2048 !== 0) {
        strs.push(str.slice(start));
    }
    return strs;
}


/**
 * 合并长的字符串
 * @param {*} strs 
 */
function mergeLongString(strs) {
    str = '';
    for (s in strs) {
        str += s;
    }
    return str;
}