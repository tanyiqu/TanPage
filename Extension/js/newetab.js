var searsh_bar_background;
var searsh_bar_margin_top;
var engine;
var bookmarks;
var localSettings;

// 出现的提示的li集合
var arr = [];
// 当前被选中的li的序号 没有选中就为0
var currSelectLiNum = 0;
// 当前被选中的li
var currSelectLi = null;

// 当前正在编辑书签
var editingBookmarks = false;

// 输入框
var input = $('.inputBar');

// 搜索建议ul
var sugList = $('#sugList');

// 切换引擎按钮
var cgEngineBtn = $(".cgEngine");
var cgEngineImg = $("#cgEngineImg");

// 切换搜索引擎时的所有所搜引擎列表
var engineList = $('#engineList');

// 设置框
var setting = $('.setting');

// 书签列表
var bookmark = $('.bookmark');

// 拖动书签时的残影
var bmShadow = $('#bmShadow');

// 正在拖拽书签
var draggingBm = false;
// 当前正在拖动的书签下标
var currengDraggingBm = -1;
// var x, y;
// 书签的宽高
var bmW, bmH;

// 加载配置信息，入口函数
(function () {
    chrome.storage.sync.get(null, (res) => {
        // 获取配置
        searsh_bar_background = res.searsh_bar_background;
        searsh_bar_margin_top = res.searsh_bar_margin_top;
        engine = res.engine;
        bookmarks = res.bookmarks;
        localSettings = res.settings;
        // 加载配置
        initPage();
    });
})()


// 加载配置
function initPage() {
    initWidget();
    loadWidget();
}

/**
 * 初始化控件
 * 包括隐藏初始不显示的控件，
 * 根据配置加载控件的颜色、位置等
 */
function initWidget() {
    // 默认显示为隐藏的dom
    sugList.css('display', 'none');
    engineList.css('display', 'none');
    setting.css('display', 'none');
    bmShadow.css('display', 'none');

    $('#addBookmarkWd').css('display', 'none');
    // 根据配置加载样式
    console.log("加载样式");
    // 设置背景色
    $(".cgEngine").css('background', searsh_bar_background);
    input.css("background", searsh_bar_background);
    $('.searshBtn').css('background', searsh_bar_background);

    // 设置搜索框位置
    $(".searsh").css('top', searsh_bar_margin_top);
}

/**
 * 加载控件
 * 包括添加各种控件的行为、监听等
 */
function loadWidget() {
    // 加载搜索引擎
    loadEngine();

    // 加载书签
    loadBookmarks();

    // 加载设置窗口
    loadSetting();
}

/**
 * 加载搜索引擎
 */
function loadEngine() {
    // 默认搜索引擎图标
    cgEngineImg.attr('src', "../imgs/engines/" + engine + ".png");

    // 加载搜索引擎列表
    var html = "";
    var len = engines.length;
    for (var i = 0; i < len; i++) {
        html += '<div class="engineItem" id="engineItem{0}"><i title="临时搜索" id="tmp{1}" class="tmp"></i><img src="../imgs/engines/{2}.png"><p>{3}</p></div>'.format(i + 1, i + 1, i, engines[i].title);
    }
    html += '<div class="engineItem" id="engineItemAdd"><img src="../imgs/engines/add.png"><p>自定义</p></div>';
    engineList.html(html);

    // 提交搜索
    $(".searsh").submit(onSearsh);

    // 切换搜索引擎按钮
    var len = engines.length;
    for (var i = 0; i < len; i++) {
        const n = i;
        id = "#engineItem" + (n + 1);
        // 查询到标签后添加点击事件
        $(id).click(() => {
            chrome.storage.sync.set({ engine: n });
            chrome.storage.sync.set({ default_engine_url: engines[n].url });
            chrome.storage.sync.set({ default_engine_name: engines[n].name });
            engine = n;
            cgEngineImg.attr('src', "../imgs/engines/" + engine + ".png")

            // 弹出提示
            Toast.success('已切换为：' + engines[n].title, 'toast-top-center');
        });

    }

    // 添加自定义搜索引擎按钮
    $('#engineItemAdd').click(() => {
        Toast.info('暂时不能自定义');
    });

    // 临时搜索
    for (var i = 0; i < len; i++) {
        const n = i;
        $("#tmp" + (n + 1)).click(() => {
            console.log('临时切换', n);

            // 暂时改变图标和搜索引擎，页面刷新回复正常
            engine = n;
            cgEngineImg.attr('src', "../imgs/engines/" + n + ".png");
            engineList.css('display', 'none');

            // 弹出提示
            Toast.success(engines[n].title + "<br/>刷新后失效", 'toast-top-center');
            // 阻止事件向下传递
            event.stopPropagation();
        });
    }

    // 输入框文本改变时添加搜索建议
    input.on('input', onInput);
}

