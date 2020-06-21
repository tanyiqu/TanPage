// 需要从本地存储读的数据
let engine;
let engines;
let bookmarks;
let bg_setting;
let page_setting;

// 出现的提示的li集合
let arr = [];
// 当前被选中的li的序号 没有选中就为0
let currSelectLiNum = 0;
// 当前被选中的li
let currSelectLi = null;

// 当前正在编辑书签
let editingBookmarks = false;

// 加这个为了不让$报警告
// noinspection JSUnresolvedVariable
// let $ = jQuery;

// 输入框
let input = $('.inputBar');

// 搜索建议ul
let sugList = $('#sugList');

// 切换引擎按钮
let cgEngineBtn = $(".cgEngine");
let cgEngineImg = $("#cgEngineImg");

// 切换搜索引擎时的所有所搜引擎列表
let engineList = $('#engineList');

// 添加搜索引擎窗口
let addEngine = $('#addEngine');

// 书签列表
let bookmark = $('.bookmark');

// 拖动书签时的残影
let bmShadow = $('#bmShadow');


// 当前正在拖拽引擎
let draggingEg = false;
// 当前正在拖动的引擎下标
let currentDraggingEg = -1;
// 正在拖拽书签
let draggingBm = false;
// 当前正在拖动的书签下标
let currentDraggingBm = -1;

// var x, y;
// 书签的宽高
let bmW, bmH;

// 加载配置信息，入口函数
(function () {
    // noinspection JSUnresolvedVariable
    chrome.storage.local.get(null, (res) => {
        // 获取配置
        engine = res.engine;
        engines = res.engines;
        bookmarks = res.bookmarks;
        bg_setting = res.bg_setting;
        page_setting = res.page_setting;
        // 加载配置
        initPage();

        // 暂时自动显示设置框
        $(".showSetting").trigger('click');
    });
})();


// 加载配置
function initPage() {
    initWidget();
    loadWidget();
    loadBG();
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
    bmShadow.css('display', 'none');

    $('#addBookmarkWd').css('display', 'none');
    // 根据配置加载样式
    // console.log("加载样式");

}

/**
 * 加载控件
 * 包括添加各种控件的行为、监听等
 */
function loadWidget() {
    // 加载背景笼罩
    loadShroud();

    // 加载搜索引擎
    loadEngine();

    // 加载书签
    loadBookmarks();
}

/**
 * 加载背景笼罩
 */
function loadShroud() {
    $('.ShroudShade').css({
        'width': window.innerWidth + 'px',
        'height': window.innerHeight + 'px'
    });
    $(window).resize(function () {
        $('.ShroudShade').css({
            'width': window.innerWidth + 'px',
            'height': window.innerHeight + 'px'
        });
    });
}

/**
 * 加载搜索引擎
 */
