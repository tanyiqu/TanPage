/**
 * 获取浏览器历史
 */

let query = {
    text: '',
    startTime: 0,
    endTime: 100000000000000,
    maxResults: 100
};

// 获取默认的100条最近历史
chrome.history.search(query, function (res) {
    showHistory(res);
});


loadFunctions();

function loadFunctions() {
    loadClearHistory();
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
        let range = {
            startTime: startTime,
            endTime: endTime,
        };
        chrome.history.deleteRange(range, () => {
            console.log('clear1Hour');
            Toast.success('删除成功');
            chrome.history.search(query, function (res) {
                showHistory(res);
            });
        });
    });
    $('#clear24Hours').click(() => {
        let endTime = Date.now();
        let startTime = endTime - (3600000 * 24);
        let range = {
            startTime: startTime,
            endTime: endTime,
        };
        chrome.history.deleteRange(range, () => {
            console.log('clear24Hours');
            Toast.success('删除成功');
            chrome.history.search(query, function (res) {
                showHistory(res);
            });
        });
    });
    $('#clear7Days').click(() => {
        let endTime = Date.now();
        let startTime = endTime - (3600000 * 24 * 7);
        let range = {
            startTime: startTime,
            endTime: endTime,
        };
        chrome.history.deleteRange(range, () => {
            console.log('clear7Days');
            Toast.success('删除成功');
            chrome.history.search(query, function (res) {
                showHistory(res);
            });
        });
    });
    $('#clearAll').click(() => {
        chrome.history.deleteAll(() => {
            console.log('clearAll');
            Toast.success('删除成功');
            chrome.history.search(query, function (res) {
                showHistory(res);
            });
        });
    });
}


/**
 * 在页面显示历史
 * @param {*} array 历史数组
 */
function showHistory(array) {
    console.log('显示数组');
    console.log(array);

    let list = $('#list');
    list.html('');
    let html = '';
    // 遍历array
    $.each(array, function (index, value) {
        if (index === 0) {
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
        console.log(target);
        // 隐藏自己
        target.hide();
        // 删除此条历史
        console.log('删除', target.attr('url'));
        chrome.history.deleteUrl({ url: target.attr('url') });

    });
}