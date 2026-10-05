"""背景音乐：从参考视频取音轨，截取片段，检测节拍网格，供画面卡点。

用法:
  python build_music.py <参考视频或音频> <工程目录> [--start 0] [--duration D] [--fade 0.6] [--splice FROM:TO]
  不给 --duration 就取到音频结尾；--splice 在两个小节重拍之间做一次循环拼接，用来加长配乐

输出:
  <工程>/audio/bgm.wav   截取的片段，响度 -14 LUFS，峰值 ≤ -1 dBFS
  <工程>/beats.js        window.BEATS = {bpm, beat, t0, downbeat, duration, fade}
                         第 k 拍 = t0 + k × beat；k ≡ downbeat (mod 4) 为小节重拍；fade = 结尾淡出秒数
  工程 index.html 里带 data-full 的元素会同步为片段时长（所以先放好 index.html 再跑）
  终端打印：BPM、片段内各小节重拍时刻、各小节响度（给配乐分段用）
"""
import argparse
import json
import os
import re
import subprocess
import tempfile

import librosa
import numpy as np
import pyloudnorm as pyln
import soundfile as sf


def load(path):
    """用 ffmpeg 解码成 44.1k 双声道。"""
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path,
                    "-vn", "-ac", "2", "-ar", "44100", tmp], check=True)
    x, sr = sf.read(tmp)
    os.unlink(tmp)
    return x, sr


def beat_grid(mono, sr):
    """拟合整首曲子的等间隔节拍网格（适用于速度恒定的曲子）。

    1. librosa 粗估每拍时长；
    2. 在 ±1% 范围内网格搜索 (每拍时长, 首拍相位)，使网格点上的起音强度之和最大；
    3. 用每个网格点附近 ±40ms 的起音峰值做中位数校准；
    4. 低频（<150Hz，底鼓）起音最强的相位视为小节重拍。
    返回 (每拍秒数, 第 0 拍时刻, 重拍相位, 各相位低频强度, 校准量)。
    """
    SR, hop = 22050, 64
    y = librosa.resample(mono.astype(np.float32), orig_sr=sr, target_sr=SR)
    tempo, _ = librosa.beat.beat_track(y=y, sr=SR)
    T0 = 60.0 / float(np.atleast_1d(tempo)[0])

    S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop))
    f = librosa.fft_frequencies(sr=SR, n_fft=1024)

    def flux(mask):
        e = np.log1p(S[mask].sum(0))
        return np.maximum(0, np.diff(e, prepend=e[0]))

    full, low = flux(np.ones_like(f, bool)), flux(f < 150)
    fps, dur = SR / hop, len(y) / SR

    def frames(T, t0):
        g = t0 + np.arange(int((dur - t0) / T)) * T
        return np.clip(np.round(g * fps).astype(int), 0, len(full) - 1)

    _, T, t0 = max(((full[frames(T, t0)].sum(), T, t0)
                    for T in np.linspace(T0 * 0.99, T0 * 1.01, 81)
                    for t0 in np.arange(0.0, T0, 0.002)), key=lambda r: r[0])

    w = int(0.04 * fps)
    offs = [(np.argmax(full[max(0, i - w):i + w + 1]) + max(0, i - w) - i) / fps for i in frames(T, t0)]
    cal = float(np.median(offs))
    t0 += cal

    idx = frames(T, t0)
    phase = [float(low[idx[p::4]].mean()) for p in range(4)]
    return float(T), float(t0), int(np.argmax(phase)), phase, cal