function loadEngine() {
    // 默认搜索引擎图标
    cgEngineImg.attr('src', engines[engine].imgurl);

    // 加载搜索引擎列表
    let html = "";
    let len = engines.length;
    for (let i = 0; i < len; i++) {
        html += '<div class="engineItem" id="engineItem{0}"><i class="egimg" style="background: url({2}) no-repeat center;background-size: 100% 100%;"></i><i title="临时搜索" id="tmp{1}" class="tmp-searsh"></i><i title="删除" id="del{1}" class="del-engine"></i><p>{3}</p></div>'.format(i + 1, i + 1, engines[i].imgurl, engines[i].name);
    }
    html += '<div class="engineItem" id="engineItemAdd"><img src="../imgs/egs/add.png" alt=""><p>自定义</p></div>';
    engineList.html(html);

    // 提交搜索
    $(".search").submit(onSearch);

    // 切换搜索引擎按钮
    len = engines.length;
    for (let i = 0; i < len; i++) {
        const n = i;
        let id = "#engineItem" + (n + 1);
        // 查询到标签后添加点击事件
        $(id).click(() => {
            ChromeLocalSet({ engine: n });
            ChromeLocalSet({ default_engine_url: engines[n].url });
            engine = n;
            cgEngineImg.attr('src', engines[engine].imgurl);

            // 弹出提示
            Toast.success('已切换为：' + engines[engine].name, 'toast-top-center');
        });

        // 鼠标按下事件
        $(id).mousedown((e) => {
            if (e.target === $("#tmp" + (n + 1))[0]) {
                return;
            }
            // e.target.style.cursor = 'pointer';
            // console.log('12');
            // 进入拖拽模式
            draggingEg = true;
            currentDraggingEg = n;
        });
    }

    // 临时搜索
    for (let i = 0; i < len; i++) {
        const n = i;
        // 清除原来的事件
        $("#tmp" + (n + 1)).off('click');
        $("#tmp" + (n + 1)).click((event) => {
            console.log('临时切换', n);
            // 暂时改变图标和搜索引擎，页面刷新回复正常
            engine = n;
            cgEngineImg.attr('src', engines[engine].imgurl);
            engineList.css('display', 'none');

            // 弹出提示
            Toast.success('临时切换：' + engines[n].name + "<br/>刷新后失效", 'toast-top-center');
            // 阻止事件向下传递
            event.stopPropagation();
        });
    }
    // 删除搜索引擎
    for (let i = 0; i < len; i++) {
        const n = i;
        // 清除原来的事件
        $("#del" + (n + 1)).off('click');
        $("#del" + (n + 1)).click((event) => {
            // 在engines里面删除
            engines.splice(n, 1);
            // 刷新本地存储
            ChromeLocalSet({ engines: engines });
            // 弹出提示
            Toast.success('删除成功！', 'toast-top-center');

            event.stopPropagation();
            loadEngine();
            engineList.css('opacity', '1');
        });
    }


    // 输入框文本改变时添加搜索建议
    input.on('input', onInput);


    // 添加搜索引擎
    addCustomEngine();
}

// 添加搜索引擎
function addCustomEngine() {
    // 添加自定义搜索引擎按钮
    $('#engineItemAdd').off('click');
    $('#engineItemAdd').click(() => {
        // 如果设置框在显示就取消显示
        setting.slideLeftHide(400);
        // 动态设置高
        addEngine.css({
            'height': window.innerHeight + "px",
        });
        addEngine.slideLeftShow(400);
    });

    // 关闭添加搜索引擎
    $('#closeAddEngine').off('click');
    $('#closeAddEngine').click(() => {
        addEngine.slideLeftHide(400);
    });

    // 点击选择logo
    $('#selectEngineLogo').off('click');
    $('#selectEngineLogo').click(() => {
        console.log('点击选择文件');
        $('#chooseEngineLogo').click();
    });

    // 触发选择文件
    $('#chooseEngineLogo').off('change');
    $('#chooseEngineLogo').change((e) => {
        console.log('已选择文件');

        //获取读取我文件的File对象
        let selectedFile = $('#chooseEngineLogo')[0].files[0];
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = function () {
            showCutEngineLogoWindow(this.result);
        }
    });

    // 点击确定
    $('#ensureAddEngine').off('click');
    $('#ensureAddEngine').click(() => {
        // 添加搜索引擎
        // 获取名称
        let name = $('#customEngineName').val();
        // 获取url
        let url = $('#customEngineUrl').val();
        if (name.isEmpty() || url.isEmpty()) {
            Toast.error('内容不能为空！');
            return;
        }
        // 获取图标url，如果没有选择图片就用默认的图片
        let imgurl = $('#selectEngineLogo').attr('src');
        let imgurls = [];
        // 将imgurl分割
        if (imgurl.length > 2048) {
            imgurls = splitLongString(imgurl);
        }
        // console.log('length', imgurl.length);

        let eg = {
            imgurl: imgurl,
            imgurls: imgurls,
            name: name,
            url: url
        };

        console.log('eg', eg);
        console.log('engines', engines);
        engines.push(eg);

        // 刷新本地存储
        ChromeLocalSet({ engines: engines });

        // 刷新搜索引擎列表
        loadEngine();

        // 关闭窗口
        addEngine.slideLeftHide(400);

        // 提示成功
        Toast.success('添加成功！');
    });
}