/**
 * 加载书签
 */
function loadBookmarks() {
    // 显示书签
    refreshBookmarks();

    // 右键进入编辑书签
    $('.bookmark').on('contextmenu', (e) => {
        e.preventDefault();
        editBookmarks(true);
    });

    // 取消添加书签按钮
    $('.cancelAddBookmark').click(() => {
        $('.shade').css('display', 'none');
        $('#addBookmarkWd').css('display', 'none');
    });

}

/**
 * 加载设置窗口
 */
function loadSetting() {
    // 打开设置
    $(".showSetting").click(() => {
        setting.css({
            // 动态设置高度
            'height': window.innerHeight + "px",
            'display': 'block'
        });
    });
    // 关闭设置
    $("#closeSetting").click(() => {
        setting.css('display', 'none');
        // 恢复保存前的设置

    });


    // 背景透明度拖动条改变
    $("#bgOpacity").bind('input porpertychange', (e) => {
        var value = e.target.value;
        var opacity = value / 100.0;
        $('.bgOpacity-val').html(value);
        $('.background').css('opacity', opacity + '');
    });

    // 应用设置
    $('.applySetting').click(() => {
        // 背景透明度
        var opacity = $('.background').css('opacity');

        var settings = {};
        settings.bgOpacity = opacity;

        // 保存到本地
        chrome.storage.sync.set({ settings: settings });
        // 设置框消失
        setting.css('display', 'none');
    });


    // 加载设置窗口的内容
    // $("#searsh_bar_margin_top").val(searsh_bar_margin_top);
    // $("#searsh_bar_background").val(searsh_bar_background);

    // 背景透明度
    var opacity = localSettings.bgOpacity;
    $('.background').css('opacity', opacity);
    $("#bgOpacity").val(parseInt(100 * opacity));
    $('.bgOpacity-val').html(parseInt(100 * opacity));

}


// 提交表单,动态切换搜索引擎等
function onSearsh() {
    $('.searsh').attr('action', engines[engine].url);
    input.attr('name', engines[engine].name);
}


