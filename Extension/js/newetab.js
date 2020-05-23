// 搜索引擎
// 0 百度
// 1 多吉
// 2 必应
// 3 搜狗
// 4 360
// 5 谷歌
// 6 BiliBili
// 7 淘宝
// 8 京东

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

var searsh_bar_background;
var searsh_bar_margin_top;
var engine;

// 出现的提示的li集合
var arr = [];
// 当前被选中的li的序号 没有选中就为0
var currSelectLiNum = 0;
// 当前被选中的li
var currSelectLi = null;


var input = document.querySelector('.inputBar');
var sugList = document.getElementById('sugList');

var cgEngineBtn = document.querySelector(".cgEngine");
var cgEngineImg = document.querySelector("#cgEngineImg");

var engineList = document.getElementById('engineList');

sugList.style.display = 'none';
engineList.style.display = 'none';

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

    // 默认搜索引擎图标
    cgEngineImg.src = "../imgs/engines/" + engine + ".png";
    // 加载搜索引擎列表
    // <div class="engineItem"><img src="../imgs/engines/0.png"><p>百度</p></div>
    var html = "";
    var len = engines.length;
    for (var i = 0; i < len; i++) {
        html += '<div class="engineItem" id="engineItem{0}"><img src="../imgs/engines/{1}.png"><p>{2}</p></div>'.format(i + 1, i, engines[i].title);
    }
    html += '<div class="engineItem" id="engineItemAdd"><img src="../imgs/engines/add.png"><p>自定义</p></div>';
    engineList.innerHTML = html;


}


// 添加事件
function initLinstener() {
    // 提交表单
    document.querySelector(".searsh").addEventListener("submit", onSearsh);

    // 输入框文本改变
    document.querySelector(".inputBar").addEventListener("input", onInput);

    // 切换搜索引擎按钮
    var len = engines.length;
    for (var i = 0; i < len; i++) {
        const n = i;
        id = "engineItem" + (n + 1);
        var engineItem = document.getElementById(id);
        engineItem.addEventListener("click", () => {
            // 切换搜索引擎
            chrome.storage.sync.set({ engine: n });
            engine = n;
            cgEngineImg.src = "../imgs/engines/" + engine + ".png";
        });
    }
}


// 提交表单,动态切换搜索引擎等
function onSearsh() {
    // engine = 2;
    // chrome.storage.sync.set({ engine: 2 });
    document.querySelector(".searsh").action = engines[engine].url;
    document.querySelector(".inputBar").name = engines[engine].name;
}


// 输入框文本改变
function onInput(event) {
    var txt = event.target.value;
    engineList.style.display = 'none';
    refreshState();
    var httpRequest = new XMLHttpRequest();
    // 使用百度的搜索建议
    httpRequest.open('GET', 'http://suggestion.baidu.com/su?wd=' + txt, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var json = httpRequest.responseText;
            arr = JSON.parse(json.match("\\[.*?\\]"));
            refreshTips();
        }
    };
}


// 刷新建议列表
function refreshTips() {
    // 如果没有数据
    if (!arr || !arr.length) {
        sugList.style.display = 'none';
        return;
    }
    var len = arr.length;
    //最多显示7条
    if (len > 7) {
        len = 7;
        var arr2 = [];
        for (var i = 0; i < 7; i++) {
            arr2.push(arr[i]);
        }
        arr = arr2;
    }
    var html = '';
    // 添加li
    for (var i = 0; i < len; i++) {
        var id = 'sug' + (i + 1);
        var src = "../imgs/{0}.png".format(i + 1);
        html += '<li class="sug" id="{0}"><div><img src="{1}" /></div>{2}</li>'.format(id, src, arr[i]);
    }
    sugList.innerHTML = html;

    // 添加点击事件
    for (var i = 0; i < len; i++) {
        var id = '#sug' + (i + 1);
        const n = i;
        document.querySelector(id).addEventListener("click", () => {
            window.location.href = engines[engine].url + "?" + engines[engine].name + "=" + self.arr[n];
        });
    }

    sugList.style.display = 'block';

}


function refreshState() {
    arr = [];
    currSelectLiNum = 0;
    currSelectLi = null;
}


// 键盘事件
document.onkeydown = chang_page;
function chang_page(event) {
    // 37 左
    // 38 上
    // 39 右
    // 40 下
    var len = arr.length;
    var code = event.keyCode;
    // 判断提示框是否在显示
    var show = sugList.style.display;
    if (show == 'none') {
        return;
    }

    // 按下了上/下
    if (code == 38 || code == 40) {
        //如果没有被选中
        code = code - 39;
        //上 -1
        //下 1
        // 找到当前被选择的li的编号
        currSelectLiNum += code;
        if (currSelectLiNum == 0 || currSelectLiNum == -1) {
            currSelectLiNum = len;
        }
        if (currSelectLiNum == len + 1) {
            currSelectLiNum = 1;
        }
        // 根据编号，找到这个li
        var id = "sug" + currSelectLiNum;
        currSelectLi = document.getElementById(id);
        // 改变input中显示的内容
        var sugtxt = currSelectLi.innerText;
        input.value = sugtxt;

        // 改变它的背景色
        var list = document.querySelectorAll(".sug")
        for (var i = 0; i < list.length; i++) {
            list[i].style.background = "#fff";
        }
        currSelectLi.style.background = "#ededed";
    }
}


// 监听点击事件
document.addEventListener("click", function (e) {
    // 如果点击的是input，直接返回，否则点击其他就提示框他消失
    if (e.target == input) {
        engineList.style.display = 'none';
        return;
    }
    if (e.target != sugList) {
        sugList.style.display = "none";

    }

    // 点击切换搜索引擎，这里再监听是为了点击外部消失
    if (e.target == cgEngineBtn || e.target == cgEngineImg) {
        if (engineList.style.display == 'block') {
            engineList.style.display = 'none';
        }
        else {
            engineList.style.display = 'block';
        }
    } else {
        engineList.style.display = 'none';
    }
});