// 显示裁剪搜索引擎logo的窗口
function showCutEngineLogoWindow(imgUrl) {
    // 将内容设置为空，否则连续选择同一个文件不会触发回调
    $('#chooseEngineLogo').val('');
    // 打开笼罩层
    $('.shade').css({
        "width": window.innerWidth + "px",
        "height": window.innerHeight + "px",
        "display": "block"
    });
    $('#cutEngineLogoWindow').css('display', 'block');
    // 加载
    loadCutEngineLogo(imgUrl);
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
        // 添加动画效果
        $('.shade').fadeToggle(300);
        $('#addBookmarkWd').fadeToggle(300);
    });

}


// 提交表单,动态切换搜索引擎等
function onSearch() {
    // 拼接url
    let oldurl = engines[engine].url;
    let newurl = oldurl.replace('%s', input.val());

    // 判断在哪个页面打开
    if (page_setting.search_target_self) {
        window.open(newurl, '_self');
    } else {
        window.open(newurl, '_blank');
    }
    return false;
}


// 输入框文本改变
function onInput(event) {
    let txt = event.target.value;
    engineList.css('display', 'none');
    refreshState();
    let httpRequest = new XMLHttpRequest();
    // 使用百度的搜索建议
    httpRequest.open('GET', 'http://suggestion.baidu.com/su?wd=' + txt, true);
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            let json = httpRequest.responseText;
            json = json.match('\\[.*?\\]');
            arr = JSON.parse(json);
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
    let len = arr.length;
    //最多显示7条
    if (len > 7) {
        len = 7;
        let arr2 = [];
        for (let i = 0; i < 7; i++) {
            arr2.push(arr[i]);
        }
        arr = arr2;
    }
    let html = '';
    // 添加li
    for (let i = 0; i < len; i++) {
        let id = 'sug' + (i + 1);
        let src = "../imgs/{0}.png".format(i + 1);
        html += '<li class="sug" id="{0}"><div><img src="{1}" alt=""/></div>{2}</li>'.format(id, src, arr[i]);
    }
    sugList.html(html);

    // 添加点击事件
    for (let i = 0; i < len; i++) {
        let id = '#sug' + (i + 1);
        $(id).click(() => {
            let url = engines[engine].url.replace('%s', arr[i]);
            // 判断在哪个页面打开
            if (page_setting.search_target_self) {
                window.open(url, '_self');
            } else {
                window.open(url, '_blank');
            }
        });
    }
    sugList.css('display', 'block');
}


// 刷新书签的显示
function refreshBookmarks() {
    console.log('刷新书签');
    let html = '';
    let len = bookmarks.length;

    for (let i = 0; i < len; i++) {
        html += '<a class="bm" id="bm{3}" href="{0}"><p>{1}</p><span>{2}</span></a>'.format(bookmarks[i].url, bookmarks[i].lbl, bookmarks[i].name, i);
    }
    html += '<a id="addBookMark"><p class="addBookMark"></p><span>添加</span></a>';
    bookmark.html(html);

    // 点击事件，根据设置选择页面打开方式
    for (let i = 0; i < len; i++) {
        let id = '#bm' + i;
        $(id).click((e) => {
            if (page_setting.bookmark_target_self) {
                $(id).attr('target', '_self');
            } else {
                $(id).attr('target', '_blank');
            }
        });
    }

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
        let addBookmarkWd = $('#addBookmarkWd');
        addBookmarkWd.css('display', 'block');
        // 重置里面的内容
        let s = $('#addBookmarkWdTt');
        $('#abmName').val('');
        $('#abmLabel').val('');
        $('#abmURL').val('');
        s.html('添加书签');
        // 删除原来的事件，重新添加
        $('.ensureAddBookmark').off('click');
        $('.ensureAddBookmark').click(() => {
            // 获取三个输入
            let name = $('#abmName').val();
            let label = $('#abmLabel').val();
            let URL = $('#abmURL').val();
            if (name.isEmpty() || label.isEmpty() || URL.isEmpty()) {
                Toast.error('内容不能为空！');
                return;
            }
            // let bm = [URL, label, name];
            let bm = {
                name: name,
                lbl: label,
                url: URL
            };
            bookmarks.push(bm);
            ChromeLocalSet({ bookmarks: bookmarks });
            $('.shade').fadeToggle(300);
            $('#addBookmarkWd').fadeToggle(300);
            // 刷新书签的显示
            Toast.success('添加成功！');
            refreshBookmarks();
        });
    });
}

