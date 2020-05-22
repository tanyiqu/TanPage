var searsh_bar_background;
var searsh_bar_margin_top;

// 加载配置信息
(function () {
    chrome.storage.sync.get(null, (res) => {
        // 获取配置
        searsh_bar_background = res.searsh_bar_background;
        searsh_bar_margin_top = res.searsh_bar_margin_top;

        // 加载配置
        initPage();

    });
})()


// 加载配置
function initPage() {
    // 配置样式
    initApperance();
    // 添加事件
    initLinstener();
}


// 配置样式
function initApperance() {
    console.log("加载样式");
    // 设置背景色
    document.querySelector(".cgEngine").style.background = searsh_bar_background;
    document.querySelector(".inputBar").style.background = searsh_bar_background;
    document.querySelector(".searshBtn").style.background = searsh_bar_background;

    // 设置搜索框位置
    document.querySelector(".searsh").style.top = searsh_bar_margin_top;
}

// 添加事件
function initLinstener() {
    // console.log("加载事件");
    var searsh = document.querySelector(".searsh");

    searsh.addEventListener("submit", subb);
    // console.log(searsh)
}


function subb() {
    document.querySelector(".searsh").action = "http://www.baidu.com/s";
}