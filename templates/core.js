// 公共时间线与小工具。节拍来自 beats.js（build_music.py 生成），场景文件只用 at(小节, 拍) 定时
(function () {
  const BT = window.BEATS, D = BT.duration, DB = BT.downbeat, BEAT = BT.beat;
  const FADE_OUT = BT.fade || 1.5;   // 结尾渐黑秒数：取配乐淡出时长（build_music.py --fade，写在 beats.js 里），为 0 或缺省时用 1.5；要不同就直接写数字
  const B = (n) => BT.t0 + n * BEAT;   // 第 n 拍的时刻
  // 第 1 小节 = 片段里第一个小节重拍；第 0 小节是它前面那一小节（不足一小节就从 0 秒算）
  const at = (bar, beat = 0) => Math.max(0, B(DB + 4 * (bar - 1) + beat));
  const IR = { immediateRender: false };
  const tl = gsap.timeline({ paused: true });
  const $ = (id) => document.getElementById(id);

  // 场景层：第 b0 小节淡入（b0 = 0 时第一帧就可见），第 b1 小节前淡出；b1 = null 表示留到结尾
  function scene(id, html, b0, b1) {
    const el = document.createElement("div");
    el.className = "scene";
    el.id = id;
    el.innerHTML = html;
    $("stage").appendChild(el);
    if (b0 > 0) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out", ...IR }, at(b0));
    else el.style.opacity = 1;
    if (b1 != null) tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.25, ease: "power2.in", ...IR }, at(b1) - 0.27);
    return el;
  }
  const fadeIn = (sel, t, y = 12, d = 0.4) =>
    tl.fromTo(sel, { opacity: 0, y }, { opacity: 1, y: 0, duration: d, ease: "power2.out", ...IR }, t);
  const fadeOut = (sel, t, d = 0.3) =>
    tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: d, ease: "power2.in", ...IR }, t);

  // 右上角出处：第 b0 小节出现，第 b1 小节前消失
  function cite(text, b0, b1) {
    const el = document.createElement("div");
    el.textContent = text;
    $("cite").appendChild(el);
    fadeIn(el, at(b0), 0, 0.4);
    fadeOut(el, at(b1) - 0.3, 0.28);
  }

  // 背景：暖光带每小节脉动一次；镜头整段缓慢推近；结尾渐黑
  function background() {
    for (let bar = 0; ; bar++) {
      const t = at(bar), d = Math.min(4 * BEAT * 0.95, D - t);
      if (d < 0.1) break;
      tl.fromTo("#band", { opacity: 1 }, { opacity: 0.5, duration: d, ease: "power2.out", ...(bar ? IR : {}) }, t);
    }
    tl.fromTo("#cam", { scale: 1 }, { scale: 1.03, duration: D, ease: "none" }, 0);
    tl.fromTo("#fade", { opacity: 0 }, { opacity: 1, duration: FADE_OUT, ease: "power1.in", ...IR }, D - FADE_OUT);
  }

  window.V = {
    tl, at, B, BEAT, D, IR, $, scene, fadeIn, fadeOut, cite, parts: [background],
    // 色板：和 index.html 的 :root 一一对应（--ink、--gold……），语义见 skill 的 references/style.md
    INK: "#efe9df", GOLD: "#f2c46d", SILVER: "#c8ced8", MUTED: "#a39887", DIM: "#7a6c58", RED: "#e8794a",
  };
})();