/**
 * 编辑书签
 * @param {*} showToast 显示toast
 */
function editBookmarks(showToast) {
    if (showToast) {
        Toast.info('书签编辑模式<br>点击空白处退出');
    }
    editingBookmarks = true;
    let html = '';
    let len = bookmarks.length;
    for (let i = 0; i < len; i++) {
        html += '<a class="bmitem" style="animation: move .8s infinite;cursor:move;"><i class="edit" title="编辑"></i><i class="delete" title="删除"></i><p>{0}</p><span>{1}</span></a>'.format(bookmarks[i].lbl, bookmarks[i].name);
    }
    bookmark.html(html);
    // 依次给按钮添加监听
    // 1.编辑功能
    let items = $('.edit');
    len = items.length;
    for (let i = 0; i < len; i++) {
        const n = i;
        $(items[i]).click(() => {
            // 显示修改框框
            // 设置笼罩层
            $('.shade').css({
                "width": window.innerWidth + "px",
                "height": window.innerHeight + "px"
            });
            // 让添加的窗口弹出
            $('.shade').fadeToggle(300);
            $('#addBookmarkWd').fadeToggle(300);
            let s = $('#addBookmarkWdTt');
            s.html('修改书签');
            // 显示原有的
            $('#abmName').val(bookmarks[n].name);
            $('#abmLabel').val(bookmarks[n].lbl);
            $('#abmURL').val(bookmarks[n].url);
            // 确定按钮的监听
            $('.ensureAddBookmark').off('click');
            $('.ensureAddBookmark').click(() => {
                // 获取三个输入
                bookmarks[n].url = $('#abmURL').val();
                bookmarks[n].lbl = $('#abmLabel').val();
                bookmarks[n].name = $('#abmName').val();
                ChromeLocalSet({ bookmarks: bookmarks });
                // 取消笼罩层和窗口显示
                $('.shade').fadeToggle(300);
                $('#addBookmarkWd').fadeToggle(300);
                refreshBookmarks();
                Toast.success('修改成功！');
            });
        });
    }

    // 2.删除功能
    items = $('.delete');
    len = items.length;
    for (let i = 0; i < len; i++) {
        const n = i;
        $(items[i]).click((e) => {
            // 删除第n个bookmark
            bookmarks.splice(n, 1);
            // 刷新本地存储
            ChromeLocalSet({ bookmarks: bookmarks });
            editBookmarks();
            Toast.success('删除成功！', 'toast-bottom-left');
            e.stopPropagation();
        });
    }

    // 3.拖拽
    items = $('.bmitem');
    len = items.length;
    for (let i = 0; i < len; i++) {
        const n = i;
        // 鼠标按下
        items[n].addEventListener('mousedown', (e) => {
            if (e.target === $('.edit')[n] || e.target === $('.delete')[n]) {
                return;
            }
            draggingBm = true;
            currentDraggingBm = n;
            // // 记录坐标
            // x = e.clientX;
            // y = e.clientY;
            // 标签文字
            $('#bmShadow > p').html(bookmarks[n].lbl);
        });
    }
}

/**
 * 加载壁纸
 */
