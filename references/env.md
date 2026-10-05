# 准备环境

本机（Windows 11 + Git Bash）实测可用的组合。本机已经装好一套，可以直接复用（见最后一节）；换机器时按下面装。

## Node 工具链（HyperFrames 0.8.98 + GSAP 3.14.2）

```bash
TC=<工作区>/kv-toolchain
mkdir -p "$TC" && cp <skill>/scripts/toolchain/package.json <skill>/scripts/toolchain/package-lock.json "$TC/"
(cd "$TC" && npm ci)                     # 按锁文件装，版本固定
HF="$TC/node_modules/.bin/hyperframes"   # 以后一律用这个绝对路径
"$HF" --version
```

- 不用 npx：曾被自动权限检查拦下。装在本地，用绝对路径调用。
- 锁文件里的下载地址是 npmmirror.com。那个网络环境下载不了时，删掉 package-lock.json 再 `npm install`（package.json 里版本已写死）。
- 第一次运行会把无头 Chrome 下到 `~/.cache/hyperframes`（本机连同字体、TTS 缓存共 297 MB）。
- skill 目录里不要放 node_modules 或 venv：Cherry Studio 导入 skill 是整个目录复制。

## Python 3.12（用 uv）

```bash
uv venv --python 3.12 "$TC/.venv"
PY="$TC/.venv/Scripts/python.exe"
uv pip install --python "$PY" -r <skill>/scripts/toolchain/requirements.txt            # 必需
uv pip install --python "$PY" -r <skill>/scripts/toolchain/requirements-optional.txt   # 按需：判断人声、识别曲目
```

- 这套依赖只在 3.12 上实测过，不要用系统自带的 Python 3.14。
- 本机 uv 在 `~/.local/bin/uv`（0.11.31）。
- torch 约 500 MB；demucs 第一次运行还会下载约 81 MB 的模型。可选包确实要用再装。

## ffmpeg

本机装的是 winget 的 Gyan.FFmpeg 9.0.2，不在默认 PATH 里。新机器用 `winget install --id Gyan.FFmpeg -e` 安装。

## 每条 Bash 命令都带上

```bash
export PATH="/c/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin:$PATH"
export PYTHONIOENCODING=utf-8 PYTHONUTF8=1 PYTHONWARNINGS=ignore
export NO_COLOR=1                      # 去掉 hyperframes 输出里的颜色码
export HYPERFRAMES_NO_TELEMETRY=1      # 关匿名遥测（DO_NOT_TRACK=1 效果相同）
export HYPERFRAMES_NO_UPDATE_CHECK=1   # 关更新检查，也就不会自动升级
```

两个 HYPERFRAMES_* 变量是从 0.8.98 的源码查到的（`dist/chunk-XUXGIA7H.js` 的 telemetryRuntimeOverride、`dist/chunk-B7E6IWMM.js` 的 updateCheckDisabled），换版本后要重新确认。

## Git Bash 的坑

- `cd` 之后，工作目录会一直保留到后面的命令；cd 到工作区以外时，会被重置回工作区。一律写绝对路径，不依赖当前目录。
- Windows 版 Python 读不到 Git Bash 的 `/tmp`。临时文件写进工程目录，用完删掉。
- 写已有的文件之前先 Read。
- 不要 `cd` 进临时目录：Windows 上只要有进程把当前目录停在某个文件夹里，这个文件夹就删不掉（Device or resource busy）。命令里用绝对路径；删不掉时先查是谁占着，不要强杀用户自己的程序（上次占着的是输入法进程），空目录留给用户处理即可。
- 调用 Windows 原生命令（如 `cmd /c mklink /J`）时，`/J` 这类参数会被 Git Bash 当成路径改写，报“无效参数”。前面加 `MSYS_NO_PATHCONV=1` 即可。cmd 的输出是 GBK 编码，显示为乱码属正常。

## 本机可复用的环境

工作区是 `C:\Users\User\AppData\Roaming\CherryStudio\Data\Agents\system\2026-09-08\cdb70fb2-23e9-44a0-9e19-1d34b9bf87d5`，第一期工程 `反者道之动x荣格\` 里已经装全：

- `HF=<工作区>/反者道之动x荣格/node_modules/.bin/hyperframes`；new_project.sh 的第 2 个参数传 `<工作区>/反者道之动x荣格`
- `PY=<工作区>/反者道之动x荣格/.venv/Scripts/python.exe`，必需包和可选包都装好了

只调用，不往里面装新包：第一期工程要保持原样。
