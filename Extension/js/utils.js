/**
 * 字符串格式化辅助
 */
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

/**
 * 判断字符串是否为空
 */
String.prototype.isEmpty = function () {
    return (this.trim() == "");
}

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
    }
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
    }
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
    }
}