function loadBG() {
    var bgcss = '';

    switch (bg_setting.bg_mode) {
        // 默认壁纸
        case 0:
            bgcss = 'url("../imgs/bgs/bg.png")';
            break;

        // 本地壁纸
        case 1:
            bgcss = 'url(' + bg_setting.bg_localdata + ')';
            break;

        // 必应壁纸
        case 2:
            bgcss = 'url("https://api.dujin.org/bing/1920.php")';
            break;

        // 自定义
        case 3:
            bgcss = 'url("http://www.dmoe.cc/random.php")';
            break;


        // 其他
        default:
            break;
    }

    $('.background').css({
        'background-image': bgcss,
        'background-size': 'cover',
    });

}


// 键盘事件，主要是搜索建议时的上下选择
document.onkeydown = function (event) {
    // 37 左
    // 38 上
    // 39 右
    // 40 下
    let len = arr.length;
    let code = event.keyCode;
    // 判断提示框是否在显示
    let show = sugList.css('display');
    if (show === 'none') {
        return;
    }

    // 按下了上/下
    if (code === 38 || code === 40) {
        //如果没有被选中
        code = code - 39;
        //上 -1
        //下 1
        // 找到当前被选择的li的编号
        currSelectLiNum += code;
        if (currSelectLiNum === 0 || currSelectLiNum === -1) {
            currSelectLiNum = len;
        }
        if (currSelectLiNum === len + 1) {
            currSelectLiNum = 1;
        }
        // 根据编号，找到这个li
        let id = "#sug" + currSelectLiNum;
        currSelectLi = $(id);

        // 改变input中显示的内容
        input.val(currSelectLi.text());

        // 改变它的背景色
        $(".sug").css('background', "#fff");
        currSelectLi.css('background', "#ededed");
    }
};

// 监听点击事件
document.addEventListener("click", function (e) {
    // 如果点击的是input，直接返回，否则点击其他就提示框他消失
    if (e.target === input[0]) {
        engineList.css('display', 'none');
        return;
    }
    if (e.target !== sugList[0]) {
        sugList.css('display', 'none');

    }

    // 点击切换搜索引擎，这里再监听是为了点击外部消失
    if (e.target === cgEngineBtn[0] || e.target === cgEngineImg[0]) {
        let c = engineList.css('display');
        if (c === 'block') {
            engineList.css('display', 'none');
        } else {
            engineList.css({
                display: 'block',
                opacity: 1
            });
        }
    } else {
        engineList.css('display', 'none');
    }

    // 正在编辑书签时，点击空白退出编辑
    if (e.target !== bookmark[0] && editingBookmarks) {
        editingBookmarks = false;
        refreshBookmarks();

        draggingBm = false;
        Toast.info('已退出书签编辑模式！', 'toast-bottom-left');
    }
});


// 鼠标移动事件
document.addEventListener('mousemove', (e) => {
    let cX = e.clientX;
    let cY = e.clientY;
    // 获取搜索引擎的宽高
    let W = parseInt($('#engineItemAdd').width());
    let H = parseInt($('#engineItemAdd').height());
    let offx = cX - (W / 2);
    let offy = cY - (H / 2);
    // 正在拖拽搜索引擎
    if (draggingEg) {
        console.log('移动中');
        $('.engineItemShadow > img').attr('src', engines[currentDraggingEg].imgurl);
        $('.engineItemShadow').css({
            "display": "block",
            'left': offx + 'px',
            'top': offy + 'px',
        });
        $('#engineList').css('opacity', '0.5');
    }

    // 正在拖拽书签
    if (draggingBm) {
        // 当前位置
        let offx = cX - (bmW / 2);
        let offy = cY - (bmH / 2);
        // 显示残影
        bmShadow.css({
            'display': 'block',
            'width': bmW + 'px',
            'height': bmH + 'px',
            'left': offx + 'px',
            'top': offy + 'px',
            'cursor': 'move'
        });
    }

});


