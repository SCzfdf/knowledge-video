#!/usr/bin/env bash
# 新建一期视频工程：<主题目录>/full（HyperFrames 工程）、<主题目录>/output、<主题目录>/PROGRESS.md
# 用法: bash new_project.sh <主题目录> [node_modules 所在目录，默认就是 <主题目录>]
# 已存在的文件一律跳过、不覆盖，可以重复运行；旧工程目录不要拿来当 <主题目录>
set -euo pipefail
SK="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${1:?用法: bash new_project.sh <主题目录> [node_modules 所在目录]}"
NM="${2:-$DIR}/node_modules"
GSAP="$NM/gsap/dist/gsap.min.js"
[ -f "$GSAP" ] || { echo "找不到 $GSAP：先按 references/env.md 装工具链（npm ci）" >&2; exit 1; }

put() { if [ -e "$2" ]; then echo "已存在，跳过：$2"; else cp "$1" "$2"; fi; }

mkdir -p "$DIR/full/vendor" "$DIR/full/audio" "$DIR/full/fonts" "$DIR/output"
for f in index.html core.js s0_open.js captions.js; do put "$SK/templates/$f" "$DIR/full/$f"; done
put "$GSAP" "$DIR/full/vendor/gsap.min.js"
put "$SK/templates/PROGRESS.md" "$DIR/PROGRESS.md"

echo "工程已建好：$DIR/full"
echo "待替换的占位符："
grep -n "__[A-Z]*__" "$DIR/full/index.html" "$DIR/full/s0_open.js" "$DIR/full/captions.js" || true
echo "下一步：python scripts/build_music.py <参考视频> \"$DIR/full\" --fade 2.0（生成 bgm.wav 和 beats.js）"