def splice(x, sr, f, t, xf=0.03, lead=0.012):
    """播到小节重拍 f 时接回小节重拍 t。

    等功率交叉淡化放在重拍前 lead 秒结束，新段落的重拍起音完整保留；
    源时刻 s（≥ t）在输出里落在 s + (f - t)，节拍网格保持连续。
    """
    n = int(xf * sr)
    e, b = int(round((f - lead) * sr)), int(round((t - lead) * sr))
    ph = np.linspace(0, np.pi / 2, n)[:, None]
    mid = x[e - n:e] * np.cos(ph) + x[b - n:b] * np.sin(ph)
    return np.concatenate([x[:e - n], mid, x[b:]])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("project")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--duration", type=float, default=None, help="默认取到音频结尾")
    ap.add_argument("--fade", type=float, default=0.6)
    ap.add_argument("--splice", default=None,
                    help="FROM:TO，源音频里的两个时刻（秒），各自吸附到最近的小节重拍；播到 FROM 时跳回 TO，用来加长配乐")
    args = ap.parse_args()

    x, sr = load(args.src)
    T, t0, ph, phase, cal = beat_grid(x.mean(1), sr)
    if args.splice:
        def snap(t):
            return t0 + (ph + 4 * round((t - t0 - ph * T) / (4 * T))) * T
        f_src, t_src = (snap(float(v)) for v in args.splice.split(":"))
        x = splice(x, sr, f_src, t_src)
        print(f"拼接：播到 {f_src:.3f}s 跳回 {t_src:.3f}s，加长 {(f_src - t_src) / (4 * T):.0f} 小节（{f_src - t_src:.2f}s）")
    a = args.start
    D = args.duration if args.duration else round(len(x) / sr - a, 3)

    # 片段内的第一拍（k0 = 片段起点之后的第一个网格序号）
    k0 = int(np.ceil((a - t0) / T - 1e-9))
    rel = t0 + k0 * T - a
    downbeat = (ph - k0) % 4

    y = x[int(a * sr):int((a + D) * sr)].copy()
    fi, fo = int(0.01 * sr), int(args.fade * sr)
    y[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo:
        y[-fo:] *= (np.linspace(1, 0, fo) ** 1.5)[:, None]
    meter = pyln.Meter(sr)
    lufs = meter.integrated_loudness(y)
    y *= 10 ** ((-14.0 - lufs) / 20)
    peak = np.abs(y).max()
    if peak > 0.89:
        y *= 0.89 / peak
    out_audio = os.path.join(args.project, "audio")
    os.makedirs(out_audio, exist_ok=True)
    sf.write(os.path.join(out_audio, "bgm.wav"), y, sr, subtype="PCM_16")

    info = {"bpm": round(60 / T, 3), "beat": round(T, 5), "t0": round(rel, 4),
            "downbeat": downbeat, "duration": round(D, 3), "fade": args.fade}
    with open(os.path.join(args.project, "beats.js"), "w", encoding="utf-8") as fh:
        fh.write("// 由 build_music.py 生成，勿手改\nwindow.BEATS = " + json.dumps(info) + ";\n")

    html = os.path.join(args.project, "index.html")
    if os.path.exists(html):
        s = open(html, encoding="utf-8").read()
        s = re.sub(r"<[^>]*\bdata-full\b[^>]*>",
                   lambda mm: re.sub(r'data-duration="[\d.]+"', f'data-duration="{info["duration"]}"', mm.group(0)), s)
        open(html, "w", encoding="utf-8").write(s)

    print(f"节拍 {info['bpm']} BPM（每拍 {T:.4f}s），片段首拍 {rel:.3f}s，重拍相位 {downbeat}，"
          f"低频相位强度 {[round(p, 3) for p in phase]}，起音校准 {cal * 1000:+.1f}ms")
    bars = [b for b in (round(rel + (downbeat + 4 * n) * T, 3) for n in range(int(D / (4 * T)) + 1)) if b < D]
    print("片段内各小节重拍（第 1 小节起）：", bars)

    # 逐小节响度：用来分前奏 / 高潮 / 回落 / 尾声，关键转折放在高潮起点的小节重拍上
    def bar_db(b):
        seg = y[int(b * sr):int(min(D, b + 4 * T) * sr)]
        return 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9) if seg.size else float("nan")
    print("各小节响度（dB RMS）：", " ".join(f"{i + 1}:{bar_db(b):.1f}" for i, b in enumerate(bars)))
    print(f"片段 {a:.2f}–{a + D:.2f}s  原响度 {lufs:.1f} LUFS → {meter.integrated_loudness(y):.1f} LUFS，"
          f"峰值 {20 * np.log10(np.abs(y).max()):.1f} dBFS")


if __name__ == "__main__":
    main()
