# Live2D 看板娘集成说明

本博客的看板娘基于 Mizuki 模版自带的 **Pio 插件**（作者 [Dreamer-Paul](https://github.com/Dreamer-Paul/Pio)，GPL 2.0），
模型替换为 **DeepSeek-chan（大肥鱼）**，渲染层由 Cubism 2 升级为 **Cubism 3/4/5 运行时**
（[pixi.js](https://pixijs.com/) + [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display) + 官方 Cubism Core）。

## 效果

- 桌面端（视口宽度 > 1024px）左下角显示 Live2D 角色，可拖拽移动。
- 角色会循环播放 IDLE 待机动作；点击角色会播放随机身体动作（举手 / 摆尾 / 竖手指等）并随机切换表情。
- 鼠标悬停显示 Pio 的操作按钮：回到首页、关于（跳转仓库）、关闭看板娘。
- 首次加载时先显示角色缩略图占位，模型就绪后淡出。
- 移动端 / 小屏 / 省流量模式（`navigator.connection.saveData`）下不加载模型，避免浪费流量：
  `Layout.astro` 会在 `<head>` 里注入一段 `@media (max-width: <mobileBreakpoint>px)` 样式直接隐藏看板娘
  （SSR 阶段即生效，不依赖 JS），`Pio.svelte` 在 `onMount` 时再跳过脚本加载。
- 模型加载失败时，占位层会显示错误面板（含具体错误信息），并隐藏 canvas，避免 WebGL 上下文异常时出现空白色块。

## 目录与文件

```
public/
├── live2d/                              # 模型资源（第三方，单独授权，见下）
│   ├── README.md                        # 资源说明 + 署名 + 授权摘要 + 改名映射表
│   └── models/taifish/
│       ├── taifish.model3.json          # 模型入口（Cubism 3+ 格式）
│       ├── taifish.moc3                 # Cubism 模型主体（16,498,560 B，与作者原文件逐字节一致）
│       ├── taifish.physics3.json        # 物理（头发/裙子/尾巴摇摆）
│       ├── taifish.cdi3.json            # 参数显示信息
│       ├── preview.png                  # 852×852 角色缩略图（作者发布的原图）
│       ├── preview.webp                 # 512×512 加载占位图（约 49 KB，实际使用）
│       ├── LICENSE.txt                  # 作者使用须知（原文，请勿删除）
│       ├── textures/                    # texture_00..04.webp（最长边 ≤2048，共约 1.54 MB）
│       ├── motions/                     # 8 个动作（idle + 7 个交互动作）
│       └── expressions/                 # 23 个表情
├── pio/static/
│   ├── live2dcubismcore.min.js          # 官方 Cubism Core 5.x（必须先于 l2d.js 加载）
│   ├── l2d.js                           # Cubism 3/4 渲染运行时（pixi 打包产物，提供全局 loadlive2d）
│   ├── pio.js                           # Pio 插件逻辑（对话 / 按钮 / 拖拽）
│   ├── pio.css                          # Pio 样式 + 看板娘集成样式
│   └── avatar.jpg                       # 关闭看板娘后右下角的小头像
└── ...

src/
├── config.ts                            # pioConfig / footerConfig 配置
├── types/config.ts                      # PioConfig 类型（含 live2d 选项）
├── components/features/pio/
│   ├── Pio.svelte                       # Pio 组件：按顺序加载脚本、占位图、事件处理
│   └── types.ts
└── layouts/Layout.astro                 # pioConfig.enable 时加载 pio.css 并渲染 <Pio client:visible />
```

## 工作原理

```
Pio.svelte (Astro island, client:visible)
   │  注入 window.__LIVE2D_OPTIONS（缩放/偏移/待机参数）
   ├─► <script /pio/static/live2dcubismcore.min.js>    官方 Cubism Core，定义 window.Live2DCubismCore
   ├─► <script /pio/static/l2d.js>                     打包的渲染器，定义 window.loadlive2d(canvasId, modelPath)
   ├─► <script /pio/static/pio.js>                     定义 window.Paul_Pio（插件入口）
   └─► new Paul_Pio({ model: ["/live2d/models/taifish/taifish.model3.json"], ... })
          └─► loadlive2d("pio", modelPath)
                 ├─ 创建 PIXI.Application（透明背景、autoDensity、resolution=min(dpr,2)）
                 ├─ 加载 model3.json / moc3 / 物理 / 贴图 / 动作 / 表情
                 ├─ 自动适配：按 canvas 宽高缩放，水平居中、底部对齐
                 └─ 派发 window 事件：
                      "live2d:loaded"  detail={canvasId, modelPath, layout, loadMs}  模型渲染就绪
                      "live2d:error"   detail={canvasId, error}                      加载失败
                      canvas.dataset.live2dReady = "1"
```

- `pio.js` 未做任何修改，仍然通过全局 `loadlive2d("pio", path)` 驱动模型（该 API 名称沿用了 Cubism 2 时代的约定）。
- `l2d.js` 内部自带 pixi.js，**不需要**页面另外引入 PIXI；唯一的前置依赖是 `live2dcubismcore.min.js`。
- 点击交互：`l2d.js` 用 `addEventListener("click")` 监听 canvas（不覆盖 `canvas.onclick`），
  因此 Pio 插件的点击对话与 Live2D 的动作/表情反应可以同时生效。
- 重复调用 `loadlive2d`（例如 Pio 的「换装」按钮、关闭后再打开）是安全的：同一个 canvas 会复用已创建的 WebGL 渲染器
（缓存在 `WeakMap` 里），只销毁旧模型、重新加载新模型，避免因重复创建上下文而报
`Invalid value of 0 passed to checkMaxIfStatementsInShader`；也不会叠加 canvas 或 ticker。

## 配置（`src/config.ts`）

```ts
export const pioConfig: PioConfig = {
	enable: true,
	models: ["/live2d/models/taifish/taifish.model3.json"],
	position: "left",          // "left" | "right"
	width: 300,                // 画布 CSS 宽度（px）
	height: 420,               // 画布 CSS 高度（px）
	mode: "draggable",         // "static" | "fixed" | "draggable"
	hiddenOnMobile: true,
	live2d: {
		scale: 1.12,           // 缩放倍数（1 = 自动“完整适配”）
		offsetX: 0,            // 水平偏移（canvas 像素，正值向右）
		offsetY: 17,           // 垂直偏移（canvas 像素，正值向下）
		idleGroupName: "Idle", // 待机动作组
		idleIntervalMs: 6000,  // 待机动作兜底间隔（ms）
		expressions: true,     // 点击时随机切换表情
		mobileBreakpoint: 1024,// 视口宽度 ≤ 该值时隐藏（同时不下载模型）
		preview: "/live2d/models/taifish/preview.webp", // 加载占位图（可选）
	},
	dialog: { ... },           // Pio 的欢迎词 / 触摸台词 / 按钮提示
};
```

调整建议：

- **模型太小/太大**：优先改 `width` / `height`（画布越大角色越大），或设置 `live2d.scale`（如 `1.15`）微调。
- **角色被裁切**：用 `live2d.offsetY` 上下平移（正值向下），`offsetX` 左右平移。
- **想静音点击反应**：把 `live2d.expressions` 设为 `false`（仍会播放身体动作）。
- **移动端也想显示**：`hiddenOnMobile: false`，但请注意模型首次加载约 19 MB。
- 修改 `width` / `height` 后，`Pio.svelte` 中的 canvas 内联尺寸会同步更新，无需改 CSS。

### 画面调整（300×420 画布实测）

模型原始画布为 3749×7697（竖长），运行时按 canvas 宽度/高度自动“完整适配”后再乘 `scale`。
以下数值是在 300×420 canvas、DPR 1/2 下用无头浏览器实测的推荐组合：

| 效果 | `scale` | `offsetY` | 说明 |
| --- | --- | --- | --- |
| **全身完整显示（默认）** | `1.12` | `17` | 角色高约 93.5% canvas，头顶留 22px、脚底留 5.5px |
| 全身、略小 | `1` | `0` | 脚底距底部约 20px |
| 膝盖以上特写 | `2.0` | `339` | 脸部/表情更大，裁切在膝盖上方；左右各留约 14px |

- 只要画布是“高度受限”的等比缩放，`offsetY` 与 canvas 高度近似成正比：`offsetY(h) ≈ offsetY(420) × h / 420`。
  例如 300×460 画布，全身用 `scale: 1.12, offsetY: 21`，膝盖以上特写用 `scale: 2.0, offsetY: 372`。
- 不要再缩小到 `scale: 1.8, offsetY: 265` 一类的中间值：尾巴会贴近右边缘，播放动作时有被裁切的风险。
- 其他可选参数（完整表格见运行时目录的 `README.md`）：`fill`（自动适配留白）、`anchor`（`bottom`/`top`/`center`）、
  `idleIntervalMs`、`expressionResetMs`、`clickReactions`、`logLevel`。

## 版权与署名（重要）

模型 **不是** 本仓库代码的一部分，也不适用仓库自身的开源协议，使用需遵守作者的使用须知：

- 模型：**DeepSeek-chan（大肥鱼）**
- 原画及拆分：**神宫凉子**
- Live2D 建模：**霓虹猫_NeonNeko**
- 完整条款：`public/live2d/models/taifish/LICENSE.txt`（作者原文），摘要见 `public/live2d/README.md`

要点：允许个人直播/视频/社交平台使用、允许个人二创（需署名）；**禁止**转售、重新上传完整模型文件供他人下载、
冒充作者或隐瞒出处；品牌商单等商业用途需先联系作者。

页面底部已通过 `footerConfig.customHtml` 展示署名并链接到使用须知，**请勿删除**。

## 资源转换流程（如何从作者原包重新生成 `public/live2d`）

作者发布的是 VTube Studio 工程包（16 MB moc3 + 5 张最大 8192×8192 的 PNG 贴图，贴图共约 46 MB）。
为了网页加载，做了以下**仅限资源体积**的处理，模型本体未改动：

1. `*.moc3` / `*.physics3.json` / `*.cdi3.json`：逐字节复制。
2. 贴图：等比缩小到最长边 2048（LANCZOS），转 WebP q90（保留 alpha）。
   `texture_00..04` 合计 45.7 MB → **1.54 MB**；alpha 通道逐位一致，不透明区域 PSNR 38.6–49.2 dB，肉眼无损。
3. 文件名全部改为 ASCII，并重建 `taifish.model3.json`：
   - `Motions`：`Idle` = IDLE；`TapBody` = 举手切换动作；`FlickHead` = 脱捕（大幅动作）；
     `Extra` = 狗尾草 / 竖手指切换动作；每条动作 `FadeInTime`/`FadeOutTime` = 0.5。
   - `Expressions`：作者 `Exp3/` 中的 23 个表情全部登记（中文名 → ASCII 映射见 `public/live2d/README.md`）。
   - 保留原 `Groups`（EyeBlink、LipSync），`HitAreas` 为空（原模型没有命中区域）。
4. 复制作者的使用须知为 `LICENSE.txt`，并生成 `preview.png` 占位图。

若要换用其他 Cubism 3/4 模型：把模型放到 `public/live2d/models/<name>/`，保证 `model3.json` 中
引用的相对路径全部存在（贴图可为 png/webp），然后修改 `pioConfig.models` 指向新的 `*.model3.json` 即可。
Cubism 2 的 `model.json` / `.moc` 模型**不能**用这套运行时加载。

## 性能与加载策略

- 首次加载体积：`moc3` ≈ 16.5 MB（Vercel/CDN 会 gzip/br 压缩，实际传输明显更小）+ 贴图 1.54 MB + 动作/表情/物理约 0.4 MB；
  之后由浏览器 HTTP 缓存，二次访问几乎无网络开销。
- 贴图在 GPU 中解码为约 64 MB 显存（2048 上限的 RGBA），移动端已默认隐藏。
- 加载时机：`<Pio client:visible />`（进入视口才水合）+ `requestIdleCallback` + 视口宽度/省流量判断，
  不会阻塞首页渲染；脚本按 core → l2d → pio 顺序串行加载。
- Cubism Core 为官方 5.x 版本，支持 moc3 v5（本模型文件版本 5）。

## 本地验证

```bash
pnpm install
pnpm exec astro build        # 或 pnpm build（会额外跑 anime/pagefind/字体压缩）
pnpm exec astro preview      # 默认 http://localhost:4321
```

用浏览器打开首页，桌面端（宽度 > 1024）应看到左下角角色；控制台应出现：

```
[Pio] 看板娘初始化成功
```

若需无头验证（截图 + 像素统计 + 控制台错误捕获），可复用工程外的 Playwright 脚本
`live2d-work/bundle/verify/verify-live2d.mjs`（开发环境脚本，不在仓库内）：

```bash
node live2d-work/bundle/verify/verify-live2d.mjs --url http://127.0.0.1:4321/ --out /tmp/live2d.png
```

## 部署

推送到 `WUST_RM/WUST_RM_blog` 后由 Vercel 自动构建部署。新增的 `public/live2d/` 为静态文件，
无需额外配置；如站点使用自己的 CDN，请确认 `.webp` 与 `.moc3` 的 MIME 类型可正常返回
（Vercel 默认 `application/octet-stream` 即可被 fetch 读取）。

## 常见问题

| 现象 | 排查 |
| --- | --- |
| 左下角只显示占位图 / 一直 Loading | 打开控制台看是否有 404：`/pio/static/live2dcubismcore.min.js`、`/pio/static/l2d.js`、`/live2d/models/taifish/*`；确认文件已提交 |
| `Live2DCubismCore is not defined` | 脚本顺序错误：core 必须在 `l2d.js` 之前加载（`Pio.svelte` 已保证） |
| `Failed to load model` / moc3 解析失败 | 确认 `taifish.moc3` 完整（16,498,560 B，sha256 `b708e795…b1052e6`），且未被 git 换行/过滤破坏 |
| 角色显示为空白或只有一半 | 调整 `width`/`height` 或 `live2d.scale` / `offsetY`；模型原始画布为 3749×7697（竖长比例） |
| 鼻子上出现黑色小方块 | 作者原模型 `texture_00` 图集带一条会被鼻子采样的黑色长条，本仓库转换时已置透明（详见「资源转换流程」第 3 步）；若换回作者原贴图会复现 |
| 移动端看不到 | 属预期行为（`hiddenOnMobile` + `mobileBreakpoint`），需要时关闭 |
| 关闭后想恢复看板娘 | 点击左下角半透明小头像（`.pio-show`），或清除 localStorage 中的 `posterGirl` 后刷新 |
| 恢复后显示「看板娘加载失败」 | 打开控制台看 `[l2d] load failed:` 的具体错误；若为 `checkMaxIfStatementsInShader`，说明 `l2d.js` 版本过旧（没有按 canvas 复用渲染器），请更新 `l2d.js`。本仓库当前版本已修复 |
| 点击没有反应 | 确认 `pioConfig.mode` 不是 `"static"`；`static` 模式只显示模型、无交互 |
