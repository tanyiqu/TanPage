// 做初始化，先存入初始数据
// 检查有没有存入过
console.log('扩展执行');
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
    chrome.storage.sync.set({ default_engine_url: "http://www.baidu.com/s?wd=%s" });

    // 默认搜索引擎
    chrome.storage.sync.set({
        engines:
            [
                {
                    name: "百度",
                    url: "http://www.baidu.com/s?wd=%s",
                    imgurl: "../imgs/egs/bd.png"
                },
                {
                    name: "多吉搜索",
                    url: "https://www.dogedoge.com/results?q=%s",
                    imgurl: "../imgs/egs/djss.png"
                }
            ]
    });

    // 默认书签
    chrome.storage.sync.set({
        bookmarks: [
            {
                name: "百度搜索",
                lbl: "百度",
                url: "https://www.baidu.com"
            },
            {
                name: "哔哩哔哩",
                lbl: "Bili",
                url: "https://www.bilibili.com/"
            }
        ]
    });

}


// 添加使用默认搜索引擎搜索
chrome.contextMenus.create({
    title: '默认引擎搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function (params) {

        chrome.storage.sync.get(null, (res) => {
            // 获取默认搜索引擎
            var default_engine_url = res.default_engine_url;
            chrome.tabs.create({
                url: default_engine_url + "?" + default_engine_name + "=" + encodeURI(params.selectionText)
            });
        });
    }
});

