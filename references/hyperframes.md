# HyperFrames 工程写法（0.8.98 + GSAP 3.14.2）

画面全部用 HTML/SVG + GSAP 代码绘制，HyperFrames 逐帧 seek 时间线再录成 mp4。各层选型、版本和运行时接口见 stack.md，画风数值见 style.md。

## 工程结构（scripts/new_project.sh 生成）

```
<主题目录>/
  PROGRESS.md          进度和任务卡（见 orchestration.md）
  01_分片文案.md        关卡 1 产物
  full/                HyperFrames 工程
    index.html         根节点、公共样式、脚本顺序、统一注册
    core.js            公共时间线 V.tl、at(小节, 拍)、scene()、cite()、背景脉动和结尾渐黑
    s0_open.js …       每段场景一个文件，按时间顺序在 index.html 里引入
    captions.js        字幕和右上角出处
    beats.js           build_music.py 生成，勿手改
    audio/bgm.wav      build_music.py 生成
    fonts/             build_fonts.py 生成
    vendor/gsap.min.js 本地 GSAP，不走 CDN
  output/              成片
```

## 为什么用 V.parts

打包时外链的 JS 会被合并进 `<head>`，那时 DOM 还没生成。所以各个 JS 只往 `window.V.parts` 里登记构建函数，由 body 末尾的内联脚本统一执行，并注册 `window.__timelines.main = V.tl`。lint 只认内联脚本里的注册，别挪走。

## 写法限制（违反了 lint / check 会报，或者渲染结果不确定）

- 根节点：`data-composition-id="main" data-start="0" data-duration data-width data-height data-full`。
- 音频单独用 `<audio data-start data-duration data-track-index data-full>`；视频素材要静音。两处 data-duration 由 build_music.py 改写。
- 只注册一条 paused 的根时间线；加进根时间线的子时间线不能 paused。
- 补间一律用 `tl.fromTo(..., {...IR}, 时刻)`，`IR = {immediateRender:false}`，这样任意时刻 seek 结果都一样。例外：0 秒处的首帧补间不加 IR。
- from 里写的属性，to 里也要写（哪怕值不变，如 `opacity: 1`）：只写在 from 里的属性，snapshot 里正常，但 render 逐帧 seek 时可能整段不渲染（实测踩过：快照有、成片没有）。别只靠 snapshot 验收新画面，渲染后从成片里抽帧取色再核一遍。
- 第一帧就可见的元素，不透明度从 0.92 起，不要从 0 起。否则对比度检查（WCAG AA）会把它当成看不清。
- 禁用 `Math.random`、`Date.now`、网络请求。需要“散开”的排布用黄金角固定算法：`a = i * 2.39996; r = 60 + 100 * Math.sqrt((i + 0.5) / N)`。
- 有意的重叠加 `data-layout-allow-overlap`，有意的溢出加 `data-layout-allow-overflow`。
- check 报 `rotation_pivot_drift`、`off_pivot_rotation`：元素故意绕远处的点转（光点绕圆心、植物连同叶子绕根部摆）时必然会报，确认有意就记进 PROGRESS.md，不用改。派全片 check 的卡时把这些有意项列进卡里，免得被子代理“修”掉。
- build_fonts.py 会把注释里的字也收进字体子集，注释尽量只用画面上已有的字。
- 带独立时长的计时元素要有 `class="clip"`、`data-start` 和时长。用 core.js 的 scene() 挂在主时间线上的不需要。
- 字幕换条用 0.02 秒硬切，最后一条 0.25 秒淡出（templates/captions.js 已写好）。
- 时刻一律用 `at(小节, 拍)`，不要手写秒数，配乐换了也不用改。

## 3D 场景（Three.js，可选——具象主题优先，不硬用）

什么时候用哪个维度见 style.md「3D 线框」。模板是 templates/s1_scene3d.js：3D 项目把它拷进 full/，并在 index.html 放开 three.iife.js 那行注释。

- 引擎用 esbuild 打成单文件 classic 脚本 `vendor/three.iife.js`（方法见 env.md），在 index.html 里 gsap 之后引入；不引入时工程行为和原来完全一样。不用 ES module：模块脚本执行时机在 body 末尾内联注册之后，会破坏 V.parts 的顺序；importmap / addons 的裸导入同理绕开。
- 渲染循环挂在主时间线更新上：场景把 `renderer.render(scene, camera)` 推进 `V.frameHooks`（core.js 已在 `tl` 的 onUpdate 里统一分发）。**禁用** rAF 自驱渲染、`performance.now()`、`THREE.Clock`、任何时钟增量——seek 到哪个时刻就渲染哪个时刻，和 fromTo + IR 是同一套确定性逻辑。
- 渲染器参数：`preserveDrawingBuffer: true`、`setPixelRatio(1)`，保证 snapshot/render 截图拿到当前帧。
- 相机和物体的一切运动都是挂在主时间线上的 fromTo 补间（相机位置、旋转、材质 opacity 都可以当补间目标）；不用 three 自带的动画系统。
- 文字不走 WebGL：字幕、题眼、年份、标注全部是 DOM 层（字体子集、对比度检查、lint 只管 DOM）。canvas 里出现文字会导致缺字检查漏掉它。
- check 不检查 canvas 里的内容：3D 画面的验收靠 snapshot + verify.md 的取色法（金线应落在 (242,196,109) 附近）。
- 无头 Chrome 走 SwiftShader 软渲 WebGL：面数/线数控制在中等规模；render 时间会明显变长，渲染时长预期放宽（verify.md）。
- 首个 3D 项目的验证清单（逐项确认后把结论写回本节）：lint 接受新增的 script 标签；snapshot 能截到 WebGL 画面；同一时刻截两次画面一致（确定性）；render 出片与 snapshot 一致。

