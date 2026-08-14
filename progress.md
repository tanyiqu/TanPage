# TanPage 项目进展

> 本文档用于记录项目开发进展，方便新开对话时快速了解项目状态。

## 项目概况

- **定位**：浏览器主页扩展（新标签页），Manifest V3，兼容 Chrome/Edge/Firefox
- **主版本**：`src/`（唯一维护版本，Manifest V3）
- **归档版本**：已删除（原 `Chrome/`、`FireFox/` 为 MV2 历史版本，已于本次清理中移除）
- **GitHub**：https://github.com/Tanyiqu/TanPage
- **许可证**：GPL-3.0

---

## 已完成的事项

### 一、代码质量与 Bug 修复

- [x] **修复 `String.prototype.format` 对象模式失效 Bug**（`js/utils.js`）
  - 原代码 `args.key` 恒为 `undefined`，命名占位符模式永不生效；已改为 `args[key]`，并重写正则转义花括号
- [x] **修复搜索词 URL 编码 Bug**（`js/newetab.js`）
  - 原实现用 `replace('#','%23')`、`replace('+','%2B')` 只替换第一个匹配且不完整；已改用 `encodeURIComponent()` 整体编码（搜索框提交、搜索建议点击两处）
- [x] **修复远程壁纸 CORS 无法加载 Bug**（`manifest.json`）
  - 根因：`js/newetab.js` 中 `bgImg.crossOrigin = 'anonymous'` 使浏览器以 CORS 模式加载远程壁纸，而必应每日一图等壁纸源不返回 CORS 头，请求被浏览器拦截，背景无法展示
  - 解决：`host_permissions` 添加 `<all_urls>`、`*://*/*`，扩展获得跨域访问权限后，CORS 校验被放行，远程壁纸正常加载
  - 附带收益：跨域壁纸绘制到 canvas 不再被"污染"，「保存壁纸」导出功能对任意壁纸源均可用
- [x] **修复历史记录列表跳项 Bug**（`js/history.js`）
  - 原代码无条件 `if (index === 0) return true` 跳过第一条记录；改为过滤当前页面自身 URL
- [x] **限制历史查询条数**（`js/history.js`）
  - `maxResults` 从 `2147483647` 改为 `1000`，避免 "all time" 查询全量拉取导致卡顿
- [x] **修复 XHR 状态判断优先级 Bug**（`js/background.js`）
  - `readyState==4 && status==200 || status==304` → 加上括号 `(status==200 || status==304)`
- [x] **修复 `getPosition` 隐式全局变量**（`js/utils.js`）：`_x`/`_y` → `let x`/`y`
- [x] **修复 `cutEngineLogo.js` 隐式全局变量**：`dataUrl`、拖拽缩放中的 `w`/`h` 补上 `var` 声明，移除废弃的 `mouseCoor`
- [x] **清理全部业务代码 `console.log` 调试输出**（background/newetab/history/settingForm/cutEngineLogo）
- [x] **修复清除历史下拉菜单被列表表头遮挡 Bug**（`css/history.css` + `css/history.less`）
  - 症状：悬浮「Clear History」展开的下拉菜单（`#sub`）与列表表头 `.ul-header` 重叠的部分被盖住，无法点击
  - 根因：`.header` 与 `.ul-header` 同为 `position: fixed; z-index: 10`，按 DOM 顺序后渲染的 `.ul-header` 绘制在上；`.clear-history-nav` 的 `z-index: 20` 只在父级 `.header` 的层叠上下文内有效，无法与根层的 `.ul-header` 比较
  - 解决：`.header` 的 `z-index` 提升为 `20`（高于 `.ul-header` 的 `10`），整个头部层叠上下文（含清除历史下拉）恒位于列表表头之上；`history.less` 源文件同步修改

### 二、右键菜单功能合并（重要）

