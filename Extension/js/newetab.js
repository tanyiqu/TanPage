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
    // 设置背景色
    document.querySelector(".cgEngine").style.background = searsh_bar_background;
    document.querySelector(".inputBar").style.background = searsh_bar_background;
    document.querySelector(".searshBtn").style.background = searsh_bar_background;

    // 设置搜索框位置
    document.querySelector(".searsh").style.top = searsh_bar_margin_top;
}