// 做初始化，先存入初始数据
// 检查有没有存入过
chrome.storage.sync.get('first', (res) => {
    // 如果first没有数据，就是首次打开，如果有数据什么都不做
    console.log('res：' + res.first);
    if (res.first !== "first") {
        init();
    }
});

// 初始化
function init() {
    // 做初始化
    console.log('初始化')
    // 写入初始信息
    chrome.storage.sync.set({ first: 'first' });

    //默认搜索引擎
    chrome.storage.sync.set({ engine: 0 });
    chrome.storage.sync.set({ default_engine_url: "http://www.baidu.com/s" });
    chrome.storage.sync.set({ default_engine_name: "wd" });

    // 搜索框按钮
    chrome.storage.sync.set({ search_bar_background: 'rgba(255,255,255,.9)' });
    // 搜索框距离上面高度
    chrome.storage.sync.set({ search_bar_margin_top: '220px' });

    // 默认书签
    chrome.storage.sync.set({ bookmarks: [["https://www.baidu.com", "百度", "百度搜索"], ["https://www.bilibili.com/", "Bili", "哔哩哔哩"]] });

}


// 添加使用默认搜索引擎搜索
chrome.contextMenus.create({
    title: '默认引擎搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function (params) {

        chrome.storage.sync.get(null, (res) => {
            // 获取默认搜索引擎
            var default_engine_url = res.default_engine_url;
            var default_engine_name = res.default_engine_name;
            chrome.tabs.create({
                url: default_engine_url + "?" + default_engine_name + "=" + encodeURI(params.selectionText)
            });
        });
    }
});

