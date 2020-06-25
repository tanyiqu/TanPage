// 做初始化，先存入初始数据
// 检查有没有存入过
console.log('扩展执行');
chrome.storage.local.get('first', (res) => {
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
    chrome.storage.local.set({ first: 'first' });

    //默认搜索引擎
    chrome.storage.local.set({ engine: 0 });
    chrome.storage.local.set({ default_engine_url: "http://www.baidu.com/s?wd=%s" });

    // 默认搜索引擎
    chrome.storage.local.set({
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
                },
                {
                    name: "必应",
                    url: "https://cn.bing.com/search?q=%s",
                    imgurl: "../imgs/egs/by.png"
                },
                {
                    name: "谷歌搜索",
                    url: "https://www.google.com/search?q=%s",
                    imgurl: "../imgs/egs/ggss.png"
                },
                {
                    name: "搜狗搜索",
                    url: "https://www.sogou.com/sogou?query=%s",
                    imgurl: "../imgs/egs/sgss.png"
                },
                {
                    name: "360",
                    url: "https://www.so.com/s?q=%s",
                    imgurl: "../imgs/egs/360.png"
                },
                {
                    name: "bilibili",
                    url: "https://search.bilibili.com/all?keyword=%s",
                    imgurl: "../imgs/egs/blbl.png"
                },
                {
                    name: "淘宝",
                    url: "https://s.taobao.com/search?q=%s",
                    imgurl: "../imgs/egs/tb.png"
                },
                {
                    name: "京东",
                    url: "https://search.jd.com/Search?keyword=%s",
                    imgurl: "../imgs/egs/jd.png"
                },
                {
                    name: "腾讯视频",
                    url: "https://v.qq.com/x/search/?q=%s",
                    imgurl: "../imgs/egs/txsp.png"
                },
                {
                    name: "AcFun",
                    url: "https://www.acfun.cn/search?keyword=%s",
                    imgurl: "../imgs/egs/acfun.png"
                },
                {
                    name: "Iconfont",
                    url: "https://www.iconfont.cn/search/index?q=%s",
                    imgurl: "../imgs/egs/iconfont.png"
                },
                {
                    name: "Yandex",
                    url: "https://yandex.com/search/?text=%s",
                    imgurl: "../imgs/egs/yandex.png"
                },
                {
                    name: "CSDN",
                    url: "https://so.csdn.net/so/search/s.do?q=%s",
                    imgurl: "../imgs/egs/csdn.png"
                },
                {
                    name: "GitHub",
                    url: "https://github.com/search?q=%s",
                    imgurl: "../imgs/egs/github.png"
                },
                {
                    name: "百度百科",
                    url: "https://baike.baidu.com/search?word=%s",
                    imgurl: "../imgs/egs/bdbk.png"
                }
            ]
    });

    // 默认书签
    chrome.storage.local.set({
        bookmarks: [
            {
                name: "历史记录",
                lbl: "History",
                url: "../pages/history.html"
            },
            {
                name: "哔哩哔哩",
                lbl: "Bili",
                url: "https://www.bilibili.com/"
            }
        ]
    });

    // 添加背景设置，因为data比较大，就单独进行存放
    chrome.storage.local.set({
        bg_setting: {
            // 背景模式
            bg_mode: 0,
            // 本地图片背景时的dataurl
            bg_localdata: "dataurl",
            // 笼罩
            bg_white_shade: 5,
            bg_black_shade: 20,
            // 模糊度
            bg_blurry: 5,
            // 背景大小限制
            bg_size_limit: 3145728,
            // 自定义壁纸源
            bg_custom_url: "https://api.sunweihu.com/api/sjbz/api.php",
            // 壁纸保存格式
            bg_save_type: "image/png"
        },
    });

    // 页眉设置，乱七八糟的设置加载这里面
    chrome.storage.local.set({
        page_setting: {
            // 搜索目标页眉
            search_target_self: true,
            // 书签打开目标页面
            bookmark_target_self: false
        }
    });

}


// 添加使用默认搜索引擎搜索
chrome.contextMenus.create({
    title: '默认引擎搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function (params) {

        chrome.storage.local.get(null, (res) => {
            // 获取默认搜索引擎
            var default_engine_url = res.default_engine_url;
            chrome.tabs.create({
                // url: default_engine_url + "?" + default_engine_name + "=" + encodeURI(params.selectionText)
                url: default_engine_url.replace('%s', encodeURI(params.selectionText))
            });
        });
    }
});

