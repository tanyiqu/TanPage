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

/**
 * 在页面显示历史
 * @param {*} array 历史数组
 */
function showHistory(array) {
    console.log('显示数组');
    console.log(array);

    let list = $('#list');
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

        li.append(page, visit_time, visit_count);
        list.append(li);
    });
}