// 输入框文本改变
function onInput(event) {
    var txt = event.target.value;
    engineList.css('display', 'none');
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

function refreshState() {
    arr = [];
    currSelectLiNum = 0;
    currSelectLi = null;
}

// 刷新建议列表
function refreshTips() {
    // 如果没有数据
    if (!arr || !arr.length) {
        sugList.css('display', 'none');
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
    sugList.html(html);

    // 添加点击事件
    for (var i = 0; i < len; i++) {
        var id = '#sug' + (i + 1);
        const n = i;
        $(id).click(() => {
            window.location.href = engines[engine].url + "?" + engines[engine].name + "=" + self.arr[n];
        });
    }
    sugList.css('display', 'block');
}


// 键盘事件，主要是搜索建议时的上下选择
document.onkeydown = function (event) {
    // 37 左
    // 38 上
    // 39 右
    // 40 下
    var len = arr.length;
    var code = event.keyCode;
    // 判断提示框是否在显示
    var show = sugList.css('display');
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
        var id = "#sug" + currSelectLiNum;
        currSelectLi = $(id);

        // 改变input中显示的内容
        input.val(currSelectLi.text());

        // 改变它的背景色
        $(".sug").css('background', "#fff")
        currSelectLi.css('background', "#ededed");
    }
}


// 监听点击事件
document.addEventListener("click", function (e) {
    // 如果点击的是input，直接返回，否则点击其他就提示框他消失
    if (e.target == input[0]) {
        engineList.css('display', 'none');
        return;
    }
    if (e.target != sugList[0]) {
        sugList.css('display', 'none');

    }

    // 点击切换搜索引擎，这里再监听是为了点击外部消失
    if (e.target == cgEngineBtn[0] || e.target == cgEngineImg[0]) {
        var c = engineList.css('display');
        if (c == 'block') {
            engineList.css('display', 'none');
        }
        else {
            engineList.css('display', 'block');
        }
    } else {
        engineList.css('display', 'none');
    }

    // 正在编辑书签时，点击空白退出编辑
    if (e.target != bookmark[0] && editingBookmarks) {
        editingBookmarks = false;
        refreshBookmarks();

        draggingBm = false;
        Toast.info('已退出书签编辑模式！', 'toast-bottom-left');
    }
});


// 刷新书签的显示
function refreshBookmarks() {
    console.log('刷新书签');
    html = '';
    len = bookmarks.length;
    for (var i = 0; i < len; i++) {
        html += '<a class="bm" id="bm{3}" href="{0}"><p>{1}</p><span>{2}</span></a>'.format(bookmarks[i][0], bookmarks[i][1], bookmarks[i][2], i);
    }
    html += '<a id="addBookMark"><p class="addBookMark"></p><span>添加</span></a>';

    bookmark.html(html);
    // 如果内容没有超过16个
    if (len >= 16) {
        $('#addBookMark').css('display', 'none');
    }
    // 计算书签的宽高，方便拖拽时显示
    bmW = $('.addBookMark').width();
    bmH = $('.addBookMark').height();

    // 点击添加书签事件
    $("#addBookMark").click(() => {
        // 设置笼罩层
        $('.shade').css({
            "width": window.innerWidth + "px",
            "height": window.innerHeight + "px",
            "display": "block"
        });
        // 让添加的窗口弹出
        var addBookmarkWd = $('#addBookmarkWd');
        addBookmarkWd.css('display', 'block');
        var s = $('#addBookmarkWdTt');
        s.html('添加书签');
        // 点击事件
        // 如果添加过了，就跳过
        // 删除监听
        $('.ensureAddBookmark').off('click');
        $('.ensureAddBookmark').click(() => {
            // 获取三个输入
            var name = $('#abmName').val();
            var label = $('#abmLabel').val();
            var URL = $('#abmURL').val();
            if (name.isEmpty() || label.isEmpty() || URL.isEmpty()) {
                Toast.error('内容不能为空！');
                return;
            }
            var bm = [URL, label, name];
            bookmarks.push(bm);
            chrome.storage.sync.set({ bookmarks: bookmarks });
            $('.shade').css('display', 'none');
            $('#addBookmarkWd').css('display', 'none');
            // 刷新书签的显示
            Toast.success('添加成功！');
            refreshBookmarks();
        });
    });
}

// 编辑书签
function editBookmarks(showToast) {
    if (showToast) {
        Toast.info('书签编辑模式<br>点击空白处退出', 'toast-bottom-left');
    }
    editingBookmarks = true;
    html = '';
    len = bookmarks.length;
    for (var i = 0; i < len; i++) {
        html += '<a class="bmitem" style="animation: move .8s infinite;cursor:move;"><i class="edit" title="编辑"></i><i class="delete" title="删除"></i><p>{0}</p><span>{1}</span></a>'.format(bookmarks[i][1], bookmarks[i][2]);
    }
    bookmark.html(html);
    // 依次给按钮添加监听
    // 1.编辑功能
    var items = $('.edit');
    len = items.length;
    for (var i = 0; i < len; i++) {
        const n = i;
        $(items[i]).click((e) => {
            // 显示修改框框
            // 设置笼罩层
            $('.shade').css({
                "width": window.innerWidth + "px",
                "height": window.innerHeight + "px",
                "display": "block"
            });
            // 让添加的窗口弹出
            var editBookmarkWd = $('#addBookmarkWd');
            editBookmarkWd.css('display', 'block');
            var s = $('#addBookmarkWdTt');
            s.html('修改书签');
            // 显示原有的
            $('#abmName').val(bookmarks[n][2]);
            $('#abmLabel').val(bookmarks[n][1]);
            $('#abmURL').val(bookmarks[n][0]);
            // 确定按钮的监听
            $('.ensureAddBookmark').off('click');
            $('.ensureAddBookmark').click(() => {
                // 获取三个输入
                bookmarks[n][0] = $('#abmURL').val();
                bookmarks[n][1] = $('#abmLabel').val();
                bookmarks[n][2] = $('#abmName').val();
                chrome.storage.sync.set({ bookmarks: bookmarks });
                // 取消笼罩层和窗口显示
                $('.shade').css('display', 'none');
                $('#addBookmarkWd').css('display', 'none');
                refreshBookmarks();
                Toast.success('修改成功！');
            });
        });
    }

    // 2.删除功能
    items = $('.delete');
    len = items.length;
    for (var i = 0; i < len; i++) {
        const n = i;
        $(items[i]).click((e) => {
            // 删除第n个bookmark
            bookmarks.splice(n, 1);
            // 刷新本地存储
            chrome.storage.sync.set({ bookmarks: bookmarks });
            editBookmarks();
            Toast.success('删除成功！', 'toast-bottom-left')
            e.stopPropagation();
        });
    }

    // 3.拖拽
    items = $('.bmitem');
    len = items.length;
    for (var i = 0; i < len; i++) {
        const n = i;
        // 鼠标按下
        items[n].addEventListener('mousedown', (e) => {
            if (e.target == $('.edit')[n] || e.target == $('.delete')[n]) {
                return;
            }
            draggingBm = true;
            currengDraggingBm = n;
            // // 记录坐标
            // x = e.clientX;
            // y = e.clientY;
            // 标签文字
            $('#bmShadow > p').html(bookmarks[n][1]);
        });
    }
}

// 鼠标移动事件
document.addEventListener('mousemove', (e) => {
    if (draggingBm == false) {
        return;
    }
    // 当前位置
    var cX = e.clientX;
    var cY = e.clientY;
    var offx = parseInt(cX - (bmW / 2));
    var offy = parseInt(cY - (bmH / 2));
    // 显示残影
    bmShadow.css({
        'display': 'block',
        'width': bmW + 'px',
        'height': bmH + 'px',
        'left': offx + 'px',
        'top': offy + 'px',
        'cursor': 'move'
    });
});

// 鼠标释放事件
document.addEventListener('mouseup', (e) => {
    if (draggingBm == false) {
        return;
    }
    draggingBm = false;

    // 松开时的坐标
    var reX = e.clientX;
    var reY = e.clientY;
    // 如果这个地方下面有其他书签，就和它交换位置
    // 判断当前位置是否有其他书签
    var pos = aboveBookmark(reX, reY);

    // 交换书签并刷新
    if (pos != -1) {
        console.log(reX, reY, '下标', pos);
        console.log(pos + '与' + currengDraggingBm + '交换');
        // 交换操作
        let temp = bookmarks[pos];
        bookmarks[pos] = bookmarks[currengDraggingBm];
        bookmarks[currengDraggingBm] = temp;
        // 刷新本地存储
        chrome.storage.sync.set({ bookmarks: bookmarks });
    }

    bmShadow.css('display', 'none');
    refreshBookmarks();
    editBookmarks();
    currengDraggingBm = -1;
});

/**
 * 判断当前位置是否有其他书签
 * @param {*} currX x
 * @param {*} currY y
 * 返回下标，没有则返回-1
 */
function aboveBookmark(currX, currY) {
    // 依次获取当前显示的书签的坐标
    var axis = [];
    var bms = $('.bmitem');
    var len = bms.length;
    // 依次记录所有书签的左上角坐标
    for (var i = 0; i < len; i++) {
        var X = parseInt($(bms[i]).offset().left);
        var Y = parseInt($(bms[i]).offset().top);
        axis.push({ x: X, y: Y });
    }
    // 遍历axis，检查当前位置位于哪个书签
    for (var i = 0; i < len; i++) {
        if (currX >= axis[i].x &&
            currX <= (axis[i].x + bmW) &&
            currY >= axis[i].y &&
            currY <= (axis[i].y + bmH)) {
            return i;
        }
    }
    return -1;
}