- [x] **Universal 版右键菜单从空壳恢复为完整功能**（`js/background.js`）
  - 原来 Universal 版右键菜单只 `console.log`（功能被注释），Chrome 版才有完整实现，导致主版本功能退化
  - 已合并三个菜单项：**默认引擎搜索 / 跳转到选中链接 / 有道翻译**
  - 适配 MV3：`alert()` 在 Service Worker 不可用 → 改用 `chrome.notifications`；`window.open` 不可用 → 改用 `chrome.tabs.create`
  - 翻译接口从 `http://` 升级为 `https://fanyi.youdao.com`

### 三、权限精简与安全（`manifest.json`）

- [x] 移除 `<all_urls>`、`http://*/*`、`https://*/*` 冗余 host 权限
- [x] `host_permissions` 精简为实际用到的：`https://suggestion.baidu.com/*`、`https://fanyi.youdao.com/*`
- [x] 新增 `notifications` 权限（翻译结果通知需要）
- [x] 默认引擎、搜索建议、自定义壁纸源等 URL 统一由 `http://` 升级为 `https://`
- [x] 为修复远程壁纸跨域加载，`host_permissions` 调整回全局权限：`<all_urls>`、`*://*/*`（覆盖上述两个具体域名，见"一、Bug 修复"）

### 四、新增功能

- [x] **设置"恢复默认"真正生效**（`js/settingForm.js` + `js/background.js`）
  - 原实现只关闭设置框不重置数据
  - 现在通过 `chrome.runtime.sendMessage({action:'resetSettings'})` 通知后台写入默认配置（保留用户本地壁纸），并 Toast 提示
- [x] **默认配置收敛为单一来源 `DEFAULT_SETTINGS`**（`js/background.js`）
  - 首次安装初始化、恢复默认 共用同一常量，行为一致；版本号从 `chrome.runtime.getManifest().version` 动态读取，不再硬编码

### 五、工程清理

- [x] 删除废弃文件：`background-old.js`、`API.js`（空文件）、`engines.js`（全注释）、`manifest1.json`、`manifest - Chrome.json`、`manifest - Firefox.json`、`Universal.zip`、`extensions.sketch`
- [x] 清理 HTML 注释掉的旧模板代码（newtab.html / history.html）
- [x] 修复失效链接（`tanyiqu.lanzous.com` → GitHub Releases）与伪协议链接（`tanpage://捐助` → `javascript:void(0)`）
- [x] `popup.html` 标题从 `Document` 改为 `TanPage`
- [x] `setting.json` 与 `DEFAULT_SETTINGS` 对齐（参考文档）

### 六、文档

- [x] 重写 `README.md`（功能特性 / 目录结构 / 安装方式 / 代码说明）
- [x] 更新 `js/updatelog.js` 补 1.6.0 版本日志

### 七、历史记录页面完善

- [x] **新增链接列并完善长文本展示**（`pages/history.html` + `js/history.js` + `css/history.css` + `css/history.less`）
  - 表头新增“链接”列，每条记录显示可点击的完整 URL 数据，与标题链接一致在新标签页打开
  - 标题列与链接列采用可收缩的 Flex 布局；空间不足时使用省略号，避免长文本挤压访问时间和访问次数列
  - URL 链接设置原生 `title` 提示，鼠标悬浮时可查看完整地址；标题同步设置提示文本，便于查看被省略的完整标题
- [x] **默认展示改为最近 7 天**（`pages/history.html` + `js/history.js`）
  - 下拉框默认选中项从 `24hours` 改为 `7days`，初始查询时间范围同步改为 7 天，两者保持一致
- [x] **每条记录左侧展示网站 logo**（`js/history.js` + `manifest.json`）
  - 根因：MV3 中 `chrome://favicon` 已弃用，原实现无法加载图标
  - 解决：改用官方 `_favicon/` 接口（`chrome.runtime.getURL('/_favicon/')` + `pageUrl`/`size` 参数），`permissions` 新增 `favicon` 权限；图标加载失败时隐藏破图
