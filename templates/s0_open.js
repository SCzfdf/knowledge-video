// 第 0–1 小节：开头。第一帧就亮出题眼和问题
// 首帧补间放在 0 秒、不加 IR，不透明度从 0.92 起（对比度检查要求首帧可见元素 ≥ 0.9）
window.V.parts.push(function () {
  const { tl, at, IR, scene } = window.V;
  scene("s0", `
    <div class="t serif" id="hook">__HOOK__</div>
    <div class="t" id="q">__QUESTION__<span class="key">__KEY__<span class="ul"></span></span>？</div>
  `, 0, 2);

  // ---------- 第 0 小节：题眼 + 问题，第 1 帧就能读；关键词下划线在第 2 拍画出 ----------
  tl.fromTo("#hook", { opacity: 0.92, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0);
  tl.fromTo("#q", { opacity: 0.92, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0);
  tl.fromTo("#q .ul", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out", ...IR }, at(0, 2));

  // ---------- 第 1 小节：题眼在第 2 拍亮一下 ----------
  const ON = "0 0 30px rgba(242,196,109,0.7)", OFF = "0 0 0px rgba(242,196,109,0)";
  tl.fromTo("#hook", { textShadow: OFF }, { textShadow: ON, duration: 0.08, ease: "power2.out", ...IR }, at(1, 1));
  tl.fromTo("#hook", { textShadow: ON }, { textShadow: OFF, duration: 0.6, ease: "power2.inOut", ...IR }, at(1, 1) + 0.08);
});
