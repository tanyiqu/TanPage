
var searsh_bar_background;
var searsh_bar_margin_top;
var engine;
var bookmarks;

// 出现的提示的li集合
var arr = [];
// 当前被选中的li的序号 没有选中就为0
var currSelectLiNum = 0;
// 当前被选中的li
var currSelectLi = null;

// 输入框
// var input = document.querySelector('.inputBar');
var input = $('.inputBar')[0];

// 搜索建议ul
// var sugList = document.getElementById('sugList');
var sugList = $('#sugList')[0];

// 切换引擎按钮
// var cgEngineBtn = document.querySelector(".cgEngine");
var cgEngineBtn = $(".cgEngine")[0];

// 切换引擎按钮上面的图片
// var cgEngineImg = document.querySelector("#cgEngineImg");
var cgEngineImg = $("#cgEngineImg")[0];

// 切换搜索引擎时的所有所搜引擎列表
// var engineList = document.getElementById('engineList');
var engineList = $('#engineList')[0];

// 设置框
// var setting = document.querySelector('.setting');
var setting = $('.setting')[0];

// 书签列表
// var bookmark = document.querySelector('.bookmark');
var bookmark = $('.bookmark')[0];

sugList.style.display = 'none';
engineList.style.display = 'none';
setting.style.display = "none";

// 加载配置信息
(function () {
    chrome.storage.sync.get(null, (res) => {
        // 获取配置
        searsh_bar_background = res.searsh_bar_background;
        searsh_bar_margin_top = res.searsh_bar_margin_top;
        engine = res.engine;
        bookmarks = res.bookmarks;
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
    // 加载设置信息
    initSetting();
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
    var html = "";
    var len = engines.length;
    for (var i = 0; i < len; i++) {
        html += '<div class="engineItem" id="engineItem{0}"><i title="临时搜索" id="tmp{1}" class="tmp"></i><img src="../imgs/engines/{2}.png"><p>{3}</p></div>'.format(i + 1, i + 1, i, engines[i].title);
    }
    html += '<div class="engineItem" id="engineItemAdd"><img src="../imgs/engines/add.png"><p>自定义</p></div>';
    engineList.innerHTML = html;

    // 将设置窗口高度设置为当前高度
    var height = window.innerHeight;
    setting.style.height = height + "px";


    // 加载书签内容
    html = '';
    len = bookmarks.length;
    for (var i = 0; i < len; i++) {
        html += '<a href="{0}"><p>{1}</p><span>{2}</span></a>'.format(bookmarks[i][0], bookmarks[i][1], bookmarks[i][2]);
    }
    // 如果内容没有超过16个
    if (len < 16) {
        html += '<a><p class="addBookMark" id="addBookMark"></p><span>添加</span></a>';
    }
    bookmark.innerHTML = html;
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
            chrome.storage.sync.set({ default_engine_url: engines[n].url });
            chrome.storage.sync.set({ default_engine_name: engines[n].name });
            engine = n;
            cgEngineImg.src = "../imgs/engines/" + engine + ".png";

            // 弹出提示
            toastr.options.positionClass = 'toast-top-center';
            toastr.options.timeOut = "1500";
            toastr.success('已切换为：' + engines[n].title);
        });
    }

    // 临时搜索
    for (var i = 0; i < len; i++) {
        const n = i;
        id = "tmp" + (n + 1);
        var tmpItem = document.getElementById(id);
        tmpItem.addEventListener("click", (event) => {
            console.log(n);

            // 暂时改变图标和搜索引擎，页面刷新回复正常
            engine = n;
            cgEngineImg.src = "../imgs/engines/" + n + ".png";

            engineList.style.display = 'none';

            // 弹出提示
            toastr.options.positionClass = 'toast-top-center';
            toastr.options.timeOut = "1500";
            toastr.success('临时切换为：' + engines[n].title + "<br/>刷新后失效");

            // 阻止事件向下传递
            event.stopPropagation();
        });
    }

    // 打开设置
    document.querySelector(".showSetting").addEventListener("click", () => {
        setting.style.display = "block";
    });
    // 关闭设置
    document.getElementById("closeSetting").addEventListener("click", () => {
        setting.style.display = "none";
    });
}


// 提交表单,动态切换搜索引擎等
function onSearsh() {
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


// 加载设置信息
function initSetting() {
    document.querySelector("#searsh_bar_margin_top").value = searsh_bar_margin_top;
    document.querySelector("#searsh_bar_background").value = searsh_bar_background;
}