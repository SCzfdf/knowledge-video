# 出片前后的检查

HF、PY、SK 见 env.md。命令都在 `<主题目录>` 下执行；截图和临时文件放 `review/`，交付前删掉。

## 渲染前

| 步骤 | 命令 | 合格标准 |
|---|---|---|
| 结构 | `"$HF" lint full` | 0 error。warning 逐条看，确认是有意为之（比如有意的重叠） |
| 实跑 | `"$HF" check full --at-transitions` | 通过。报溢出、重叠、对比度不足的，改代码或补 data-layout-allow-* |
| 排期 | 用 music-fonts.md §3 的换算公式，把场景和 captions 里最大的 `at(小节, 拍)` 换算成秒 | ≤ beats.js 的 duration，不能超；结尾渐黑在 fade 段内收完 |
| 看图 | `"$HF" snapshot full --frames 9 --describe false -o review/snap` | 自己逐张看（Read 图片），按下面的清单过一遍 |

看图清单：
- 第 1 帧就能读出题眼和问题；
- 文字没有出画、没有被裁，字幕不压住图形；
- 每屏只有一个意象，没有多余装饰；
- 配色、字号、版面符合 style.md，并按其中的“自查”过一遍（含三条命令）；
- 生僻字没有变成方框或回退字体。

需要对照参考视频时加 `--against=<参考视频>`，会生成同一时刻的对照拼图。

模型读不了图片时（Read 图片报“does not support image input”），不要反复重试：
- 布局、溢出、对比度交给 check 把关；
- 空白帧用亮度统计查：`for f in review/snap/frame-*.png; do echo "$f $(ffmpeg -hide_banner -i "$f" -vf signalstats,metadata=print -f null - 2>&1 | grep -oE 'YMAX=[0-9]+')"; done`。YMAX 低于 150 的帧只剩背景和栏目名（实测约 122），确认是不是有意的；
- 关键画面用取色核对：先按设计算出元素在该时刻的位置和颜色，再用下面的 `an()` 裁一小块统计。算中间时刻时注意 GSAP 的 power2 是三次方曲线，power1 才是二次。实测参考色：金 (242,196,109)，银 (200,206,216)，米白字 (239,233,223)，muted 小字 (163,152,135)，暗字 (122,108,88)，透明度 0.85 的金色描边约 (210,171,96)，背景最暗处约 (21,18,11)；
- 画风和意象请用户看一眼 `review/snap/contact-sheet.jpg`（snapshot 自动生成的 9 宫格）。

取色函数（PY 见 env.md）。参数依次是 png 路径、裁剪区域的中心 x、中心 y、宽、高、说明；打印最亮的像素和金、银、亮三类像素的个数：

```bash
an() {
  local f="$1" x0=$(($2-$4/2)) y0=$(($3-$5/2))
  printf '%-26s (%s,%s) %sx%s %-8s → ' "$(basename "$f")" "$2" "$3" "$4" "$5" "$6"
  ffmpeg -v error -i "$f" -vf "crop=$4:$5:$x0:$y0,format=rgb24" -f rawvideo - | "$PY" -c '
import sys
b = sys.stdin.buffer.read(); W, x0, y0 = map(int, sys.argv[1:4]); n = len(b) // 3
best = (-1, 0, 0, 0, 0); gold = silver = bright = 0
for i in range(n):
    r, g, bl = b[3*i], b[3*i+1], b[3*i+2]; s = r + g + bl
    if s > best[0]: best = (s, r, g, bl, i)
    if r > 200 and g > 150 and bl < 140 and r - bl > 60: gold += 1
    if r > 160 and bl > 165 and bl >= r - 5 and abs(r - g) < 25: silver += 1
    if s >= 420: bright += 1
s, r, g, bl, i = best
print(f"max=({r},{g},{bl})@({i % W + x0},{i // W + y0}) 金={gold} 银={silver} 亮={bright}/{n}")
' "$4" "$x0" "$y0"
}
an review/snap/frame-01-at-10s.png 960 450 170 170 主体    # 金色计数上万：主体亮着
an review/snap/frame-00-at-0s.png 960 1026 1920 100 字幕下  # 亮=0：字幕下方没有图形
```

## 渲染

```bash
"$HF" render full -o "output/<主题>_完整版.mp4" -q delivery
```

- 约 1 倍实时，80 秒的片子要一两分钟以上。用后台方式运行，然后轮询输出，不要前台干等到超时。只想快速看效果用 `-q draft`（10 秒的片子约 20 秒出完）。
- 日志里的 `Auto-worker calibration failed`、`blank-frame suspect; re-capturing`、`N capture workers may exceed V8 heap` 是 WARN：渲染器会自动改用保守并发、重拍那一帧，不算失败。以退出码和渲染后的检查为准。
- 真失败时先看报错原文：页面加载超时加 `--browser-timeout <秒>`，Chrome 操作超时加 `--protocol-timeout <毫秒>`，播放器就绪超时加 `--player-ready-timeout <毫秒>`，内存不够用 `-w 1` 或 `--low-memory-mode`。

## 渲染后

```bash
M="output/<主题>_完整版.mp4"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration -of compact "$M"
ffmpeg -hide_banner -i "$M" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)" | tail -3
"$PY" "$SK/scripts/verify_audio.py" "$M" full/audio/bgm.wav
N=$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$M")
mkdir -p review && ffmpeg -hide_banner -loglevel error -y -i "$M" -vf "select='not(mod(n\,$((N / 9))))',scale=640:-1,tile=3x3" -frames:v 1 review/render_sheet.jpg
# 亮度统计（不用看图）：同样 9 帧加最后一帧，每行打印 时刻 / 平均亮度 / 最大亮度
ffmpeg -hide_banner -i "$M" -vf "select='not(mod(n\,$((N / 9))))+eq(n\,$((N - 1)))',signalstats,metadata=print" -an -f null - 2>&1 | grep -oE "pts_time:[0-9.]+|YAVG=[0-9.]+|YMAX=[0-9]+" | paste - - -
```

| 项目 | 合格标准 |
|---|---|
| ffprobe | h264 1920×1080、30/1 帧率，有一条音轨，时长等于配乐时长（只许短 0.1 秒以内，不得超过配乐时长） |
| 响度 | I 约 -14 LUFS，Peak 不超过 -1 dBFS 左右 |
| verify_audio.py | 偏移 ≤ 5 ms，相关系数 ≥ 0.98，帧数 ≈ 时长 × 30（退出码 0） |
| render_sheet.jpg | 9 张缩略图和分镜对得上，没有黑帧、空白帧，结尾渐黑 |
| 亮度统计 | 除最后一帧和结尾渐黑段（最后 fade 秒，见 beats.js）里的帧外，YMAX > 150（有亮字时通常 200+；只剩背景和栏目名时约 122–134）；最后一帧 YMAX < 40（渐黑到底） |

## 收尾

- 删掉 `review/`、`snapshots/`、`ref_audio/` 里的中间文件和 `__pycache__/`；`full/` 和 `output/` 保留。
- 在 PROGRESS.md 记下每一项的实际数值，交付说明里写成片的时长和规格。