- [x] **复选框多选与批量删除**（`pages/history.html` + `js/history.js` + `css/history.css`）
  - 每条记录新增复选框；表头新增全选复选框（全部选中才勾选、部分选中显示半选状态）
  - header 新增「删除选中」按钮，实时显示选中数量，无选中时置灰；批量删除完成后刷新列表并 Toast 提示
- [x] **逻辑收敛重构**：首次加载 / 筛选切换 / 清除历史 / 批量删除统一走 `refreshHistory()`，保证查询行为一致
- [x] **事件委托**：列表事件（单条删除、复选框勾选）绑定在常驻的 `#list` 容器上，列表整体重建后无需重复绑定
- [x] **空列表提示**：查询结果为空时显示「暂无历史记录」
- [x] **修复历史记录左侧图标缺失 Bug**（`js/history.js`）
  - 症状：每一行历史记录左侧的网站 logo 不显示，浏览器审查元素可见该 `<img>` 被加上 `style="display: none;"`
  - 根因：logo 由 `js/history.js` 的 `buildFavicon()` 动态渲染（并非 `history.html` 静态标签）；原实现仅用 MV3 `_favicon/` 接口取图，加载失败时 `error` 回调直接 `$(this).hide()`，于是整行图标被隐藏。`_favicon/` 在部分浏览器（如 Firefox 对 MV3 favicon API 支持不全）或特定环境下取不到图，导致全部行图标缺失
  - 解决：在 `buildFavicon()` 中增加回退策略——`_favicon/` 加载失败时，改用目标站点自带的 `/favicon.ico`（同源请求，不向第三方泄露浏览记录）；仅当两级都失败才隐藏。同时先绑定 `error` 再设置 `src`，避免异步加载触发前事件未绑定而丢失回调
  - 兼容性：保持 MV3 `_favicon/` 为主路径，未改动 `history.html` 结构与既有事件委托逻辑，不影响单条/批量删除等功能

### 八、图标资源修复（newtab 标签页图标不生效）

- [x] **修复新标签页 favicon 不生效 Bug（第一轮：MIME 类型）**（`pages/newtab.html`）
  - 根因：favicon 链接声明 `type="image/x-ico"`，而 `imgs/icon.png` 实际为 PNG 图片，MIME 类型与资源内容不符，Chrome/Edge 拒绝加载，导致新建标签页无图标
  - 解决：`type` 修正为 `image/png`，路径保持 `../imgs/icon.png`（相对 `pages/` 指向 `imgs/icon.png`）
- [x] **图标资源统一为 `imgs/icon.png`**（`manifest.json` + `js/background.js`）
  - `manifest.json` 的 `icons`（16/48/128）与 `action.default_icon` 从 `extensions.png` 改为 `imgs/icon.png`（两文件为同一张 264×264 图片，改动仅统一引用、无视觉变化）
  - `js/background.js` 通知 `iconUrl` 同步改为 `imgs/icon.png`，保证扩展所有图标入口引用一致
  - `src/extensions.png` 保留为兼容副本，不删除
- [x] **修复新标签页 favicon 不生效 Bug（第二轮：相对路径在 newtab 地址下无法解析）**（`js/newetab.js` + `manifest.json`）
  - 复测根因：第一轮修复后 Edge 下仍未生效。原因是 newtab 覆盖页在标签页上显示的地址为 `edge://newtab` / `chrome://newtab`，页面内 `<link rel="icon" href="../imgs/icon.png">` 的相对路径在该地址下无法解析为扩展资源，浏览器请求失败，标签页图标依然不显示
  - 解决：
    1. `js/newetab.js` 顶部新增 `initFavicon()`：页面加载时用 `chrome.runtime.getURL('imgs/icon.png')` 将 favicon `href` 动态改写为扩展绝对路径（扩展页面可调用 `chrome.runtime` API，无需额外权限）
    2. `manifest.json` 新增 `web_accessible_resources` 声明 `imgs/icon.png`（matches `<all_urls>`），确保非扩展上下文（标签页 favicon 请求）能访问该资源
  - 保留 `newtab.html` 静态 `<link rel="icon">` 声明作为直接访问扩展页面 URL 时的兜底，形成「静态声明 + 动态改写」双保险
