---
name: knowledge-video
description: 把一个知识点做成无配音、纯字幕、画面按配乐节拍切换的知识短视频（1920×1080 30fps，HyperFrames + GSAP 代码绘制线稿和大字，可选 Three.js 3D 线框场景（具象主题优先、不硬用），配乐取参考视频原音轨）。流程三关：分片文案 → 10 秒样片（用户可取消）→ 完整视频，每关等用户确认。内含出处核对规范、画风规范（色板语义、字体字号、版面、动效节奏、意象库、文案语气、avoid）、技术栈说明（选型、版本、数据流、代码约定）、工程模板、测节拍和字体子集脚本、成片校验命令；主线程只做总结、分派任务、任务重试，避免模型异常中断整件事。Use when 用户要做知识视频、知识大赏投稿、科普或经典解读短视频（哲学、心理学、历史等），或要求参考某个视频的配乐和风格出片、用 hyperframes 做字幕视频。
---

# 知识短视频：纯字幕 + 配乐卡点

把一个知识点做成 1 分钟以内的横屏短视频：不配音，全靠字幕讲；画面是代码绘制的线稿和大字（2D 用 HTML/SVG + GSAP；具象主题优先 Three.js 3D 线框，不硬用），跟着参考视频原音轨的小节切换；最后用 HyperFrames 渲染成 mp4。

做过两期：「反者道之动 x 荣格」（87.6 秒，场景代码在 examples/fanzhe-jung/，只供阅读）；「反者道之动，弱者道之用」（用户已确认的分片文案：examples/01_分片文案_弱者道之用.md）。

开工或恢复工作时，先读 `<主题目录>/PROGRESS.md`（new_project.sh 会建），从“下一步”接着做，不凭记忆。

## 三关（用户只把控这三处，其余照 references 自己定）

| 关卡 | 产物 | 给用户看 |
|---|---|---|
| 1 分片文案 | `01_分片文案.md` | 按时间顺序的全部字幕、画面、出处，加投稿标题 |
| 2 10 秒样片（用户可取消） | `output/样片_开头10秒.mp4` | 画风、字幕节奏、配乐 |
| 3 完整视频 | `output/<主题>_完整版.mp4` + `README.md` | 成片和交付说明 |

- 每关做完就停下，等用户说“可以”。没确认不进下一关，也不在回复里预告下一关。
- 用户中途提的修改，原话记进 PROGRESS.md 的“用户要求”，每关对照，以最新的为准。
- 用户说“重新来一版”：旧版目录原样保留，另开主题目录，从第 1 关重走。

## 硬性规则

- 每条知识点都核对出处，查不到或只在博客、营销号上见过的就删；原典和后世说法分开写（workflow.md）。
- 不配音，只用字幕：一小节一条，不计标点一般 ≤ 12 字、最多 13 字（算上标点 ≤ 16）；每条一处 `<b>` 金色关键词（对举句可两处，纯过渡句可不加）；口语，不用感叹号，删掉套话。
- 第一帧就亮出题眼和问题。一屏一个意象，画面只演当前这条字幕。配色、字号、版面、动效照 references/style.md（v2，数值已写进 templates 的 CSS 变量和 V 常量），避开深色配紫、蓝霓虹这类“AI 风”。
- 时间严格控制在配乐时长内，不能超：字幕、场景、结尾定格的最后一拍都落在配乐最后一个小节内，结尾渐黑在 fade 段收完。塞不下就减内容或换更长的配乐段，不许手改 index.html 的 data-duration 把画面拉到配乐之外（两处 data-duration 只由 build_music.py 改写）。
- 背景音用参考视频的原音轨。有版权的（上次是 Akinari《若如初见 (Slowed)》）交付时提醒用户。
- 旧工程目录只读：不改文件，不往里装包。
- 不往第三方发内容：snapshot 一律 `--describe false`，环境变量带 `HYPERFRAMES_NO_TELEMETRY=1`，shazamio 识曲先征得用户同意。不打印密钥、令牌。

## 技术栈（细节见 references/stack.md）

- 画面：HTML/CSS + 内联 SVG，线稿和大字全部由代码画，不用素材；具象主题优先 Three.js 3D 线框（按需启用，esbuild 打成单文件 vendor），抽象概念继续 2D。
- 动画：GSAP 3.14.2，只用 core，放本地 `full/vendor/`；所有补间挂在一条 paused 主时间线上，一律 `fromTo` + `immediateRender: false`（0 秒处的首帧补间除外）。
- 渲染：HyperFrames 0.8.98 驱动无头 Chrome 逐帧 seek 录成 mp4，自带 lint、check、snapshot。
- 配乐和字体：Python 3.12 脚本（librosa、pyloudnorm、fontTools）测节拍、拼接、归一到 -14 LUFS、做字体子集；ffmpeg 9 抽音轨和校验。build_music.py 生成 beats.js，场景里的时刻一律写 `at(小节, 拍)`。
- 出片全程在本地跑，版本锁在 scripts/toolchain/；tts、transcribe、preview、publish 这类用不上、会起服务或会联网的命令不跑。

## 风格（细节见 references/style.md）

