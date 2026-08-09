/**
 * background.js —— 扩展后台脚本（MV3 Service Worker）
 *
 * 职责：
 *  1. 首次安装时写入默认配置（DEFAULT_SETTINGS）
 *  2. 提供右键菜单：默认引擎搜索 / 跳转到选中链接 / 翻译
 *  3. 提供"恢复默认配置"消息处理，供设置页复用
 *
 * 注意：MV3 的 Service Worker 环境中没有 window/document/alert，
 *       对话框类交互一律使用 chrome.notifications。
 */

// ============================================================
// 默认配置（首次安装 + 恢复默认 均使用此常量，保证行为一致）
// ============================================================
const DEFAULT_SETTINGS = {
    // 首次安装标记
    first: 'first',
    // 版本号
    version: chrome.runtime.getManifest().version,
    // 默认搜索引擎
    engine: 0,
    default_engine_url: 'https://www.baidu.com/s?wd=%s',
    // 搜索引擎列表
    engines: [
        { name: "百度", url: "https://www.baidu.com/s?wd=%s", imgurl: "../imgs/egs/bd.png" },
        { name: "多吉搜索", url: "https://www.dogedoge.com/results?q=%s", imgurl: "../imgs/egs/djss.png" },
        { name: "必应", url: "https://cn.bing.com/search?q=%s", imgurl: "../imgs/egs/by.png" },
        { name: "谷歌搜索", url: "https://www.google.com/search?q=%s", imgurl: "../imgs/egs/ggss.png" },
        { name: "微信公众号", url: "https://weixin.sogou.com/weixin?type=2&query=%s", imgurl: "../imgs/egs/wxgzh.png" },
        { name: "搜狗搜索", url: "https://www.sogou.com/sogou?query=%s", imgurl: "../imgs/egs/sgss.png" },
        { name: "360", url: "https://www.so.com/s?q=%s", imgurl: "../imgs/egs/360.png" },
        { name: "bilibili", url: "https://search.bilibili.com/all?keyword=%s", imgurl: "../imgs/egs/blbl.png" },
        { name: "淘宝", url: "https://s.taobao.com/search?q=%s", imgurl: "../imgs/egs/tb.png" },
        { name: "京东", url: "https://search.jd.com/Search?keyword=%s", imgurl: "../imgs/egs/jd.png" },
        { name: "腾讯视频", url: "https://v.qq.com/x/search/?q=%s", imgurl: "../imgs/egs/txsp.png" },
        { name: "AcFun", url: "https://www.acfun.cn/search?keyword=%s", imgurl: "../imgs/egs/acfun.png" },
        { name: "Iconfont", url: "https://www.iconfont.cn/search/index?q=%s", imgurl: "../imgs/egs/iconfont.png" },
        { name: "Yandex", url: "https://yandex.com/search/?text=%s", imgurl: "../imgs/egs/yandex.png" },
        { name: "CSDN", url: "https://so.csdn.net/so/search/s.do?q=%s", imgurl: "../imgs/egs/csdn.png" },
        { name: "GitHub", url: "https://github.com/search?q=%s", imgurl: "../imgs/egs/github.png" },
        { name: "百度百科", url: "https://baike.baidu.com/search?word=%s", imgurl: "../imgs/egs/bdbk.png" }
    ],
    // 默认书签
    bookmarks: [
        { name: "历史记录", lbl: "History", url: "../pages/history.html" },
        { name: "哔哩哔哩", lbl: "Bili", url: "https://www.bilibili.com/" }
    ],
    // 背景设置（本地壁纸 dataurl 较大，单独存放）
    bg_setting: {
        bg_mode: 0,                      // 背景模式：0默认 1本地 2必应 3自定义
        bg_localdata: "dataurl",         // 本地图片背景时的 dataurl
        bg_white_shade: 5,               // 白色笼罩程度(0-100)
        bg_black_shade: 15,              // 黑色笼罩程度(0-100)
        bg_blurry: 5,                    // 模糊度
        bg_size_limit: 3145728,          // 背景大小限制(字节)
        bg_custom_url: "https://www.dmoe.cc/random.php",  // 自定义壁纸源
        bg_save_type: "image/png"        // 壁纸保存格式
    },
    // 页面设置
    page_setting: {
        search_target_self: true,        // 搜索结果在当前页打开
        bookmark_target_self: false      // 书签在新标签页打开
    }
};

