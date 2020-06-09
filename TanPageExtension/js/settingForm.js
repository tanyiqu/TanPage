/**
 * 设置框的内容太多，单独放在一个js文件里面
 */

// 设置框
let setting = $('.setting');
// 初始不要加载设置里面的东西，第一次点击设置按钮时进行加载，以后不用加载
let firstOpenSetting = true;

let settingAppearance = $('#settingAppearance');
let settingLogical = $('#settingLogical');
let settingOther = $('#settingOther');
let settingAppearanceBtn = $('#settingAppearanceBtn');
let settingLogicalBtn = $('#settingLogicalBtn');
let settingOtherBtn = $('#settingOtherBtn');


// 点击设置按钮
$(".showSetting").click(() => {
    // 动态设置高度
    setting.css({
        'height': window.innerHeight + "px",
        // 'display': 'block'
    });
    settingAppearance.css('height', (window.innerHeight - (50 + 60 + 60)) + "px");
    settingLogical.css('height', (window.innerHeight - (50 + 60 + 60)) + "px");
    settingOther.css('height', (window.innerHeight - (50 + 60 + 60)) + "px");

    // 加载设置
    if (firstOpenSetting) {
        loadSetting();
        firstOpenSetting = false;
    }
    setting.slideLeftShow(400);
});

// 点击关闭设置
$("#closeSetting").click(() => {
    setting.slideLeftHide(400);
    // 恢复保存前的设置
});



/**
 * 加载设置窗口
 */
function loadSetting() {

    // 加载功能按钮
    loadFunctionBtns();

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



}

/**
 * 加载功能按钮
 */
function loadFunctionBtns() {
    // 应用设置
    $('.applySetting').click(() => {
        // 背景透明度

        setting.slideLeftHide(400);
    });

    // 恢复默认
    $('.defaultSetting').click(() => {

        setting.slideLeftHide(400);
    });

    // 切换tab标签页
    settingAppearanceBtn.click(() => {
        settingAppearanceBtn.addClass('active');
        settingLogicalBtn.removeClass('active');
        settingOtherBtn.removeClass('active');
        settingAppearance.css('display', 'block');
        settingLogical.css('display', 'none');
        settingOther.css('display', 'none');
    });

    settingLogicalBtn.click(() => {
        settingAppearanceBtn.removeClass('active');
        settingLogicalBtn.addClass('active');
        settingOtherBtn.removeClass('active');
        settingAppearance.css('display', 'none');
        settingLogical.css('display', 'block');
        settingOther.css('display', 'none');
    });

    settingOtherBtn.click(() => {
        settingAppearanceBtn.removeClass('active');
        settingLogicalBtn.removeClass('active');
        settingOtherBtn.addClass('active');
        settingAppearance.css('display', 'none');
        settingLogical.css('display', 'none');
        settingOther.css('display', 'block');
    });
}



// 暂时自动显示设置框
$(".showSetting").trigger('click');