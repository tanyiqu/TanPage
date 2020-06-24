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
 * 获取e1在浏览器中的位置（坐标）
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
 * 时间戳转日期
 * @param {*} timestamp 时间戳
 */
function formatDate(timestamp) {
    var date = new Date(timestamp);
    var YY = date.getFullYear() + '-';
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return YY + MM + DD + " " + hh + mm + ss;
}