- [x] **修复新标签页 favicon 不生效 Bug（第三轮：头部提前改写 + 缓存失效）**（`js/favicon.js` + `pages/newtab.html` + `js/newetab.js`）
  - 复测结论：第二轮「body 末尾动态改写 + WAR」的机制本身有效（Edge headless 实测浏览器能正确抓取 `chrome-extension://<id>/imgs/icon.png`）；用户侧仍不生效，多为扩展未重新加载、或浏览器 favicon 缓存残留旧失败状态所致
  - 本轮加固：
    1. favicon 改写逻辑从 `js/newetab.js`（body 末尾加载）独立为 `js/favicon.js`，并在 `newtab.html` 的 `<head>` 中紧跟 `<link rel="icon">` 声明提前执行，确保浏览器 favicon 服务**首次抓取前**就拿到扩展绝对地址，消除时序隐患
    2. 图标地址追加 `?v=扩展版本` 缓存失效参数：扩展升级后 favicon URL 自动变化，强制浏览器重新抓取图标，规避 Edge/Chrome 的 favicon 缓存导致「旧图标 / 无图标」长期残留
    3. 保留静态声明（直接访问扩展页面 URL 时的兜底）与 `web_accessible_resources`（非扩展上下文可访问），形成完整保障链
  - 用户侧排查：若标签页仍无图标，先在扩展管理页对 TanPage 点击「重新加载」再新建标签页；仍未生效则清除浏览器缓存 / favicon 数据库后重试（Edge 存在已知 favicon 缓存问题）

---

## 关键决策

1. **以 `src/` 为唯一主版本**：Manifest V3 同时兼容 Chrome 与 Firefox，MV2 已不被 Chrome 支持。原 `Chrome/`、`FireFox/` 目录已删除，不再保留归档版本。
2. **默认配置单一来源**：所有默认数据集中在 `background.js` 的 `DEFAULT_SETTINGS`，避免"初始化逻辑"与"恢复默认逻辑"写两份导致不一致。
3. **右键菜单功能以 Chrome 版实现为基准合并**：Chrome 版曾有三个完整菜单项，Universal 版因迁移 MV3 时被注释丢失，本次以 Chrome 版为准恢复并做 MV3 适配。
4. **权限最小化**：只保留扩展实际调用的域名权限，符合商店审核要求，同时减小攻击面。
5. **`js/engines.js`、`js/API.js` 等纯注释/空文件直接删除**，不保留无意义文件。
6. **远程壁纸跨域问题通过申请 host 权限解决**（替代早期设想的 CORS 降级方案）：`<img crossOrigin='anonymous'>` 的跨域请求在扩展拥有目标域名 host 权限后会被浏览器放行。`manifest.json` 的 `host_permissions` 添加 `<all_urls>`、`*://*/*`，即可在不改动 `newetab.js` 加载逻辑的前提下，同时解决远程壁纸**展示**与「保存壁纸」**导出**两个问题。
7. **权限策略的权衡**：为兼容任意自定义壁纸源，放弃了「权限最小化」（决策 4），接受全局 host 权限带来的审核提示与攻击面增大。此为功能完整性优先的取舍。
8. **网站 logo 采用 MV3 官方 `_favicon/` 接口**：`chrome://favicon` 在 MV3 已弃用不可用，改用 `favicon` 权限 + `_favicon/` 接口；由于扩展已声明 `<all_urls>` host 权限，新增 `favicon` 权限不会带来额外警告提示。
9. **历史列表事件采用事件委托**：列表每次查询全量重建，事件统一绑定在常驻的 `#list` 容器上（`bindListEvents`），避免每次渲染重复绑定 1000+ 个监听器。
10. **newtab 页面 favicon 使用扩展绝对路径并提前改写**：newtab 覆盖页的标签页地址是 `edge://newtab` / `chrome://newtab`，相对路径资源无法解析，必须通过 `chrome.runtime.getURL()` 生成扩展绝对路径，并在 `<head>` 中提前改写（`js/favicon.js`），配合 `web_accessible_resources` 声明与 `?v=版本号` 缓存失效参数，保证 favicon 服务首次抓取即命中、且不被浏览器 favicon 缓存残留影响。

