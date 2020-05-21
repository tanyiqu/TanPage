// 加载配置信息
(function () {
    chrome.storage.sync.get(null, (res) => {
        var searsh_bar_background = res.searsh_bar_background;
        var searsh_bar_margin_top = res.searsh_bar_margin_top;

        console.log('searsh_bar_background ' + searsh_bar_background)
        console.log('searsh_bar_margin_top ' + searsh_bar_margin_top)
    });
})()