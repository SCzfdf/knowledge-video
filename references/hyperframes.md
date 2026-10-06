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
- from 里写的属性，to 里也要写（哪怕值不变，如 `opacity: 1`）：只写在 from 里的属性，snapshot 里正常，但 render 逐帧 seek 时可能整段不渲染（第二期实测：水滴 opacity 只写 from，快照有、成片没有）。别只靠 snapshot 验收新画面，渲染后从成片里抽帧取色再核一遍。
- 第一帧就可见的元素，不透明度从 0.92 起，不要从 0 起。否则对比度检查（WCAG AA）会把它当成看不清。
- 禁用 `Math.random`、`Date.now`、网络请求。需要“散开”的排布用黄金角之类的固定算法（examples/fanzhe-jung/s4_diff.js:114-118）。
- 有意的重叠加 `data-layout-allow-overlap`（s5_end.js:22），有意的溢出加 `data-layout-allow-overflow`（s4_diff.js:76）。
- check 报 `rotation_pivot_drift`、`off_pivot_rotation`：元素故意绕远处的点转（光点绕圆心、植物连同叶子绕根部摆）时必然会报，确认有意就记进 PROGRESS.md，不用改。派全片 check 的卡时把这些有意项列进卡里，免得被子代理“修”掉。
- build_fonts.py 会把注释里的字也收进字体子集，注释尽量只用画面上已有的字。
- 带独立时长的计时元素要有 `class="clip"`、`data-start` 和时长。用 core.js 的 scene() 挂在主时间线上的不需要。
- 字幕换条用 0.02 秒硬切，最后一条 0.25 秒淡出（templates/captions.js 已写好）。
- 时刻一律用 `at(小节, 拍)`，不要手写秒数，配乐换了也不用改。

## 3D 场景（Three.js，可选——具象主题优先，不硬用）

什么时候用哪个维度见 style.md「3D 线框」。模板是 templates/s1_scene3d.js。

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

## 动画模式（examples/fanzhe-jung，只供阅读：缺 beats.js、音频、字体和 vendor，不能直接运行）

| 想要的效果 | 看哪里 |
|---|---|
| 首帧就可读的大字，逐字发光、聚焦某个字 | s0_open.js:43-69 |
| 字沿圆走半圈到对面再回来（转臂 + 内层反向） | s0_open.js:35、72-85；s5_end.js:37-54 |
| 植物摇摆、枯死（path 的 `attr:{d}` 变形）、新芽描线 | s1_lao.js:10-55 |
| 描线：getTotalLength + strokeDashoffset | s1_lao.js:45-47；s4_diff.js:5-8 |
| 圆牌翻面：压到侧面那一刻换字 | s1_lao.js:66-78 |
| 抖动：reduce 串起 fromTo，任意时刻 seek 都确定 | s2_jung.js:5-6 |
| 3D 翻转单词（rotationX + transformPerspective） | s2_jung.js:38-42 |
| 人物和倒影、下沉变暗、影子翻上来 | s2_jung.js:45-78 |
| 压力条一拍一格、颜色由金变红，爆发 | s2_jung.js:101-117 |
| 太极旋转、钟摆金银互换、连通水槽液面 | s3_same.js:15-86 |
| 水波 mask 流动 | s4_diff.js:55-96 |
| 光束照亮（svgOrigin + clipPath 的 attr width） | s4_diff.js:106-111 |
| 散点收回、碎弧飞回原位、圆补满 | s4_diff.js:114-171 |
| 结尾定格：圆补全、文字淡入、发光 | s5_end.js:11-58 |
| 缩放 SVG 时线宽不变：`vector-effect: non-scaling-stroke` | index.html:51 |

SVG 元素做旋转、缩放时用 `gsap.set(el, {svgOrigin: "x y"})` 指定圆心，不要靠 CSS transform-origin。