---

## 未完成的待办

### 功能与性能

- [x] **代码去重**：已删除 `Chrome/`、`FireFox/` 两个 MV2 历史版本目录，项目仅保留 `src/` 单一源码版本
- [ ] **`String.prototype.format` / `isEmpty` 原型扩展**：目前仍挂在原型上，存在与第三方库冲突风险，后续可改为独立工具函数并全量替换调用点
- [ ] **背景图存储**：本地壁纸 base64 存 `chrome.storage.local`（3MB 限制、读写慢），可迁移至 IndexedDB，storage 只存引用
- [ ] **事件委托**：书签/引擎列表每次操作全量重建 DOM 并重新绑定事件，数据量大时卡顿，可改用事件委托（历史列表已完成事件委托改造）
- [ ] **建议列表图标**：搜索建议使用 `imgs/1.png~7.png` 编号图标，可替换为 favicon 或去掉
- [ ] **"其他壁纸源"选项**：设置页中存在但功能未实现（点击提示"敬请期待"），可完善或隐藏

### 工程与发布

- [ ] **构建/CI 流程**：仓库无构建脚本与 CI，`.less` 源文件与编译 `.css` 并存，建议接入自动化构建与打包
- [ ] **`.gitignore`**：建议忽略 `*.zip`、`*.sketch`、`node_modules` 等产物
- [ ] **浏览器商店发布**：确认 Edge/Chrome/Firefox 商店审核对 MV3 + 最小权限的通过情况，补全商店素材
- [ ] **依赖升级**：jQuery 3.5.1 可升级至 3.7.x（含安全修复）；可评估是否引入现代构建（ESM）
- [ ] **README 补充**：可补截图、详细配置说明、常见问题

### 已知遗留问题

- [ ] **`saveJSON` 使用废弃 API**：`document.createEvent('MouseEvents')` / `initMouseEvent` 已废弃，可改用 `a.click()`
- [ ] **右键菜单"跳转到链接"**：MV3 中 `chrome.tabs.create` 打开非 http(s) 协议会被忽略（已做协议白名单校验）
- [ ] **历史记录分页**：目前一次性展示 1000 条，可增加分页/懒加载
- [ ] **Firefox 兼容验证**：MV3 在 Firefox 的 service worker 支持情况需实测（Firefox 对 MV3 支持有限）

---

## 当前版本

- **manifest 版本**：1.6.0
- **Manifest V3**：✅
- **最后更新**：2026-08-13

---

## 变更记录

### 2026-08-13：修复清除历史下拉菜单被表头遮挡

- [x] **修复悬浮「Clear History」展开的下拉菜单被 `.ul-header` 盖住**（`css/history.css` + `css/history.less`）：根因为层叠上下文——`.header` 与 `.ul-header` 同 `z-index: 10` 时按 DOM 顺序 `.ul-header` 绘制在上，且 `.clear-history-nav` 的 `z-index: 20` 受限于父级 `.header` 的层叠上下文、无法与根层比较；将 `.header` 的 `z-index` 提升为 `20` 后，下拉菜单恒显示在列表表头之上
- [x] **同步文档**：`README.md` 代码说明与 `progress.md` 已完成事项/变更记录均已更新

### 2026-08-13：修复历史记录左侧图标缺失

