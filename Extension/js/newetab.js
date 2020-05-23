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
    title: "Bilibili",
    url: "https://search.bilibili.com/all",
    name: "keyword"
}
];

var searsh_bar_background;
var searsh_bar_margin_top;
var engine;

// 加载配置信息
(function () {
    chrome.storage.sync.get(null, (res) => {
        // 获取配置
        searsh_bar_background = res.searsh_bar_background;
        searsh_bar_margin_top = res.searsh_bar_margin_top;
        engine = res.engine;
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
    // 提交表单
    document.querySelector(".searsh").addEventListener("submit", onSearsh);
}

// 提交表单,动态切换搜索引擎等
function onSearsh() {
    // engine = 6;
    document.querySelector(".searsh").action = engines[engine].url;
    document.querySelector(".inputBar").name = engines[engine].name;
}