## 命令（HF = 工具链里的 hyperframes 绝对路径，见 env.md）

```bash
"$HF" lint full                         # 结构检查，改完代码先跑
"$HF" check full --at-transitions       # 无头浏览器实跑：布局、溢出、对比度、各转场时刻
"$HF" snapshot full --frames 9 --describe false -o review/snap
"$HF" render full -o "output/<名字>.mp4" -q delivery   # 约 1 倍实时，后台跑
```

- snapshot 一定要写 `--describe false`：设了 GEMINI_API_KEY 时它默认把截图发给 Gemini 做描述。
- `--against=<参考视频>` 可以截参考视频同一时刻的帧，拼成对照图，用来对比风格。
- check 的 `--strict` 会把警告也当失败；`--snapshots` 会存对比度检查截图到 `snapshots/`。
- 离线文档：`"$HF" docs <topic>`，topic 有 data-attributes、gsap、compositions、rendering、examples、troubleshooting。在线索引是 https://hyperframes.heygen.com/llms.txt 。
- 官方 skill 随包附带，在 `node_modules/hyperframes/dist/skills/`（hyperframes、hyperframes-cli、media-use，各管什么见 stack.md 的“文档”一节）。遇到本文没写的用法，先查那里；它的流程和本 skill 的三关冲突时，以本 skill 为准。

## 动画模式

写法都遵守上面的写法限制（fromTo + IR、挂在主时间线上）。

| 想要的效果 | 写法 |
|---|---|
| 首帧可读的大字逐字发光、聚焦某字 | 逐字错开半拍做两段：先 `{scale:1, textShadow:OFF}`→`{scale:1.08, textShadow:ON, duration:0.08}`，紧跟 0.4–0.6s 暗回；常数 `ON = "0 0 30px rgba(242,196,109,0.7)"` |
| 字沿圆走、到对面变色 | 字放 `.mvIn` 里挂到 `.arm`（定在圆心的 0×0 容器），用 `.armIn` 的 x/y 定半径；`.arm` 补间 rotation 0→180（sine.inOut），同时字色 GOLD→SILVER |
| 描线（路径从头画出） | `const len = el.getTotalLength(); gsap.set(el, {strokeDasharray: len, strokeDashoffset: len})`，再补间 strokeDashoffset→0，0.6–0.9 秒或 2 拍 |
| 植物摇摆、枯死、新芽 | 摇摆：每拍 rotation ±5° sine.inOut；枯死：`attr:{d}` 弯茎变直茎（0.6s power2.inOut）+ stroke GOLD→DIM + 叶子 y+80 淡出；新芽：描线长出 |
| 圆牌翻面换字 | `.coin` scaleX 1→0（0.14s power2.in）→ 压扁瞬间两个 `.face` 用 0.01s 互换 opacity → scaleX 0→1（0.24s power2.out）；落定配一个脉冲环 |
| 抖动 | 把多个 fromTo x 用 reduce 串成 0.07s 步进（ease none），任意时刻 seek 都确定 |
| 单词 3D 翻转 | `gsap.set(el, {transformPerspective: 900})`；rotationX 0→180 同时 color GOLD→SILVER，再 180→360 翻回 |
| 人物和倒影 | 同一组人形画两遍，倒影包在 `transform="translate(0 1040) scale(1 -1)"` 的 `<g>` 里换银色；两者的 svgOrigin 都设在地平线上 |
| 蓄压条一拍一格、变色爆发 | 内条 `attr:{width}` 按关键帧数组每拍推一格（0.25s power2.out），fill GOLD→RED 用 4 拍 power1.in；爆发：一圈放射短线 scale 0.8→1.3 同时淡出 |
| 太极匀速转 | path 拼 S 形两半加两小圆；整组 svgOrigin 圆心，rotation 用 ease none、时长按小节差 |
| 钟摆 | `<g>` 以悬挂点为 svgOrigin，rotation ±38°、两拍一程 sine.inOut；到端点换色并放端点脉冲 |
| 连通水槽找平 | 左右液面 rect 的 y/height 关键帧互补（总量不变），sine.inOut 逐段晃到同一高度 |
| 水波流动 | 波路径画得比可见区长，用两端透明渐变的 mask 矩形裁出一段；整条 x 匀速平移 ease none |
| 光束照亮 | 被照物画两遍：暗色本体 + 金色副本放 clipPath 里；clip 的 rect `attr:{width}` 从 0 推到全宽 |
| 散点收回、碎弧拼圆 | 黄金角排布的散点 `attr:{cx, cy}` 补间回圆心（power3.in）同时整组 rotation；碎弧按八分音符把 x/y/rotation 归零 |
| 结尾定格 | 圆 strokeDashoffset→0 补满，文字 fadeIn，关键词留一层弱 textShadow；渐黑在 core.js |
| 缩放 SVG 线宽不变 | 给组加 `.ns` 类（templates/index.html 已带 `vector-effect: non-scaling-stroke`） |

SVG 元素做旋转、缩放时用 `gsap.set(el, {svgOrigin: "x y"})` 指定圆心，不要靠 CSS transform-origin。