- [x] **修复历史记录每行左侧 logo 不显示**（`js/history.js`）：审查元素可见 `<img>` 被加 `style="display: none;"`，根因为 `buildFavicon()` 仅用 MV3 `_favicon/` 接口、失败时直接 `hide()`；新增回退到站点自带 `/favicon.ico`（同源、不泄露给第三方），两级都失败才隐藏，并先绑 `error` 再设 `src` 规避事件丢失
- [x] **同步文档**：`README.md` 历史页说明、`progress.md` 已完成事项与变更记录均已更新；最后更新日期调整为 2026-08-13

### 2026-08-12：图标修复（第三轮：提前改写 + 缓存失效）

- [x] **favicon 改写提前到 `<head>` 执行**：新增 `js/favicon.js`，在 `newtab.html` 的 `<head>` 中紧随静态 `<link rel="icon">` 声明加载并立即改写为扩展绝对路径，避免浏览器 favicon 服务先请求到错误地址的时序问题；`js/newetab.js` 中不再重复改写
- [x] **新增 `?v=扩展版本` 缓存失效参数**：图标 URL 随扩展版本自动「换新」，强制浏览器重新抓取，规避 favicon 缓存导致的「无图标」残留
- [x] **Edge headless 实测验证**：扩展覆盖页加载后，浏览器成功抓取 `chrome-extension://<id>/imgs/icon.png?v=<version>`，favicon 请求链路正常
- [x] **同步文档**：`README.md` 代码说明与 `progress.md` 已完成事项/关键决策/变更记录同步更新；补充「重新加载扩展 / 清除 favicon 缓存」排查说明

### 2026-08-12：图标修复（新标签页 favicon 不生效）

- [x] **修复新标签页无图标（第一轮）**：`pages/newtab.html` 中 favicon 的 `type` 由 `image/x-ico` 修正为 `image/png`（原 MIME 声明与实际 PNG 内容不符，Chrome 拒绝加载）
- [x] **图标资源统一**：`manifest.json` 的 `icons` / `action.default_icon`、`background.js` 通知 `iconUrl` 全部改为 `imgs/icon.png`，与 favicon 引用保持一致
- [x] **修复新标签页无图标（第二轮，Edge 复测后补充）**：根因是 newtab 覆盖页标签页地址为 `edge://newtab`，相对路径 favicon 无法解析。新增 `js/newetab.js` 的 `initFavicon()`（`chrome.runtime.getURL` 动态改写绝对路径）+ `manifest.json` 的 `web_accessible_resources` 声明，形成「静态声明 + 动态改写」双保险
- [x] **同步文档**：`README.md` 代码说明新增图标统一与 favicon 双保险说明，`progress.md` 已完成事项/关键决策/变更记录均已更新

### 2026-08-12：历史记录页面完善

- [x] **默认展示最近 7 天历史**：下拉框默认选中项与初始查询同步改为 7 天
- [x] **网站 logo 改用 MV3 官方 `_favicon/` 接口**：`chrome://favicon` 在 MV3 已弃用，`manifest.json` 新增 `favicon` 权限，图标加载失败自动隐藏
- [x] **复选框多选 + 批量删除**：每条记录左侧新增复选框，表头支持全选/半选，「删除选中」按钮实时显示数量，无选中时置灰
- [x] **逻辑收敛与事件委托**：查询统一走 `refreshHistory()`；列表事件委托到常驻 `#list` 容器；新增空列表提示
- [x] **同步文档**：`README.md` 功能特性与代码说明、`progress.md` 已完成事项与关键决策均已更新

### 2026-08-12：项目结构精简

- [x] **删除 MV2 历史版本目录**：移除 `Chrome/` 与 `FireFox/` 两个旧版文件夹，消除大量重复代码
- [x] **重命名主版本目录**：`Universal/` → `src/`，命名更简洁规范，符合主流项目目录惯例
- [x] **同步更新文档**：`README.md` 目录结构与安装说明、`progress.md` 项目概况与待办事项均已同步更新