// 鼠标释放事件
document.addEventListener('mouseup', (e) => {
    console.log('释放');
    // 松开时的坐标
    let reX = e.clientX;
    let reY = e.clientY;

    // 正在拖拽搜索引擎
    if (draggingEg) {

        // 判断当前位置是否有其他搜索引擎
        let pos = aboveEngine(reX, reY);
        // 如果自己跟自己交换，说明知识被点击了，执行点击操作
        if (pos == currentDraggingEg) {
            // 先让残影消失
            $('.engineItemShadow').css('display', 'none');
            draggingEg = false;
            return false;
        }
        console.log(pos + ' 与 ' + currentDraggingEg + ' 交换');
        $('#engineList').css('opacity', '1');
        if (pos != -1) {
            // 交换操作
            let temp = engines[pos];
            engines[pos] = engines[currentDraggingEg];
            engines[currentDraggingEg] = temp;
            // 刷新本地存储
            ChromeLocalSet({ engines: engines });
        }
        $('.engineItemShadow').css('display', 'none');
        loadEngine();
        currentDraggingEg = -1;
        draggingEg = false;
        // return;
    }

    // 正在拖拽书签
    if (draggingBm) {

        // 如果这个地方下面有其他书签，就和它交换位置
        // 判断当前位置是否有其他书签
        let pos = aboveBookmark(reX, reY);

        // 交换书签并刷新
        if (pos !== -1) {
            console.log(reX, reY, '下标', pos);
            console.log(pos + '与' + currentDraggingBm + '交换');
            // 交换操作
            let temp = bookmarks[pos];
            bookmarks[pos] = bookmarks[currentDraggingBm];
            bookmarks[currentDraggingBm] = temp;
            // 刷新本地存储
            ChromeLocalSet({ bookmarks: bookmarks });
        }

        bmShadow.css('display', 'none');
        refreshBookmarks();
        editBookmarks();
        currentDraggingBm = -1;
        draggingBm = false;
    }


});

/**
 * 判断当前位置是否有其他搜索引擎
 * @param {*} cuurX 
 * @param {*} cuurY 
 */
function aboveEngine(currX, currY) {
    // 获取搜索引擎的宽高
    let W = parseInt($('#engineItemAdd').width());
    let H = parseInt($('#engineItemAdd').height());
    console.log(W, H);
    // 依次获取当前显示的书签的坐标
    let axis = [];
    let egs = $('.engineItem');
    // 去掉最后一个添加的item
    let len = egs.length - 1;
    // 依次记录所有引擎的左上角坐标
    for (let i = 0; i < len; i++) {
        let X = parseInt($(egs[i]).offset().left);
        let Y = parseInt($(egs[i]).offset().top);
        axis.push({ x: X, y: Y });
    }
    // 遍历axis，检查当前位置位于哪个书签
    for (let i = 0; i < len; i++) {
        if (currX >= axis[i].x &&
            currX <= (axis[i].x + W) &&
            currY >= axis[i].y &&
            currY <= (axis[i].y + H)) {
            return i;
        }
    }
    return -1;
}


/**
 * 判断当前位置是否有其他书签
 * @param {*} currX x
 * @param {*} currY y
 * 返回下标，没有则返回-1
 */
function aboveBookmark(currX, currY) {
    // 依次获取当前显示的书签的坐标
    let axis = [];
    let bms = $('.bmitem');
    let len = bms.length;
    // 依次记录所有书签的左上角坐标
    for (let i = 0; i < len; i++) {
        let X = parseInt($(bms[i]).offset().left);
        let Y = parseInt($(bms[i]).offset().top);
        axis.push({ x: X, y: Y });
    }
    // 遍历axis，检查当前位置位于哪个书签
    for (let i = 0; i < len; i++) {
        if (currX >= axis[i].x &&
            currX <= (axis[i].x + bmW) &&
            currY >= axis[i].y &&
            currY <= (axis[i].y + bmH)) {
            return i;
        }
    }
    return -1;
}