- 暗色暖调底，金 `#f2c46d`、银 `#c8ced8` 两色的线稿和大字：金是主角和关键词，银是反面和对照，金变银就是“转向反面”。
- 维度选择：主题有实体形态（建筑、器物、机械、地理、生物结构）优先 3D 线框；抽象概念继续 2D 极简。优先但不硬用——3D 讲不清的用 2D，反之亦然；一期里可混用，一屏一个意象不变。数值见 style.md「3D 线框」。
- 一屏一个主意象，大量留白；字不装进硬币、卡片、竹简这类容器（图形本身在演这条字幕时除外，如祸福圆牌，见 style.md）；字重 700–800，不用 900。
- 极简是风格，精致是底线：一屏一个意象是取舍不是省事——留下的每一笔（位置、线宽、透明度、时机）都经得起定格细看；随便定格一帧，能当一张海报（见 style.md「极简与精致」）。
- 一小节一个镜头、一条字幕，强调落在拍点上，动作演出字幕的意思；最关键的一句放在配乐高潮起点。
- 不用照片、插画、音效、配音。avoid：紫色或蓝色霓虹、赛博网格、满屏发光粒子，以及 v1 被否的硬币、卡片、浮尘、900 字重。

## 出片步骤

SK = 本 skill 目录；HF、PY = 工具链里的 hyperframes 和 python.exe。工具链安装、每条 Bash 要带的环境变量见 references/env.md（本机第一期工程里已有一套，直接复用）。

1. `bash "$SK/scripts/new_project.sh" <主题目录> <node_modules 所在目录>`：建 full/、output/、PROGRESS.md，并列出待替换的占位符。
2. 替换占位符。先读 style.md 定意象和版面，再按分片文案写 `full/sN_*.js` 和 `captions.js`；写法限制见 hyperframes.md，动画套路按其中的索引查 examples。
3. `"$PY" "$SK/scripts/build_music.py" <参考视频> <主题目录>/full --fade 2.0`。样片改为 `--duration <第 5 小节重拍稍后> --fade 0.7`（上次 10.62）。按打印的小节表和各小节响度排文案（music-fonts.md）。
4. `"$PY" "$SK/scripts/build_fonts.py" <主题目录>/full`，确认没有缺字。改了字就重跑。
5. `"$HF" lint full` → `"$HF" check full --at-transitions` → `"$HF" snapshot full --frames 9 --describe false -o review/snap`，逐张看图；模型读不了图时按 verify.md 的替代办法。
6. 后台运行 `"$HF" render full -o "output/<名字>.mp4" -q delivery`，轮询到结束。
7. 渲染后校验：ffprobe、响度、`scripts/verify_audio.py`、9 宫格拼图，标准见 verify.md。
8. 写 README.md，清理 review/ 等中间文件；回复用户：成片路径、时长和规格、跳过了哪一关、版权提醒、投稿标题。

## 文件

| 文件 | 内容 |
|---|---|
| references/workflow.md | 教程六步、三关、文案格式、出处规范、字幕结构、标题、交付 |
| references/style.md | 画风和文案风格：v1→v2 取舍、色板语义、字体字号、版面、线稿、动效节奏、意象库、字幕语气、avoid、自查 |
| references/stack.md | 技术栈：各层选型、版本和理由、数据流、运行时接口、代码约定、hyperframes 命令取舍、规格、升级前检查 |
| references/orchestration.md | 主线程只做总结 / 分派 / 重试：任务卡模板、拆卡、重试、报错对照 |
| references/hyperframes.md | 工程结构、写法限制、命令、动画模式索引 |
| references/music-fonts.md | 人声判断、识曲、build_music.py、小节换算、配乐分段、字体子集 |
| references/verify.md | 渲染前后的检查命令和合格标准 |
| references/env.md | 工具链安装、环境变量、Git Bash 的坑、本机可复用的环境 |
| templates/ | index.html（色板 CSS 变量）、core.js（时间线工具、frameHooks 和 V 色板常量）、s0_open.js、s1_scene3d.js（3D 线框场景模板）、captions.js、PROGRESS.md |
| scripts/ | new_project.sh、build_music.py、build_fonts.py、verify_audio.py、toolchain/（锁定版本） |
| examples/ | 第一期全部场景代码，第二期分片文案 |

## 防模型异常：主线程只做总结 / 分派 / 重试

这是用户的要求。前两期出过会话无法继续、输出超长被截断、长命令卡住、上下文压缩后丢了用户的新指令、子代理返回 400 “Model not exist”，根源都是主线程在一个上下文里干了太多活。细则见 references/orchestration.md。

- 总结：维护 PROGRESS.md（用户原话、关卡、任务卡、最近一次失败、下一步），向用户简短汇报。
- 分派：查资料、写文案、写场景代码、跑命令、渲染、校验，切成小卡交给子代理。一张卡一个产物，带验收命令，回传只要一行。尽可能并发：互不碰同一文件的卡，在一条消息里同时派出，不等前一张回传；并发是默认，串行要写明理由（改同一文件、依赖前卡产物）。
- 盯梢：每张在跑的卡每 1 分钟左右查一次活性（TaskOutput 非阻塞看输出、或看产物文件 mtime）；连续约 3 分钟没进展就当卡住，TaskStop 杀掉带现状重派，不等超时。子代理正常结束或报错会有完成通知，轮询只为抓“还在跑但没进展”。
- 重试：失败就带报错原文、缩小范围重派；每张卡最多 3 次，还不行就停下，把卡在哪、报错原文、试过什么告诉用户。
- 派子代理必须显式写 `model: "sonnet"`（本机后端只有这一档能用）；连续 400 先跑 `bash ~/.claude/scripts/agent-model-check.sh`。
- 主线程不写长内容、不前台跑长命令、不读大文件；回传说“完成”也要抽查产物。
- 断线、换会话、上下文压缩之后，先读 PROGRESS.md，以它和磁盘上的文件为准。
- 没有子代理工具，或当前会话不允许派：主线程按同样的小卡自己做，一次回复只做一张卡。
