"""把系统里的思源（Noto）中文可变字体按项目用到的字裁成子集，供渲染时 @font-face 加载。

用法:  python build_fonts.py <工程>/full
扫描目录第一层的 .html / .js（不含 vendor/，注释里的字也算），输出到 <目录>/fonts/。
源字体默认取 C:/Windows/Fonts 或用户字体目录下的 Noto*SC-VF.ttf，可用环境变量 KV_FONT_SANS / KV_FONT_SERIF 指定。
源字体里没有的字会列为“缺字”：画面上用到的必须换字或换字体，否则渲染出方框。
Noto 字体为 SIL OFL 许可，可自由子集化嵌入。
"""
import glob
import os
import sys

from fontTools import subset

FONTS = {   # 输出文件名: (环境变量, 源字体文件名)
    "NotoSansSC-sub.ttf": ("KV_FONT_SANS", "NotoSansSC-VF.ttf"),
    "NotoSerifSC-sub.ttf": ("KV_FONT_SERIF", "NotoSerifSC-VF.ttf"),
}
FONT_DIRS = [r"C:\Windows\Fonts", os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Windows\Fonts")]
EXTRA = "“”‘’《》（）——：；，。？！、·×＝…「」"


def find_font(env, fname):
    if os.environ.get(env):
        return os.environ[env]
    for d in FONT_DIRS:
        p = os.path.join(d, fname)
        if os.path.exists(p):
            return p
    sys.exit(f"找不到 {fname}：安装 Noto Sans SC / Noto Serif SC 可变字体（Google Fonts，SIL OFL），或设环境变量 {env}=<ttf 路径>")


def collect(root):
    chars = set(chr(c) for c in range(0x20, 0x7F)) | set(EXTRA)
    for pat in ("*.html", "*.js"):
        for f in glob.glob(os.path.join(root, pat)):
            chars |= set(open(f, encoding="utf-8").read())
    return "".join(sorted(c for c in chars if c.isprintable()))


def main():
    root = os.path.abspath(sys.argv[1])
    out = os.path.join(root, "fonts")
    os.makedirs(out, exist_ok=True)
    text = collect(root)
    for name, (env, fname) in FONTS.items():
        opts = subset.Options()
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        font = subset.load_font(find_font(env, fname), opts)
        sub = subset.Subsetter(opts)
        sub.populate(text=text)
        sub.subset(font)
        cmap = font.getBestCmap()
        miss = "".join(c for c in text if ord(c) > 0x7F and ord(c) not in cmap)
        dst = os.path.join(out, name)
        subset.save_font(font, dst, opts)
        print(f"{name}: {len(text)} 字符, {os.path.getsize(dst) // 1024} KB；" + (f"缺字 {miss}" if miss else "无缺字"))


if __name__ == "__main__":
    main()
