/**
 * 裁剪搜索引擎图标
 */

var myCanvas = document.getElementById("cut-logo-canvas");
var ctx = myCanvas.getContext("2d");

// 加载窗口
function loadCutEngineLogo(imgUrl) {
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
        refreshPreview(156, 109, 200, 200);
    }
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
}



// 拖动
var frame = document.getElementById('frame');
var dragging = false;
var frameOffX = 100;
var frameOffY = 100;


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

var mouseA;
var Axis;
var axis;
var frameA;

frame.onmousedown = function (e) {
    dragging = true;

    // frame距离浏览器左上角位置
    Axis = getPosition(frame);
    console.log('frame距离浏览器左上角位置', Axis);

    // 鼠标距离frame左上角的位置
    axis = {
        x: e.x - Axis.x,
        y: e.y - Axis.y,
    };
    console.log('鼠标距离frame左上角的位置', axis);


};

document.onmousemove = function (e) {
    if (dragging) {
        var canvasOff = getPosition(myCanvas);
        var canvasA = {
            x: e.x - canvasOff.x,
            y: e.y - canvasOff.y
        };

        var x = (canvasA.x - axis.x + 16);
        var y = (canvasA.y - axis.y + 16);



        frame.style.left = x + 'px';
        frame.style.top = y + 'px';


        // 实时刷新preview
        refreshPreview(x, y, 200, 200);

    }
};

document.onmouseup = function (e) {
    if (dragging) {
        dragging = false;
    }
};


var pCtx = document.getElementById('previewCanvas').getContext('2d');
var pImg = new Image();

pImg.crossOrigin = 'anonymous';

var c = document.createElement('canvas');
c.width = 200;
c.height = 200;
var cC = c.getContext('2d');

/**
 * 刷新preview图像
 * @param {*} x frame的x偏移
 * @param {*} y y 偏移
 * @param {*} w frame的宽
 * @param {*} h frame的高
 */
function refreshPreview(x, y, w, h) {
    var data = ctx.getImageData(x, y, w, h);

    pImg.onload = function () {
        pCtx.clearRect(0, 0, 100, 100);
        pCtx.drawImage(pImg, 0, 0, w, h, 0, 0, 100, 100);
    };
    cC.putImageData(data, 0, 0);
    dataUrl = c.toDataURL('image/png', 1);
    pImg.src = dataUrl;
}




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