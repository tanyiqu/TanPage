/**
 * 网页图标（favicon）初始化
 *
 * 背景：扩展通过 chrome_url_overrides.newtab 覆盖新标签页后，标签页地址显示为
 * chrome://newtab / edge://newtab，页面内相对路径（../imgs/icon.png）无法解析为
 * 扩展资源，浏览器 favicon 服务取不到图标，标签页因此显示为"无图标"。
 *
 * 方案（与 manifest.json 配合，形成三重保障）：
 * 1. 本文件放在 <head> 中、静态 <link rel="icon"> 声明之后立即执行，用
 *    chrome.runtime.getURL() 把 favicon 改写为扩展绝对地址
 *    （chrome-extension://<id>/imgs/icon.png），确保浏览器 favicon 服务在首次
 *    抓取前就拿到正确地址，避免"先请求到错误地址、之后才修正"的时序问题；
 * 2. manifest.json 的 web_accessible_resources 声明了 imgs/icon.png（matches
 *    <all_urls>），保证非扩展上下文（标签页 favicon 请求）也能访问该资源；
 * 3. favicon 地址追加 ?v=<扩展版本> 缓存失效参数：扩展升级后地址自动"换新"，
 *    强制浏览器重新抓取图标，规避 Edge/Chrome 的 favicon 缓存导致"旧图标或无
 *    图标"长期残留的问题。
 */
function initFavicon() {
    // 兜底判断：扩展页面必然存在 chrome.runtime，此处仅作防御
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getURL) {
        return;
    }
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
        return;
    }
    // 缓存失效参数随扩展版本变化，版本升级后 favicon 地址自动"换新"
    let version = chrome.runtime.getManifest().version;
    favicon.href = chrome.runtime.getURL('imgs/icon.png') + '?v=' + version;
}

initFavicon();
