/**
 * 设置框的内容太多，单独放在一个js文件里面
 */

// 设置框
let setting = $('#setting');
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

    // 加载设置
    if (firstOpenSetting) {
        loadSetting();
        firstOpenSetting = false;
    }

    // 动态设置高度
    setting.css({
        'height': window.innerHeight + "px",
    });
    settingAppearance.css('height', (window.innerHeight - (50 + 60 + 60)) + "px");
    settingLogical.css('height', (window.innerHeight - (50 + 60 + 60)) + "px");
    settingOther.css('height', (window.innerHeight - (50 + 60 + 60)) + "px");


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

    // 加载样式
    loadSettingAppearance();

    // 加载功能按钮
    loadFunctionBtns();

    // 加载设置项的值
    loadSettingValues();
}


/**
 * 加载样式
 */
function loadSettingAppearance() {

}

/**
 * 加载功能按钮
 */
function loadFunctionBtns() {
    // 应用设置
    $('.applySetting').click(() => {

        // 设置背景设置相关值
        setBGSettingValues();

        // 设置页面设置相关值
        setPageSettingValues();

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
    // 壁纸模糊度拖动条改变
    $('#bgBlurry').RangeSlider(($this) => {
        let blurry = $this.value / 10.0;
        $('.background').css('filter', ' blur(' + blurry + 'px)');
    }, $('#bgBlurryValue'), true);

    // 选择壁纸功能
    chooseBG();
}


/**
 * 加载设置项的值
 */
function loadSettingValues() {
    // 背景模式
    loadBGSettingValues();

    // 页面设置
    loadPageSettingValues();

}


/**
 * 加载背景设置相关值
 */
function loadBGSettingValues() {
    // 背景模式
    switch (bg_setting.bg_mode) {
        case 0:
            $('#defaultWP').attr('checked', 'checked');
            break
        case 1:
            $('#localWP').attr('checked', 'checked');
            break
        case 2:
            $('#BingWP').attr('checked', 'checked');
            break
        case 3:
            $('#otherWP').attr('checked', 'checked');
            break
    }
    // 白色笼罩
    $('#whiteShroud').val(bg_setting.bg_white_shade);
    $('#whiteShroud').css('background-size', bg_setting.bg_white_shade + '% 100%');
    $('.whiteShroudShade').css('opacity', (bg_setting.bg_white_shade / 100.0) + '');
    $('#whiteShroudValue').html(bg_setting.bg_white_shade + '%');
    // 黑色笼罩
    $('#blackShroud').val(bg_setting.bg_black_shade);
    $('#blackShroud').css('background-size', bg_setting.bg_black_shade + '% 100%');
    $('.blackShroudShade').css('opacity', (bg_setting.bg_black_shade / 100.0) + '');
    $('#blackShroudValue').html(bg_setting.bg_black_shade + '%');
    // 模糊度
    $('#bgBlurry').val(bg_setting.bg_blurry);
    $('#bgBlurry').css('background-size', bg_setting.bg_blurry + '% 100%');
    $('.background').css('filter', ' blur(' + (bg_setting.bg_blurry / 10.0) + 'px)');
    $('#bgBlurryValue').html(bg_setting.bg_blurry + '%');
    // 背景大小限制
    $('#bgSizeLimit').val(bg_setting.bg_size_limit);
}


/**
 * 页面设置
 */
function loadPageSettingValues() {
    // 页面打开方式
    if (page_setting.search_target_self) {
        $('#thisPGForSh').attr('checked', 'checked');
    } else {
        $('#newPGForSh').attr('checked', 'checked');
    }
    if (page_setting.bookmark_target_self) {
        $('#thisPGForBm').attr('checked', 'checked');
    } else {
        $('#newPGForBm').attr('checked', 'checked');
    }

}


/**
 * 设置背景设置相关值
 */
function setBGSettingValues() {
    // 笼罩和模糊度
    bg_setting.bg_white_shade = parseInt($('#whiteShroud').val());
    bg_setting.bg_black_shade = parseInt($('#blackShroud').val());
    bg_setting.bg_blurry = parseInt($('#bgBlurry').val());
    // 背景大小限制
    bg_setting.bg_size_limit = parseInt($('#bgSizeLimit').val());


    // 保存本地
    ChromeLocalSet({ bg_setting: bg_setting });

}

/**
 * 设置页面设置相关值
 */
function setPageSettingValues() {
    // 页面打开方式
    page_setting.search_target_self = ($('input:radio[name="targetForSh"]:checked').val() === 'thisPGForSh');
    page_setting.bookmark_target_self = ($('input:radio[name="targetForBm"]:checked').val() === 'thisPGForBm');

    // 保存本地
    ChromeLocalSet({ page_setting: page_setting });
}

/**
 * 选择壁纸
 */
function chooseBG() {
    // 默认
    $('#defaultWP').click(() => {
        bg_setting.bg_mode = 0;
        ChromeLocalSet({ bg_setting: bg_setting }, () => {
            loadBG();
        });

    });

    // 本地
    $('#chooselocalWP').change(() => {
        // 选择了图片
        console.log('0011');
        //获取读取我文件的File对象
        let selectedFile = $('#chooselocalWP')[0].files[0];
        $('#chooselocalWP').val('');

        if (selectedFile.size > bg_setting.bg_size_limit) {
            Toast.error('文件太大可能导致加载过慢！<br>可以在 “设置->逻辑->本地壁纸大小限制” 里更改预设值！');
            return;
        }

        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = function () {
            // showCutEngineLogoWindow(this.result);
            bg_setting.bg_localdata = this.result;
            bg_setting.bg_mode = 1;
            ChromeLocalSet({ bg_setting: bg_setting }, () => {
                loadBG();
            });
        }
    });
    $('#localWP').click(() => {
        // 弹出选择文件框
        $('#chooselocalWP').click();
    });

    // 必应
    $('#BingWP').click(() => {
        bg_setting.bg_mode = 2;
        ChromeLocalSet({ bg_setting: bg_setting }, () => {
            loadBG();
        });
    });

    // 自定义
    $('#customWP').click(() => {
        bg_setting.bg_mode = 3;
        ChromeLocalSet({ bg_setting: bg_setting }, () => {
            loadBG();
        });
    });

    // 其他
    $('#otherWP').click(() => {
        bg_setting.bg_mode = 0;
        ChromeLocalSet({ bg_setting: bg_setting }, () => {
            loadBG();
        });

    });
}