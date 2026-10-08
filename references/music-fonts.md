# 配乐与字体

PY = 工具链里的 python.exe，SK = skill 目录，见 env.md。中间文件放 `<主题目录>/ref_audio/`，用完删掉。

## 0. 默认参考音源

- 文件：`assets/default.mp3`（随 skill 分发；4:36，320k MP3 约 11 MB，实测 BPM≈112.3）。用户没指定参考音源时默认用它——build_music.py 的 `<参考视频>` 参数直接给这个文件（SK = skill 目录）。
- 身份：抖音《若如初见 (Slowed)》= Hi Noise《We Never》的慢速版。Shazam 两次识别一致（track key 894305773，曲名挂 Akinari，按发行信息原曲是 Hi Noise）。
- 注意：网上能下到的各版本（网易云各上传、YouTube 原版/0.9x）指纹互不相同。用本版时一切按 build_music.py 重新测的节拍表排文案，不要套旧项目的 at() 常数。
- 版权：Hi Noise 版权曲目；抖音音乐库搜“若如初见”有同曲，发布时走平台音乐库或授权范围，交付说明写曲名。

## 1. 先弄清参考音轨（可选，但第一次用某个参考视频时建议做）

有没有人声：

```bash
ffmpeg -hide_banner -loglevel error -y -i <参考视频> -vn -ac 2 -ar 44100 ref_audio/ref_full.wav
"$PY" -m demucs --two-stems=vocals -n htdemucs --shifts 2 -o ref_audio/sep ref_audio/ref_full.wav
"$PY" -c "import soundfile as sf,numpy as np;db=lambda p:20*np.log10(np.sqrt((sf.read(p)[0]**2).mean())+1e-12);d='ref_audio/sep/htdemucs/ref_full/';print('人声',round(db(d+'vocals.wav'),1),'伴奏',round(db(d+'no_vocals.wav'),1))"
```

- 判据例：人声轨约 -71 dB、伴奏约 -10 dB，差 50 dB 以上判为纯音乐。
- 有人声时，可以把 `no_vocals.wav` 当配乐源交给 build_music.py，免得唱词和字幕抢注意力。
- demucs 第一次运行会下载约 81 MB 的模型。

是什么曲子（要提醒用户版权时用）：会把音频指纹发给 Shazam，先告诉用户，同意了再做。

```bash
for t in 18 26 36 44 54; do ffmpeg -hide_banner -loglevel error -y -ss $t -t 10 -i <参考视频> -vn -ac 1 -ar 44100 ref_audio/seg_$t.wav; done
"$PY" -c "
import asyncio
from shazamio import Shazam
async def main():
    for t in (18, 26, 36, 44, 54):
        tr = (await Shazam().recognize(f'ref_audio/seg_{t}.wav')).get('track', {})
        print(t, tr.get('title'), '-', tr.get('subtitle'))
asyncio.run(main())"
```

识别出有版权的，交付时提醒用户：配乐只适合在平台音乐库或授权范围内使用。

## 2. 截取配乐、测节拍：scripts/build_music.py

先放好 index.html，再跑（它会改写 index.html 里两处 data-duration）。

```bash
"$PY" "$SK/scripts/build_music.py" <参考视频> <主题目录>/full --duration <第 5 小节重拍稍后> --fade 0.7   # 10 秒样片
"$PY" "$SK/scripts/build_music.py" <参考视频> <主题目录>/full --fade 2.0                          # 完整版：整首；要短加 --duration/--splice
"$PY" "$SK/scripts/build_music.py" <参考视频> <主题目录>/full --splice 44.60:36.10 --fade 2.5     # 加长：播到 44.6 秒跳回 36.1 秒
```

- 输出 `audio/bgm.wav`（-14 LUFS，峰值 ≤ -1 dBFS）和 `beats.js`（bpm、beat、t0、downbeat、duration、fade）。
- 终端会打印 BPM、片段内各小节重拍时刻、各小节响度。文案按这些数字排。
- 算法假设整首速度恒定。现场录音、渐快渐慢的曲子不适用，网格会漂。
- 打印的“低频相位强度”四个数里，最大的那个应该明显突出。四个数差不多大时，重拍可能判错，换一段鼓点清楚的片段。
- `--splice`：两个时刻都会吸附到最近的小节重拍，接口处做 30 ms 等功率交叉淡化，节拍网格保持连续。
- 样片的 `--duration` 取第 5 小节重拍稍后一点，正好覆盖第 0–4 小节。
- 完整版长度按配乐定：可以整首，也可以用 `--duration` 截到尾声前合适的小节重拍（配合 `--fade`）、或用 `--splice` 剪掉中段；成片严格不超出配乐时长。

## 3. 小节换算

core.js 里：`at(bar, beat) = max(0, t0 + (downbeat + 4(bar−1) + beat) × beat秒数)`。第 1 小节是片段里的第一个小节重拍；第 0 小节是它前面那一段，不满一小节就从 0 秒算。

例：测得 112.9 BPM（每拍 0.5314 秒）、t0 = 0.492、downbeat = 3 时，`at(n) = 2.086 + 2.1256 × (n−1)` 秒。

## 4. 配乐分段

用逐小节响度划出前奏、高潮、回落、尾声。“最关键的那句”放在高潮起点的小节重拍上，结尾的定格放在尾声里。

例：前奏 0–17 秒 → 高潮 17–51 秒 → 回落 51–68 秒 → 稍回升 68–72 秒 → 尾声到结束。

## 5. 字体子集：scripts/build_fonts.py

```bash
"$PY" "$SK/scripts/build_fonts.py" <主题目录>/full
```

- 扫描 full/ 第一层的 .html 和 .js（不含 vendor/），把用到的字从 Noto Sans SC / Noto Serif SC 可变字体里裁出来，放到 `full/fonts/`。
- 每次改了字幕或画面文字都要重跑，否则新加的字会渲染成方框或回退字体。
- 输出里有“缺字”就必须处理：换字或换字体。有生僻字要看一眼输出确认没有缺。
- Noto 是 SIL OFL 许可，可以子集化嵌入。交付说明里写明。
