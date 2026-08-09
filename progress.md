# TanPage 项目进展

> 本文档用于记录项目开发进展，方便新开对话时快速了解项目状态。

## 项目概况

- **定位**：浏览器主页扩展（新标签页），Manifest V3，兼容 Chrome/Edge/Firefox
- **主版本**：`Universal/`（唯一维护版本）
- **归档版本**：`Chrome/`、`FireFox/`（MV2 历史版本，不再维护）
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

---

## 关键决策

1. **以 `Universal/` 为唯一主版本**：Manifest V3 同时兼容 Chrome 与 Firefox，MV2 已不被 Chrome 支持。`Chrome/`、`FireFox/` 目录保留但仅作归档，不再同步修改。
2. **默认配置单一来源**：所有默认数据集中在 `background.js` 的 `DEFAULT_SETTINGS`，避免"初始化逻辑"与"恢复默认逻辑"写两份导致不一致。
3. **右键菜单功能以 Chrome 版实现为基准合并**：Chrome 版曾有三个完整菜单项，Universal 版因迁移 MV3 时被注释丢失，本次以 Chrome 版为准恢复并做 MV3 适配。
4. **权限最小化**：只保留扩展实际调用的域名权限，符合商店审核要求，同时减小攻击面。
5. **`js/engines.js`、`js/API.js` 等纯注释/空文件直接删除**，不保留无意义文件。
6. **远程壁纸跨域问题通过申请 host 权限解决**（替代早期设想的 CORS 降级方案）：`<img crossOrigin='anonymous'>` 的跨域请求在扩展拥有目标域名 host 权限后会被浏览器放行。`manifest.json` 的 `host_permissions` 添加 `<all_urls>`、`*://*/*`，即可在不改动 `newetab.js` 加载逻辑的前提下，同时解决远程壁纸**展示**与「保存壁纸」**导出**两个问题。
7. **权限策略的权衡**：为兼容任意自定义壁纸源，放弃了「权限最小化」（决策 4），接受全局 host 权限带来的审核提示与攻击面增大。此为功能完整性优先的取舍。

---

## 未完成的待办

### 功能与性能

- [ ] **代码去重**：`Chrome/`、`FireFox/` 与 `Universal/` 的 js/css/html 大量重复。建议后续彻底删除归档目录，或建立构建脚本从单一源码生成各版本
- [ ] **`String.prototype.format` / `isEmpty` 原型扩展**：目前仍挂在原型上，存在与第三方库冲突风险，后续可改为独立工具函数并全量替换调用点
- [ ] **背景图存储**：本地壁纸 base64 存 `chrome.storage.local`（3MB 限制、读写慢），可迁移至 IndexedDB，storage 只存引用
- [ ] **事件委托**：书签/引擎列表每次操作全量重建 DOM 并重新绑定事件，数据量大时卡顿，可改用事件委托
- [ ] **建议列表图标**：搜索建议使用 `imgs/1.png~7.png` 编号图标，可替换为 favicon 或去掉
- [ ] **"其他壁纸源"选项**：设置页中存在但功能未实现（点击提示"敬请期待"），可完善或隐藏

### 工程与发布

- [ ] **构建/CI 流程**：仓库无构建脚本与 CI，`.less` 源文件与编译 `.css` 并存，建议接入自动化构建与打包
- [ ] **`.gitignore`**：建议忽略 `Universal.zip`、`*.sketch`、`node_modules` 等产物
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
- **最后更新**：2026-08-09
