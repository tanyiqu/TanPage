/**
 * 历史记录页面逻辑
 * - 按时间范围查询浏览历史（默认最近 7 天，与页面下拉框默认选中项一致）
 * - 每条记录展示网站 logo、标题与 URL（过长文本自动省略）
 * - 支持单条删除、复选框多选批量删除
 */

// 历史查询参数
let query = {
    text: '',
    startTime: 0,
    endTime: Date.now(),
    // 最多展示 1000 条，避免全量拉取导致页面卡顿
    maxResults: 1000
};
// 默认查询最近 7 天的历史
query.startTime = query.endTime - (3600 * 1000 * 24 * 7);

// 加载功能
loadFunctions();

// 首次加载最近 7 天的历史
refreshHistory();

function loadFunctions() {
    loadClearHistory();
    selectHistory();
    bindListEvents();
}

/**
 * 根据当前 query 重新查询并渲染历史
 * 首次加载、切换筛选、清除历史、批量删除均走此入口，保证行为一致
 */
function refreshHistory() {
    chrome.history.search(query, function (res) {
        showHistory(res);
    });
}


// 根据时间搜索历史
function selectHistory() {
    $('.select-history').change(() => {
        let val = $('.select-history').val();
        query.endTime = Date.now();
        switch (val) {
            case '1hour':
                query.startTime = query.endTime - (3600 * 1000);
                break;
            case '24hours':
                query.startTime = query.endTime - (3600 * 1000 * 24);
                break;
            case '7days':
                query.startTime = query.endTime - (3600 * 1000 * 24 * 7);
                break;
            case '30days':
                query.startTime = query.endTime - (3600 * 1000 * 24 * 30);
                break;
            case 'all':
            default:
                query.startTime = 0;
                break;
        }
        refreshHistory();
    });
}

// 清除历史功能
function loadClearHistory() {
    // 监听移入移出事件
    $('#clear-history').mouseenter(() => {
        let sub = $('#sub');
        sub.stop();
        sub.slideDown(200);
    });
    $('#clear-history').mouseleave(() => {
        let sub = $('#sub');
        sub.stop();
        sub.slideUp(200);
    });
    // 清除历史点击事件
    $('#clear1Hour').click(() => {
        let endTime = Date.now();
        let startTime = endTime - 3600000;
        clearHistoryRange(startTime, endTime);
    });
    $('#clear24Hours').click(() => {
        let endTime = Date.now();
        let startTime = endTime - (3600000 * 24);
        clearHistoryRange(startTime, endTime);
    });
    $('#clear7Days').click(() => {
        let endTime = Date.now();
        let startTime = endTime - (3600000 * 24 * 7);
        clearHistoryRange(startTime, endTime);
    });
    $('#clearAll').click(() => {
        chrome.history.deleteAll(() => {
            Toast.success('删除成功');
            refreshHistory();
        });
    });
}

/**
 * 清除指定时间范围的历史记录
 * @param {number} startTime 起始时间戳
 * @param {number} endTime 结束时间戳
 */
function clearHistoryRange(startTime, endTime) {
    const range = { startTime: startTime, endTime: endTime };
    chrome.history.deleteRange(range, () => {
        Toast.success('删除成功');
        refreshHistory();
    });
}


/**
 * 列表事件绑定（事件委托）
 * 列表每次查询都会整体重建，事件绑定在常驻的 #list 容器上，重建后无需重复绑定
 */
function bindListEvents() {
    // 单条删除
    $('#list').on('click', '.img-delete-history', function () {
        let $li = $(this).closest('li');
        // 删除此条历史
        chrome.history.deleteUrl({ url: $li.attr('url') }, () => {
            // 从列表中移除该行，并同步"全选"与"删除选中"按钮状态
            $li.remove();
            updateSelectionState();
        });
    });

    // 单条复选框勾选状态变化
    $('#list').on('change', '.history-checkbox', () => {
        updateSelectionState();
    });

    // 表头"全选"复选框
    $('#select-all').change(function () {
        let checked = $(this).prop('checked');
        $('#list .history-checkbox').prop('checked', checked);
        updateDeleteBtnState(checked ? $('#list .history-checkbox').length : 0);
    });

    // 批量删除选中记录
    $('#delete-selected').click(() => {
        let $checked = $('#list .history-checkbox:checked');
        if ($checked.length === 0) {
            Toast.error('请先勾选要删除的记录');
            return;
        }
        let total = $checked.length;
        let done = 0;
        $checked.each(function () {
            let url = $(this).closest('li').attr('url');
            chrome.history.deleteUrl({ url: url }, () => {
                done++;
                // 全部删除完成后刷新列表
                if (done >= total) {
                    Toast.success('已删除 {0} 条记录'.format(total));
                    refreshHistory();
                }
            });
        });
    });
}

/**
 * 同步"全选"复选框与"删除选中"按钮状态
 */
