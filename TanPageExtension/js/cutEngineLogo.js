/**
 * 裁剪搜索引擎图标
 */

var myCanvas = document.getElementById("cut-logo-canvas");
var ctx = myCanvas.getContext("2d");

// 预览的canvasContext
var pCtx = document.getElementById('previewCanvas').getContext('2d');
// 预览的image
var pImg = new Image();
pImg.crossOrigin = 'anonymous';

// 临时的canvas
var c = document.createElement('canvas');
var cC = c.getContext('2d');

// 拖动
var frame = document.getElementById('frame');

// 正在拖动frame
var draggingFrame = false;
// 正在右下角拖拽缩放
var draggingResiseSE = false;

// frame距离浏览器左上角位置
var frameCoor;
// frame距离canvas左上角的距离
var frameToCanvasCoor;
// 鼠标的坐标
var mouseCoor;
// 鼠标距离frame左上角的位置
var coor;
// frame的宽高，默认200*200
var frameSize = {
    w: 200,
    h: 200
};

// 加载窗口
function loadCutEngineLogo(imgUrl) {
    console.log('加载cut');
    // 重置状态
    frameSize.w = 200;
    frameSize.h = 200;
    frame.style.width = '200px';
    frame.style.height = '200px';
    // frame居中
    ctx.clearRect(0, 0, 512, 418);
    var img = new Image();
    // 把框框调到居中的位置
    frame.style.left = (156 + 16) + 'px';
    frame.style.top = (109 + 16) + 'px';

    img.onload = () => {
        // 获取宽高比
        var w = img.width;
        var h = img.height;

        console.log('原始宽高', w, h);
        // 获取宽高比
        var d = w / h;
        var cW, cH, x, y;

        // 宽 大于 高
        if (d > 1) {
            cW = 512;
            cH = parseInt(cW / d);
            x = 0;
            y = (418 - cH) / 2;

        } else {
            cH = 418;
            cW = cH * d;
            y = 0;
            x = (512 - cW) / 2;
        }
        // 绘制
        ctx.drawImage(img, x, y, cW, cH);
        // 在中央绘制
        refreshPreview(156, 109, frameSize.w, frameSize.h);
    }
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
}



/**
 * 刷新preview图像
 * @param {*} x frame的x偏移
 * @param {*} y y 偏移
 * @param {*} w frame的宽
 * @param {*} h frame的高
 */
function refreshPreview(x, y, w, h) {
    c.width = w;
    c.height = h;
    // -16是因为有padding:16
    var data = ctx.getImageData(x - 16, y - 16, w, h);
    pImg.onload = function () {
        pCtx.clearRect(0, 0, 100, 100);
        pCtx.drawImage(pImg, 0, 0, w, h, 0, 0, 100, 100);
    };
    cC.putImageData(data, 0, 0);
    dataUrl = c.toDataURL('image/png', 1);
    pImg.src = dataUrl;
}

// 拖拽移动
frame.onmousedown = function (e) {
    draggingFrame = true;

    // frame距离浏览器左上角位置
    frameCoor = getPosition(frame);
    console.log('frame距离浏览器左上角位置', frameCoor);

    // 鼠标距离frame左上角的位置
    coor = {
        x: e.x - frameCoor.x,
        y: e.y - frameCoor.y,
    };
    console.log('鼠标距离frame左上角的位置', coor);
};

// 拖拽缩放-右下角
$('.drag-right-bottom').mousedown((e) => {
    draggingResiseSE = true;
    // 获取frame的坐标
    frameCoor = getPosition(frame);
    var canvasToBrowser = getPosition(document.getElementById('cut-logo-canvas'));
    console.log('frameCoor', frameCoor);

    // 获取frame距离canvas左上角的距离
    frameToCanvasCoor = {
        x: frameCoor.x - canvasToBrowser.x,
        y: frameCoor.y - canvasToBrowser.y
    }
    return false;
});

document.onmousemove = function (e) {
    if (draggingFrame) {
        var canvasOff = getPosition(myCanvas);
        var canvasA = {
            x: e.x - canvasOff.x,
            y: e.y - canvasOff.y
        };
        var x = (canvasA.x - coor.x + 16);
        var y = (canvasA.y - coor.y + 16);
        frame.style.left = x + 'px';
        frame.style.top = y + 'px';
        // 实时刷新preview
        refreshPreview(x, y, frameSize.w, frameSize.h);
    }

    // 拖拽缩放-右下角
    if (draggingResiseSE) {
        // 获取鼠标的坐标
        mouseCoor = {
            x: e.x,
            y: e.y
        };
        // 计算差值
        w = mouseCoor.x - frameCoor.x;
        h = mouseCoor.y - frameCoor.y;
        if (h > w) {
            w = h;
        }
        frameSize.w = w;
        frameSize.h = w;
        // 给frame重新设置大小,设置为正方形
        frame.style.width = w + 'px';
        frame.style.height = w + 'px';

        refreshPreview(frameToCanvasCoor.x + 16, frameToCanvasCoor.y + 16, frameSize.w, frameSize.h);
    }

};

document.onmouseup = function (e) {
    if (draggingFrame) {
        draggingFrame = false;
    }
    if (draggingResiseSE) {
        draggingResiseSE = false;
    }
};


// 确定按钮
$('#ensureCutEngineLogo').click(() => {


    $('#cutEngineLogoWindow').css('display', 'none');
    $('.shade').css('display', 'none');
});


// 取消按钮
$('#cancelCutEngineLogo').click(() => {
    $('#cutEngineLogoWindow').css('display', 'none');
    $('.shade').css('display', 'none');
});