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
 *
 * 支持两种用法：
 *  - 数字占位：  "{0}-{1}".format("a", "b")          -> "a-b"
 *  - 命名占位：  "{name}-{age}".format({name:'a', age:1}) -> "a-1"
 */
String.prototype.format = function (args) {
    let result = this;
    if (arguments.length === 0) {
        return result;
    }
    // 对象模式：format({ key: value })
    if (arguments.length === 1 && typeof (args) === "object") {
        for (let key in args) {
            if (args[key] !== undefined) {
                // 转义花括号，避免被当作正则元字符
                let reg = new RegExp("\\{" + key + "\\}", "g");
                result = result.replace(reg, args[key]);
            }
        }
        return result;
    }
    // 数字模式：format(arg0, arg1, ...)
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) {
            let reg = new RegExp("\\{" + i + "\\}", "g");
            result = result.replace(reg, arguments[i]);
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
    let x = 0, y = 0;
    while (el.offsetParent !== null) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
    }
    return { x: x, y: y };
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


function saveJSON(data, filename) {
    if (!data) {
        alert('保存的数据为空');
        return;
    }
    if (!filename)
        filename = 'conf.json'
    if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 4)
    }
    var blob = new Blob([data], { type: 'text/json' }),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a')
    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}