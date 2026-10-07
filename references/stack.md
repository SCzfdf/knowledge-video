# 技术栈

画面是 HTML/CSS 加内联 SVG（具象主题可选 Three.js 3D 线框，优先但不硬用），GSAP 把所有动作排在一条 paused 时间线上，HyperFrames 驱动无头 Chrome 逐帧 seek、截图并编码成 mp4。配乐、节拍、字体子集由 Python 3.12 脚本生成，ffmpeg 负责抽音轨和校验。出片全程在本地跑，不调用在线服务。

下面的版本是本机实测可用的组合，锁在 scripts/toolchain/。安装见 env.md，写法限制见 hyperframes.md，画风数值见 style.md。

## 各层选型

| 层 | 用什么 | 版本 | 为什么、注意什么 |
|---|---|---|---|
| 画面 | HTML + CSS + 内联 SVG | — | 线稿和大字都由代码画，没有素材版权问题；改一个字重新渲染就行 |
| 动画 | GSAP，只用 core，不注册插件 | 3.14.2 | 拷进 `full/vendor/`，不走 CDN，渲染时不联网；许可是 GSAP Standard "no charge" license |
| 画面（3D，可选） | Three.js，用 esbuild 打成单文件 IIFE 拷 `full/vendor/` | 首次启用时锁定 | 具象主题的结构线框和相机运动（MIT 许可）；classic 脚本引入，不动引导顺序；按需安装，方法见 env.md |
| 渲染 | HyperFrames（HeyGen 开源，Apache-2.0） | 0.8.98 | 教程推荐。逐帧 seek 时间线再截图，配合 paused 时间线和 fromTo，同一时刻每次渲染都一样；自带 lint、check、snapshot |
| 浏览器 | chrome-headless-shell，由 puppeteer-core 25.12.0 驱动 | 152.0.7977.30 | 第一次运行时自动下到 `~/.cache/hyperframes/chrome/` |
| 运行时 | Node.js、npm | 24.14.0、11.9.0 | `npm ci` 按锁文件装；不用 npx（曾被权限检查拦下） |
| 配乐 | build_music.py：librosa、numpy、soundfile、soxr、pyloudnorm，外调 ffmpeg | 见 requirements.txt | 截取、测 BPM 和小节重拍、按重拍循环拼接加长（`--splice`）、结尾淡出、响度归一到 -14 LUFS；同时改写 index.html 的 data-duration |
| 字体 | Noto Sans SC、Noto Serif SC 可变字体；build_fonts.py 用 fontTools 子集化 | fonttools 4.60.1 | SIL OFL，可以嵌入；完整字体 17.8 / 25.1 MB，子集约 0.33 / 0.46 MB；用到的字都在子集里，不会回退成方框 |
| 校验 | verify_audio.py（scipy 互相关）、ffprobe、ebur128、signalstats | — | 成片音轨和 bgm.wav 对齐、规格、响度、黑帧 |
| 媒体 | ffmpeg、ffprobe（winget 的 Gyan.FFmpeg） | 9.0.2 | `hyperframes doctor` 检测到的也是这一份 |
| Python | uv 建 venv | 3.12.13，uv 0.11.31 | 依赖只在 3.12 上测过，不用系统自带的 3.14 |
| 可选 | torch + demucs（人声分离）、shazamio（识曲） | 2.14.1、4.1.0、0.8.1 | 按需装：torch 约 500 MB，demucs 第一次运行下载约 81 MB 的模型；shazamio 会把音频指纹发给第三方，先征得用户同意 |

## 数据流

```
参考视频 ──build_music.py──→ full/audio/bgm.wav、full/beats.js，并改写 index.html 的两处 data-duration
01_分片文案.md ──手写──→ full/captions.js（字幕、出处）、full/sN_*.js（场景）
full/*.html、*.js ──build_fonts.py──→ full/fonts/*-sub.ttf（只含用到的字）
full/ ──lint → check → snapshot──→ 修到通过
full/ ──render──→ output/*.mp4 ──ffprobe、ebur128、verify_audio.py、signalstats──→ 合格
```

## 运行时接口

index.html 的脚本顺序：`vendor/gsap.min.js` → `beats.js` → `core.js` → `s0_open.js`、`s1_*.js`……（按时间顺序）→ `captions.js` → body 末尾的内联脚本。内联脚本执行 `V.parts.forEach(build)`，再注册 `window.__timelines.main = V.tl`。为什么这样排，见 hyperframes.md 的“为什么用 V.parts”。

`window.BEATS = {bpm, beat, t0, downbeat, duration, fade}`：build_music.py 生成，勿手改。

`window.V`（core.js）：

