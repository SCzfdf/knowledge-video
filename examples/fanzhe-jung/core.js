// 公共部分：节拍换算、主时间线，以及场景 / 淡入淡出 / 出处的小工具
// HyperFrames 打包时会把外链脚本合并到 <head> 里执行，那时 DOM 还没生成；
// 所以各文件只往 V.parts 里登记构建函数，由 index.html 末尾的内联脚本统一执行
(function () {
  const BT = window.BEATS, D = BT.duration, DB = BT.downbeat, BEAT = BT.beat;
  const B = (n) => BT.t0 + n * BEAT;                                          // 第 n 拍
  const at = (bar, beat = 0) => Math.max(0, B(DB + 4 * (bar - 1) + beat));  // 第 bar 小节第 beat 拍（都从 0 数）
  const IR = { immediateRender: false };
  const tl = gsap.timeline({ paused: true });
  const $ = (id) => document.getElementById(id);

  // 场景层：[b0, b1) 小节内可见；进场 0.35s，出场 0.25s，在下一小节重拍前结束
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

  // 右上角出处，[b0, b1) 小节内显示
  function cite(text, b0, b1) {
    const el = document.createElement("div");
    el.textContent = text;
    $("cite").appendChild(el);
    fadeIn(el, at(b0), 0, 0.4);
    fadeOut(el, at(b1) - 0.3, 0.28);
  }

  // 背景：光带随每个小节重拍“呼吸”一下；镜头极慢推近；最后 1.5 秒渐黑，和配乐淡出同步
  function background() {
    for (let bar = 0; ; bar++) {
      const t = at(bar), d = Math.min(4 * BEAT * 0.95, D - t);
      if (d < 0.1) break;
      tl.fromTo("#band", { opacity: 1 }, { opacity: 0.5, duration: d, ease: "power2.out", ...(bar ? IR : {}) }, t);
    }
    tl.fromTo("#cam", { scale: 1 }, { scale: 1.03, duration: D, ease: "none" }, 0);
    tl.fromTo("#fade", { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power1.in", ...IR }, D - 1.5);
  }

  window.V = {
    tl, at, B, BEAT, D, IR, $, scene, fadeIn, fadeOut, cite,
    parts: [background],
    GOLD: "#f2c46d", SILVER: "#c8ced8", DIM: "#7a6c58", INK: "#efe9df", RED: "#e8794a",
  };
})();
