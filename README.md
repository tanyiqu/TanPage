# TanPage

一款简洁、精美的浏览器主页扩展，基于 Manifest V3 开发，兼容谷歌内核浏览器（Chrome / Edge 等）与 Firefox。

## 功能特性

- **多功能搜索**：内置百度、必应、谷歌、bilibili、淘宝、京东等 17 个常用搜索引擎，支持一键切换与自定义添加
- **智能搜索建议**：输入时实时获取百度搜索建议，支持键盘上下键选择
- **书签管理**：自定义书签的增删改查、拖拽排序、导入导出
- **多源壁纸**：支持默认 / 本地 / Bing每日一图 / 自定义壁纸源四种模式，可调整白色/黑色笼罩与模糊度，支持一键下载当前壁纸（已申请跨域权限，远程壁纸源无需支持 CORS 即可展示与保存）
- **右键菜单**：选中文字后可直接使用默认引擎搜索、跳转到选中链接、调用有道翻译
- **历史记录**：查看与清除浏览历史（支持 1小时 / 24小时 / 7天 / 30天 / 全部）
- **设置同步**：支持设置导入导出，便于跨设备迁移

## 目录结构

```
TanPage/
├── Universal/          # 主版本（Manifest V3，同时适配 Chrome 与 Firefox）
│   ├── manifest.json   # 扩展清单（MV3）
│   ├── pages/          # 新标签页 / 历史页 / 弹出页
│   ├── css/            # 样式表（含 .less 源文件）
│   ├── js/             # 业务逻辑脚本
│   └── imgs/           # 图标与图片资源
├── Chrome/             # 旧版 Chrome 专用（MV2，仅归档参考）
├── FireFox/            # 旧版 Firefox 专用（MV2，仅归档参考）
├── PrivacyPolicy/      # 隐私政策
├── setting.json        # 配置默认值参考（与 DEFAULT_SETTINGS 保持一致）
└── progress.md         # 项目开发进展记录
```

> 说明：`Universal/` 是当前唯一维护的版本。`Chrome/` 与 `FireFox/` 为历史 MV2 版本，仅作归档，功能上已被 `Universal/` 取代。

## 安装方式

### 开发模式加载（Chrome / Edge）

1. 打开浏览器扩展管理页（`chrome://extensions`）
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择 `Universal/` 目录
4. 新开一个标签页即可看到 TanPage

### 开发模式加载（Firefox）

1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击「临时载入附加组件」，选择 `Universal/manifest.json`

## 代码说明

- 后台脚本 `js/background.js`：负责初始化默认配置、右键菜单与"恢复默认设置"消息处理
- 默认配置集中在 `DEFAULT_SETTINGS` 常量中（见 `background.js`），首次安装与恢复默认共用，保证行为一致
- 新增引擎/书签配置存储在 `chrome.storage.local`，本地壁纸以 base64（dataurl）存储
- 远程壁纸（Bing每日一图 / 自定义壁纸源）通过 `manifest.json` 中 `<all_urls>`、`*://*/*` 的跨域 host 权限加载：`<img crossOrigin='anonymous'>` 的 CORS 请求被浏览器放行，壁纸展示与「保存壁纸」canvas 导出均可正常工作，无需壁纸源支持 CORS

## 许可协议

本项目遵循 [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html) 协议开源。

## 反馈与建议

欢迎在 [GitHub Issues](https://github.com/Tanyiqu/TanPage/issues) 提交 Bug 反馈或功能建议。
