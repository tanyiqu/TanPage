/**
 * 设置框的内容太多，单独放在一个js文件里面
 */

// 加载设置窗口
loadSetting();


/**
 * 加载设置窗口
 */
function loadSetting() {
    // 打开设置
    $(".showSetting").click(() => {
        // 动态设置高度
        setting.css({
            'height': window.innerHeight + "px",
            'display': 'block'
        });
        $('#settingAppearance').css('height', (window.innerHeight - 110) + "px");

    });
    // 关闭设置
    $("#closeSetting").click(() => {
        setting.css('display', 'none');
        // 恢复保存前的设置
    });

    // 背景透明度拖动条改变
    $("#bgOpacity").bind('input porpertychange', (e) => {
        let value = e.target.value;
        let opacity = value / 100.0;
        $('.bgOpacity-val').html(value);
        $('.background').css('opacity', opacity + '');
    });

    // 应用设置
    $('.applySetting').click(() => {
        // 背景透明度
        let opacity = $('.background').css('opacity');

        let settings = {};
        settings.bgOpacity = opacity;

        // 保存到本地
        ChromeSync({settings: settings});
        // 设置框消失
        setting.css('display', 'none');
    });


    // 加载设置窗口的内容
    // $("#searsh_bar_margin_top").val(search_bar_margin_top);
    // $("#searsh_bar_background").val(search_bar_background);

    // 背景透明度
    // var opacity = localSettings.bgOpacity;
    // $('.background').css('opacity', opacity);
    // $("#bgOpacity").val(parseInt(100 * opacity));
    // $('.bgOpacity-val').html(parseInt(100 * opacity));

}