// ============================================================
// 初始化：首次安装时写入默认配置
// ============================================================
chrome.storage.local.get('first', (res) => {
    // first 不存在则视为首次安装，写入默认配置
    if (res.first !== 'first') {
        chrome.storage.local.set(DEFAULT_SETTINGS);
    }
});

// ============================================================
// 网络请求封装
// ============================================================
const MyHttp = {
    /**
     * GET 请求
     * @param {string} url 请求地址
     * @param {Function} success 成功回调，参数为响应文本
     */
    get: (url, success) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            // readyState == 4 表示请求完成，status 200/304 表示成功
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                success(xhr.responseText);
            }
        };
        xhr.send();
    }
};

// ============================================================
// 对话框封装（MV3 Service Worker 无 alert，使用通知代替）
// ============================================================
const MyDialog = {
    /**
     * 显示翻译结果通知
     * @param {string} title 通知标题
     * @param {string} message 通知内容
     */
    show: (title, message) => {
        chrome.notifications.create('tanpage-dialog', {
            type: 'basic',
            iconUrl: 'extensions.png',
            title: title,
            message: message
        });
    }
};

// ============================================================
// 右键菜单：默认引擎搜索 / 跳转到链接 / 翻译
// ============================================================
// 安装时创建菜单，避免重复创建报错
chrome.runtime.onInstalled.addListener(() => {
    createContextMenus();
});

function createContextMenus() {
    // 清理旧菜单，防止重复 id 报错
    chrome.contextMenus.removeAll(() => {
        // 1. 默认引擎搜索
        chrome.contextMenus.create({
            id: 'menu-default-search',
            title: '默认引擎搜索：%s',   // %s 表示选中的文字
            contexts: ['selection']
        });

        // 2. 跳转到选中的链接
        chrome.contextMenus.create({
            id: 'menu-open-link',
            title: '跳转到此链接：%s',
            contexts: ['selection']
        });

        // 3. 翻译
        chrome.contextMenus.create({
            id: 'menu-translate',
            title: '翻译: 【%s】',
            contexts: ['selection']
        });
    });
}

chrome.contextMenus.onClicked.addListener((params) => {
    switch (params.menuItemId) {
        case 'menu-default-search':
            onDefaultSearch(params.selectionText);
            break;
        case 'menu-open-link':
            onOpenLink(params.selectionText);
            break;
        case 'menu-translate':
            onTranslate(params.selectionText);
            break;
    }
});

/**
 * 使用默认引擎搜索选中的文字
 * @param {string} text 选中的文字
 */
function onDefaultSearch(text) {
    chrome.storage.local.get('default_engine_url', (res) => {
        const url = (res.default_engine_url || DEFAULT_SETTINGS.default_engine_url)
            .replace('%s', encodeURIComponent(text));
        chrome.tabs.create({ url: url });
    });
}

/**
 * 跳转到选中的链接（仅允许 http/https 协议）
 * @param {string} text 选中的文字（应为 URL）
 */
function onOpenLink(text) {
    try {
        const url = new URL(text);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            chrome.tabs.create({ url: url.href });
        }
    } catch (e) {
        // 选中的内容不是合法 URL，忽略
    }
}

/**
 * 调用有道翻译接口并展示结果
 * @param {string} text 选中的文字
 */
function onTranslate(text) {
    const apiUrl = `https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${encodeURIComponent(text)}`;
    MyHttp.get(apiUrl, (res) => {
        try {
            const obj = JSON.parse(res);
            const result = obj.translateResult[0][0]['tgt'];
            MyDialog.show('翻译结果', text + '\n\n' + result);
        } catch (e) {
            MyDialog.show('翻译失败', '请求翻译服务出错，请稍后重试');
        }
    });
}

// ============================================================
// 消息处理：供设置页调用"恢复默认配置"
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === 'resetSettings') {
        // 重置配置，但保留用户本地壁纸 dataurl（避免误删大体积数据）
        chrome.storage.local.get('bg_setting', (res) => {
            const resetSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            if (res.bg_setting && res.bg_setting.bg_localdata) {
                resetSettings.bg_setting.bg_localdata = res.bg_setting.bg_localdata;
            }
            chrome.storage.local.set(resetSettings, () => {
                sendResponse({ success: true });
            });
        });
        return true; // 异步响应
    }
});