function updateSelectionState() {
    let total = $('#list .history-checkbox').length;
    let count = $('#list .history-checkbox:checked').length;
    // 全部选中才勾选"全选"，部分选中时显示半选状态
    $('#select-all').prop('checked', total > 0 && count === total);
    $('#select-all').prop('indeterminate', count > 0 && count < total);
    updateDeleteBtnState(count);
}

/**
 * 更新"删除选中"按钮的文案与可用状态
 * @param {number} count 当前选中的条数
 */
function updateDeleteBtnState(count) {
    let $btn = $('#delete-selected');
    if (count > 0) {
        $btn.text('删除选中 (' + count + ')');
        $btn.removeClass('disabled');
    } else {
        $btn.text('删除选中');
        $btn.addClass('disabled');
    }
}

/**
 * 列表重建后重置选择状态（新列表默认全部未勾选）
 */
function resetSelectionState() {
    $('#select-all').prop('checked', false);
    $('#select-all').prop('indeterminate', false);
    updateDeleteBtnState(0);
}


/**
 * 在页面显示历史
 * @param {*} array 历史数组
 */
function showHistory(array) {
    let list = $('#list');
    list.html('');
    // 当前页面地址，用于过滤掉自身记录
    const selfUrl = location.href;
    // 遍历array
    $.each(array, function (index, value) {
        // 过滤掉当前页面自身，避免历史列表里出现本页
        if (value.url === selfUrl) {
            return true;
        }

        let li = $(document.createElement('li'));
        li.attr('id', 'li_his_ID_' + value.id);
        li.attr('url', value.url);

        // 复选框（多选批量删除用）
        let select = $(document.createElement('div'));
        select.addClass('select');
        select.append($('<input>', {
            type: 'checkbox',
            'class': 'history-checkbox',
            title: '选择该记录'
        }));

        // 网站 logo + 页面标题
        let page = $(document.createElement('div'));
        page.addClass('page');
        page.append(buildFavicon(value.url));
        let p = $(document.createElement('p'));
        let a = $(document.createElement('a'));
        a.attr({
            target: '_blank',
            href: value.url
        });
        // 处理标题
        let title = '';
        if (value.title.isEmpty()) {
            title = value.url;
        } else {
            title = value.title;
        }
        a.attr('title', title);
        a.text(title);
        p.append(a);
        page.append(p);

        // URL 链接；title 属性用于在文本被省略时悬浮查看完整地址
        let url = $(document.createElement('div'));
        url.addClass('url');
        url.append($('<a>', {
            target: '_blank',
            href: value.url,
            title: value.url,
            text: value.url
        }));

        // 访问时间 / 累计访问次数
        let visit_time = $(document.createElement('div'));
        visit_time.addClass('visit-time');
        visit_time.html('<p>' + formatDate(value.lastVisitTime) + '</p>');

        let visit_count = $(document.createElement('div'));
        visit_count.addClass('visit-count');
        visit_count.html('<p>' + value.visitCount + '</p>');

        // 单条删除按钮
        let deleteBtn = $(document.createElement('div'));
        deleteBtn.addClass('img-delete-history');
        deleteBtn.attr('id', 'his_ID_' + value.id);

        li.append(select, page, url, visit_time, visit_count, deleteBtn);
        list.append(li);
    });

    // 列表为空时给出提示
    if (list.children().length === 0) {
        let empty = $(document.createElement('li'));
        empty.addClass('empty');
        empty.text('暂无历史记录');
        list.append(empty);
    }

    // 重置选择状态
    resetSelectionState();
}

/**
 * 构建网站 logo 图片
 * MV3 中 chrome://favicon 已不可用，首选官方 _favicon/ 接口
 * （需在 manifest.json 的 permissions 中声明 "favicon" 权限）
 * 当 _favicon/ 接口不可用（如部分浏览器对 MV3 favicon API 支持不全）时，
 * 回退到目标站点自带的 /favicon.ico，保证每一行左侧图标都能正常显示，
 * 且不向第三方泄露浏览记录（仅请求站点自身资源）。两级都失败才隐藏。
 * @param {string} url 网页地址
 */
function buildFavicon(url) {
    // 首选：MV3 官方 _favicon/ 接口（隐私友好，不向第三方发起请求）
    let faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', url);
    faviconUrl.searchParams.set('size', '32');

    // 先创建 img 并绑定 error 回退，再设置 src，避免异步加载完成前
    // 事件未绑定导致 error 回调丢失（jQuery 设置 src 后即可异步触发加载）
    let $img = $('<img>', {
        alt: ''
    });

    $img.on('error', function () {
        let fallback = '';
        try {
            // 回退：目标站点根路径自带的 favicon（同源请求，不泄露给第三方）
            fallback = new URL('/favicon.ico', url).href;
        } catch (e) {
            // URL 非法（如 about: / chrome: 等内部页）无法生成回退地址，直接隐藏
            $(this).hide();
            return;
        }
        // 防止回退地址再次触发 error 造成死循环：仅在尚未回退时才切换
        if (this.src !== fallback) {
            this.src = fallback;
        } else {
            $(this).hide();
        }
    });

    $img.attr('src', faviconUrl.toString());
    return $img;
}
