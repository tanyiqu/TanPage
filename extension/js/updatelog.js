/**
 * 填充更新日志
 */

let update_logs = [
    {
        time: '2020-06-25',
        version: '1.2.1-release',
        details: [
            '1.替换默认壁纸',
            '1.替换默认壁纸',
        ]
    },
    {
        time: '2020-06-22',
        version: '1.1.0-release',
        details: [
            '1.替换使用自己绘制的图标',
            '2.添加自定义搜索引擎功能',
            '3.切换壁纸功能'
        ]
    },
    {
        time: '2020-06-03',
        version: '1.0.0-release',
        details: [
            '1.在Edge商店发布',
            '2.实现大量功能'
        ]
    }
];


fillUpdateLog();


function fillUpdateLog() {
    let html = '';
    $.each(update_logs, (index, item) => {
        html += '<p class="text-noindent">' + item.time + ' ' + item.version + '</p>';
        // 遍历日志详情
        $.each(item.details, (i, it) => {
            html += '<p class="text">' + it + '</p>';
        });
        html += '<br>';
    });
    $('#updateLogDetail').html(html);
}