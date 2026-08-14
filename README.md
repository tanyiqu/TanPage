# TanPage

一款简洁、精美的浏览器主页扩展，基于 Manifest V3 开发，兼容谷歌内核浏览器（Chrome / Edge 等）与 Firefox。

## 功能特性

- **多功能搜索**：内置百度、必应、谷歌、bilibili、淘宝、京东等 17 个常用搜索引擎，支持一键切换与自定义添加
- **智能搜索建议**：输入时实时获取百度搜索建议，支持键盘上下键选择
- **书签管理**：自定义书签的增删改查、拖拽排序、导入导出
- **多源壁纸**：支持默认 / 本地 / Bing每日一图 / 自定义壁纸源四种模式，可调整白色/黑色笼罩与模糊度，支持一键下载当前壁纸（已申请跨域权限，远程壁纸源无需支持 CORS 即可展示与保存）
- **右键菜单**：选中文字后可直接使用默认引擎搜索、跳转到选中链接、调用有道翻译
- **历史记录**：默认展示最近 7 天浏览历史，支持按 1小时 / 24小时 / 7天 / 30天 / 全部 筛选；每条记录展示网站 logo、标题、URL 与访问时间/次数，过长的标题和链接自动省略（悬浮链接可查看完整 URL），支持单条删除与复选框多选批量删除
- **设置同步**：支持设置导入导出，便于跨设备迁移

## 目录结构

```
TanPage/
├── src/                # 扩展源码（Manifest V3，同时适配 Chrome 与 Firefox）
│   ├── manifest.json   # 扩展清单（MV3）
│   ├── pages/          # 新标签页 / 历史页 / 弹出页
│   ├── css/            # 样式表（含 .less 源文件）
│   ├── js/             # 业务逻辑脚本
│   └── imgs/           # 图标与图片资源
├── PrivacyPolicy/      # 隐私政策
├── setting.json        # 配置默认值参考（与 DEFAULT_SETTINGS 保持一致）
└── progress.md         # 项目开发进展记录
```

> 说明：`src/` 是当前唯一维护的版本（Manifest V3）。早期 `Chrome/` 与 `FireFox/` 两个 MV2 历史版本已删除，功能由 `src/` 完全取代。

## 安装方式

### 开发模式加载（Chrome / Edge）

1. 打开浏览器扩展管理页（`chrome://extensions`）
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择 `src/` 目录
4. 新开一个标签页即可看到 TanPage

### 开发模式加载（Firefox）

1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击「临时载入附加组件」，选择 `src/manifest.json`

## 代码说明

- 后台脚本 `js/background.js`：负责初始化默认配置、右键菜单与"恢复默认设置"消息处理
- 默认配置集中在 `DEFAULT_SETTINGS` 常量中（见 `background.js`），首次安装与恢复默认共用，保证行为一致
- 新增引擎/书签配置存储在 `chrome.storage.local`，本地壁纸以 base64（dataurl）存储
- 远程壁纸（Bing每日一图 / 自定义壁纸源）通过 `manifest.json` 中 `<all_urls>`、`*://*/*` 的跨域 host 权限加载：`<img crossOrigin='anonymous'>` 的 CORS 请求被浏览器放行，壁纸展示与「保存壁纸」canvas 导出均可正常工作，无需壁纸源支持 CORS
- 历史页 `pages/history.html` + `js/history.js`：默认按最近 7 天查询；标题列与链接列使用弹性布局，过长文本以省略号显示，链接通过原生 `title` 提示完整 URL；网站 logo 使用 MV3 官方 `_favicon/` 接口（`chrome://favicon` 在 MV3 已不可用，`manifest.json` 的 `permissions` 需含 `favicon`）；当 `_favicon/` 接口不可用（如部分浏览器对 MV3 favicon API 支持不全）时，自动回退到目标站点自带的 `/favicon.ico`，保证每一行左侧图标都能稳定显示，且不对第三方泄露浏览记录；列表事件通过事件委托绑定在常驻的 `#list` 容器上，列表重建后无需重复绑定
- 历史页头部层级：`.header` 的 `z-index` 为 `20`，高于列表表头 `.ul-header` 的 `10`——`.clear-history-nav` 的下拉菜单是 `.header` 的子元素，其 `z-index` 只在 `.header` 的层叠上下文内生效；若两者同级，按 DOM 顺序后渲染的 `.ul-header` 会盖住展开的「清除历史」下拉菜单，故头部必须保持更高层级
- 扩展图标统一使用 `imgs/icon.png`：`manifest.json` 的 `icons` / `action.default_icon`（商店与工具栏图标）、`background.js` 通知图标均指向该文件；`src/extensions.png` 为同图兼容副本，仅保留以防外部引用
- 新标签页 favicon（标签页图标）采用「静态声明 + 头部提前改写」双保险：`pages/newtab.html` 静态声明 `<link rel="icon" type="image/png">`（`type` 必须是 `image/png`，与 `imgs/icon.png` 的 PNG 内容一致）；由于 newtab 覆盖页在标签页上的地址是 `edge://newtab` / `chrome://newtab`，相对路径无法解析，紧随其后的 `js/favicon.js` 会在浏览器 favicon 服务首次抓取前，用 `chrome.runtime.getURL()` 把图标地址改写为扩展绝对路径，并追加 `?v=扩展版本` 缓存失效参数（版本升级后强制浏览器重新抓取，规避 favicon 缓存导致"无图标"残留）；同时 `manifest.json` 的 `web_accessible_resources` 声明了 `imgs/icon.png`，保证非扩展上下文（标签页 favicon 请求）可访问。若修改代码后标签页仍无图标，请在扩展管理页点击「重新加载」，必要时清除浏览器缓存（Edge 存在已知的 favicon 缓存问题）

## 许可协议

本项目遵循 [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html) 协议开源。

## 反馈与建议

欢迎在 [GitHub Issues](https://github.com/Tanyiqu/TanPage/issues) 提交 Bug 反馈或功能建议。
