"""成片校验：成片音轨和 bgm.wav 是否对齐（互相关），帧数是否等于 时长 × fps。

用法:  python verify_audio.py <成片.mp4> <工程>/full/audio/bgm.wav
合格标准：偏移不超过 5 ms，相关系数 ≥ 0.98，帧数与 时长 × fps 相差不超过 2 帧。全部合格时退出码为 0。
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from scipy.signal import correlate

SR = 22050          # 只比对齐，降采样单声道就够
MAX_LAG = 2.0       # 只在 ±2 秒内找峰，避免拼接过的配乐在重复段上误配


def decode(path):
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path,
                    "-vn", "-ac", "1", "-ar", str(SR), tmp], check=True)
    x, _ = sf.read(tmp, dtype="float32")
    os.unlink(tmp)
    return x


def align(a, b):
    """返回 (偏移毫秒, 相关系数)。偏移为正表示成片里的声音比 bgm.wav 晚。"""
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    c = correlate(a, b, mode="full", method="fft")
    w = int(MAX_LAG * SR)
    mid = n - 1
    lag = int(np.argmax(c[mid - w:mid + w + 1])) - w
    x, y = (a[lag:], b[:n - lag]) if lag >= 0 else (a[:n + lag], b[-lag:])
    return lag / SR * 1000, float(np.corrcoef(x, y)[0, 1])


def frames(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
                          "-show_entries", "stream=nb_read_packets,r_frame_rate,duration:format=duration",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    st = j["streams"][0]
    num, den = (int(v) for v in st["r_frame_rate"].split("/"))
    dur = float(st.get("duration") or j["format"]["duration"])
    return int(st["nb_read_packets"]), dur, num / den


def main():
    mp4, wav = sys.argv[1], sys.argv[2]
    lag_ms, r = align(decode(mp4), decode(wav))
    ok_a = abs(lag_ms) <= 5 and r >= 0.98
    print(f"音轨对齐：偏移 {lag_ms:+.1f} ms，相关系数 {r:.4f} → {'合格' if ok_a else '不合格'}")
    n, dur, fps = frames(mp4)
    exp = round(dur * fps)
    ok_f = abs(n - exp) <= 2
    print(f"帧数：{n}（视频时长 {dur:.3f} s × {fps:g} fps ≈ {exp}）→ {'合格' if ok_f else '不合格'}")
    sys.exit(0 if ok_a and ok_f else 1)


if __name__ == "__main__":
    main()
