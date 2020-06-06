/**
 * 设置框的内容太多，单独放在一个js文件里面
 */

// 设置框
let setting = $('.setting');
// 初始不要加载设置里面的东西，第一次点击设置按钮时进行加载，以后不用加载
let firstOpenSetting = true;

// 点击设置按钮
$(".showSetting").click(() => {
    // 动态设置高度
    setting.css({
        'height': window.innerHeight + "px",
        'display': 'block'
    });
    $('#settingAppearance').css('height', (window.innerHeight - 110) + "px");

    // 加载设置
    if (firstOpenSetting) {
        loadSetting();
        firstOpenSetting = false;
    }
});

// 点击关闭设置
$("#closeSetting").click(() => {
    setting.css('display', 'none');
    // 恢复保存前的设置
});


/**
 * 加载设置窗口
 */
function loadSetting() {

    // 壁纸白色笼罩拖动条改变
    $('#whiteShroud').RangeSlider(($this) => {
        let opacity = $this.value / 100.0;
        $('.whiteShroudShade').css('opacity', opacity + '');
    }, $('#whiteShroudValue'), true);

    // 壁纸白色笼罩拖动条改变
    $('#blackShroud').RangeSlider(($this) => {
        let opacity = $this.value / 100.0;
        $('.blackShroudShade').css('opacity', opacity + '');
    }, $('#blackShroudValue'), true);

    // 壁纸白色笼罩拖动条改变
    $('#bgBlurry').RangeSlider(($this) => {
        let blurry = $this.value / 10.0;
        //  filter: blur();
        $('.background').css('filter', ' blur(' + blurry + 'px)');
    }, $('#bgBlurryValue'), true);

    // 应用设置
    $('.applySetting').click(() => {
        // 背景透明度
        let opacity = $('.background').css('opacity');

        let settings = {};
        settings.bgOpacity = opacity;

        // 保存到本地
        ChromeSyncSet({ settings: settings });
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

