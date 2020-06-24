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
        html += '<li><div class="page"><img src="chrome://favicon/size/16@2x/{0}" alt=""><p><a href="{0}" target="_blank">{1}</a></p></div><div class="visit-time"><p>{2}</p></div><div class="visit-count"><p>{3}</p></div></li>'.format(value.url, value.title, value.lastVisitTime, value.visitCount);
    });

    list.html(html);
}