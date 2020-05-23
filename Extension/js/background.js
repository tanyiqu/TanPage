const engines = [{
    title: "百度",
    url: "http://www.baidu.com/s",
    name: "wd"
}, {
    title: "多吉搜索",
    url: "https://www.dogedoge.com/results",
    name: "q"
}, {
    title: "必应",
    url: "https://cn.bing.com/search",
    name: "q"
}, {
    title: "搜狗",
    url: "https://www.sogou.com/sogou",
    name: "query"
}, {
    title: "360",
    url: "https://www.so.com/s",
    name: "q"
}, {
    title: "谷歌",
    url: "",
    name: ""
}, {
    title: "BiliBili",
    url: "https://search.bilibili.com/all",
    name: "keyword"
}, {
    title: "淘宝",
    url: "https://s.taobao.com/search",
    name: "q"
}, {
    title: "京东",
    url: "https://search.jd.com/Search",
    name: "keyword"
}
];

// 做初始化，先存入初始数据
// 检查有没有存入过
chrome.storage.sync.get('first', (res) => {
    // 如果first没有数据，就是首次打开，如果有数据什么都不做
    console.log('res：' + res.first);
    if (res.first != "first") {
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

    // 搜索框按钮
    chrome.storage.sync.set({ searsh_bar_background: 'rgba(255,255,255,.9)' });
    // 搜索框距离上面高度
    chrome.storage.sync.set({ searsh_bar_margin_top: '220px' });

}

// 添加使用默认搜索引擎搜索
chrome.contextMenus.create({

    title: '默认引擎搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function (params) {

        chrome.storage.sync.get("engine", (res) => {
            // 获取默认搜索引擎
            var engine = res.engine;
            chrome.tabs.create({
                url: engines[engine].url + "?" + engines[engine].name + "=" + encodeURI(params.selectionText)
            });
        });
    }
});