| 成员 | 作用 |
|---|---|
| `tl` | 唯一一条 paused 主时间线，所有补间都挂在上面 |
| `at(bar, beat = 0)` | 第 bar 小节第 beat 拍的秒数：`max(0, t0 + (downbeat + 4(bar−1) + beat) × BEAT)` |
| `B(n)`、`BEAT`、`D` | 第 n 拍的秒数、每拍秒数、总时长 |
| `IR` | `{immediateRender: false}`，展开进每个 fromTo 的终值 |
| `$(id)` | `document.getElementById` |
| `scene(id, html, b0, b1)` | 建一层场景：第 b0 小节淡入（0 表示首帧可见），第 b1 小节前淡出；b1 为 null 时留到结尾 |
| `fadeIn(sel, t, y = 12, d = 0.4)`、`fadeOut(sel, t, d = 0.3)` | 常用的淡入、淡出 |
| `cite(text, b0, b1)` | 右上角出处，从第 b0 小节显示到第 b1 小节前 |
| `parts` | 构建函数列表，第一项是 background（光带脉动、推镜、结尾渐黑） |
| `frameHooks` | 帧回调列表：主时间线 onUpdate 时依次调用；3D 场景把 `renderer.render` 推进来（2D 项目恒为空） |
| `INK` `GOLD` `SILVER` `MUTED` `DIM` `RED` | 色板，和 index.html 的 CSS 变量一一对应，语义见 style.md |

## 代码约定（照 templates/）

- 场景文件的骨架：`window.V.parts.push(function () { const { tl, at, IR, scene, … } = window.V; … });`，只解构用到的成员。
- 文件头注释写覆盖哪几小节、讲什么，如 `// 第 6–9 小节：本段主题。意象A → 意象B`；小节内用分隔注释，如 `// ---------- 第 0 小节：题眼 + 问题，第 1 帧就能读 ----------`。
- 注释用中文，讲意图，不复述代码。
- 常量全大写（`LIVE`、`DEAD`、`FIG`、`ON`、`OFF`）。颜色用 V 的常量或 CSS 变量，不在场景里写新色值（辅助暗色例外，见 style.md）。
- 场景专用样式加在 index.html 的 `/* 场景专用样式加在这里 */` 处。id 全片唯一：结尾复用开头的结构时加前缀（如 `#guide` 到结尾场景叫 `#eGuide`）。

## hyperframes 命令取舍

| 类别 | 命令 |
|---|---|
| 用 | lint、check、snapshot（必须带 `--describe false`）、render、docs |
| 排查时用 | doctor、info、compositions、timeline、keyframes；browser（可能会下载 Chrome） |
| 不用：已弃用 | inspect、validate（各自的 `--help` 里标着 deprecated，让改用 check；顶层 help 没标。check 已包含 lint、运行时校验和布局检查） |
| 不用：会起本地服务 | preview（默认端口 3002）、present（幻灯片演示） |
| 不用：会联网或上传 | publish、cloud、lambda、cloudrun、auth、feedback、capture、add、catalog、upgrade、models |
| 不用：用户不要 | tts（不配音）、transcribe（片子没有人声） |
| 不用：脚本已覆盖 | init（new_project.sh）；beats、normalize-audio（build_music.py） |
| 不用：用不上 | media-treatment、grade-compare、compare、history、benchmark、clean、remove-background、skills |

telemetry 也不用跑，遥测用环境变量关（env.md）。以上是 0.8.98 的 `hyperframes --help` 列出的全部 40 个顶层命令，换版本后对一遍。

- `doctor` 里 whisper-cpp、TTS (Kokoro)、BGM (MusicGen) 显示 ✗ 是正常的：都是可选组件，用不到。Docker 也不需要。
- onnxruntime-node、@google/genai 在第一次用到时才安装，会联网。不跑 tts、transcribe，snapshot 带 `--describe false`，就不会触发。
- 截图要完全可复现时，snapshot 加 `--no-browser-gpu`（改用 SwiftShader 软件渲染）。

## 文档

- 离线文档和在线索引见 hyperframes.md 的“命令”一节；源码 https://github.com/heygen-com/hyperframes 。
- 随包附带的官方 skill 在 `node_modules/hyperframes/dist/skills/`：hyperframes（`references/routes/` 下和本 skill 最接近的是 embedded-captions.md、music-to-video.md、faceless-explainer.md）、hyperframes-cli（`references/` 下是各命令的细节）、media-use（配乐、音效、图片、图标、配音、调色 LUT 等素材的检索和生成，也管转写、字幕、抠背景；前两期没用）。官方 hyperframes skill 的描述自称必经入口（“Mandatory entry point”），但它的流程和本 skill 的三关不同：以本 skill 和用户定下的流程为准，只把它当写法参考。

## 规格

| 成片 | 规格 |
|---|---|
| 视频 | h264 1920×1080，30/1 |
| 音频 | aac 48 kHz 双声道，-14 LUFS，峰值 ≤ -1 dBFS |
| 时长 | 等于配乐时长（≤ 60 秒，见 workflow.md） |

## 升级任何一项之前

先在副本里重跑冒烟测试：new_project.sh → build_music.py `--duration <约 10 秒> --fade 0.7` → build_fonts.py → lint → check → snapshot → render `-q draft` → verify.md 里渲染后的检查。另外重新确认：

- 两个 HYPERFRAMES_* 环境变量还有效（env.md 写了在源码哪里查）；
- lint、check 的规则有没有变（首帧不透明度、时间线注册方式、data-* 属性）；
- snapshot `--describe` 的默认行为；
- 重新生成 package-lock.json；Python 依赖在 3.12 上重测之后再改 requirements.txt。
