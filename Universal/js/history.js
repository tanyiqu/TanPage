/**
 * 获取浏览器历史
 */

// 历史查询参数
let query = {
    text: '',
    startTime: 0,
    endTime: 100000000000000,
    // 最多展示 1000 条，避免全量拉取导致页面卡顿
    maxResults: 1000
};
query.endTime = Date.now();
query.startTime = query.endTime - (3600 * 1000 * 24);
// 获取最近24小时的历史
chrome.history.search(query, function (res) {
    showHistory(res);
});


// 加载功能
loadFunctions();

function loadFunctions() {
    loadClearHistory();
    selectHistory();
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
        chrome.history.search(query, function (res) {
            showHistory(res);
        });
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
            chrome.history.search(query, function (res) {
                showHistory(res);
            });
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
        chrome.history.search(query, function (res) {
            showHistory(res);
        });
    });
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
        let page = $(document.createElement('div'));
        page.addClass('page');
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
        a.text(title);
        p.append(a);
        page.append('<img src="chrome://favicon/size/16@2x/' + value.url + '" alt="">');
        page.append(p);

        let visit_time = $(document.createElement('div'));
        visit_time.addClass('visit-time');
        visit_time.html('<p>' + formatDate(value.lastVisitTime) + '</p>');

        let visit_count = $(document.createElement('div'));
        visit_count.addClass('visit-count');
        visit_count.html('<p>' + value.visitCount + '</p>');

        let deleteBtn = '<div class="img-delete-history" id="his_ID_' + value.id + '"></div>';
        li.attr('id', 'li_his_ID_' + value.id);
        li.attr('url', value.url);
        li.append(page, visit_time, visit_count, deleteBtn);
        list.append(li);
    });

    // 全部添加监听事件
    $('.img-delete-history').click((e) => {
        // 获取被点击的那一项的id
        let id = '#li_' + e.target.id;
        let target = $(id);
        // 隐藏自己
        target.hide();
        // 删除此条历史
        chrome.history.deleteUrl({ url: target.attr('url') });
    });
}
