// 第 10–18 小节：荣格。中道（CW6 §192）→ 对立转化（§708）→ 意识片面、反向力量（§709）→ 老好人
window.V.parts.push(function () {
  const { tl, at, BEAT, IR, scene, fadeIn, fadeOut, GOLD, SILVER, DIM, RED } = window.V;
  // 逐个位置抖动（fromTo 串起来，任意时刻 seek 都确定）
  const shake = (sel, t, xs, step = 0.07) =>
    xs.reduce((x0, x1, i) => (tl.fromTo(sel, { x: x0 }, { x: x1, duration: step, ease: "none", ...IR }, t + i * step), x1), 0);

  // ---------- 第 10、11 小节：荣格登场；道是对立之间的中道 ----------
  scene("s2a", `
    <div class="t serif" id="jName" style="top:330px;font-size:150px;font-weight:800;line-height:180px;color:var(--gold);opacity:0">荣格</div>
    <div class="t" id="jEn" style="top:540px;font-size:30px;letter-spacing:6px;color:var(--muted);opacity:0">Carl Gustav Jung · 1875–1961</div>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <line id="mLine" x1="660" y1="560" x2="1260" y2="560" stroke="rgba(239,233,223,0.35)" stroke-width="2"
            stroke-dasharray="600" stroke-dashoffset="600" />
      <circle id="mA" cx="660" cy="560" r="11" fill="${GOLD}" opacity="0" />
      <circle id="mB" cx="1260" cy="560" r="11" fill="${SILVER}" opacity="0" />
      <circle id="mPulse" cx="960" cy="560" r="14" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
      <circle id="mC" cx="960" cy="560" r="14" fill="${GOLD}" opacity="0" />
    </svg>
    <div class="lbl2" id="mLbl" style="left:880px;top:604px;width:160px;text-align:center;color:var(--gold);opacity:0">中道</div>`, 10, 12);

  fadeIn("#jName", at(10), 16, 0.5);
  fadeIn("#jEn", at(10, 1), 10, 0.4);
  const t11 = at(11), tm = at(11, 2);
  tl.fromTo("#jName", { y: 0, scale: 1 }, { y: -170, scale: 0.5, duration: 0.5, ease: "power3.inOut", ...IR }, t11 - 0.2);
  fadeOut("#jEn", t11 - 0.25, 0.25);
  tl.fromTo("#mLine", { strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", ...IR }, t11);
  tl.fromTo("#mA", { opacity: 0, attr: { r: 0 } }, { opacity: 1, attr: { r: 11 }, duration: 0.3, ease: "back.out(2)", ...IR }, t11);
  tl.fromTo("#mB", { opacity: 0, attr: { r: 0 } }, { opacity: 1, attr: { r: 11 }, duration: 0.3, ease: "back.out(2)", ...IR }, at(11, 1));
  tl.fromTo("#mC", { opacity: 0, attr: { r: 0 } }, { opacity: 1, attr: { r: 14 }, duration: 0.35, ease: "back.out(2.5)", ...IR }, tm);
  tl.fromTo("#mPulse", { opacity: 0.8, attr: { r: 14 } }, { opacity: 0, attr: { r: 70 }, duration: 0.8, ease: "power2.out", ...IR }, tm);
  fadeIn("#mLbl", tm, 8, 0.35);

  // ---------- 第 12、13 小节：Enantiodromia；单词翻成倒影变银，再翻回金色 ----------
  scene("s2b", `
    <div class="t serif" id="enW" style="top:360px;font-size:120px;font-weight:700;line-height:150px;letter-spacing:4px;color:var(--gold);opacity:0">Enantiodromia</div>
    <div class="t" id="enSub" style="top:548px;font-size:30px;letter-spacing:6px;color:var(--muted);opacity:0">字面意思：逆向而行</div>`, 12, 14);
  gsap.set("#enW", { transformPerspective: 900 });
  fadeIn("#enW", at(12), 16, 0.5);
  fadeIn("#enSub", at(12, 1), 10, 0.4);
  tl.fromTo("#enW", { rotationX: 0, color: GOLD }, { rotationX: 180, color: SILVER, duration: 1.5 * BEAT, ease: "power3.inOut", ...IR }, at(13));
  tl.fromTo("#enW", { rotationX: 180, color: SILVER }, { rotationX: 360, color: GOLD, duration: 1.5 * BEAT, ease: "power3.inOut", ...IR }, at(13, 2));

  // ---------- 第 14–16 小节：地平线上是意识（金色小人），线下是无意识（银色倒影） ----------
  const FIG = `<circle cx="960" cy="418" r="16" />
    <path d="M 960 436 L 960 480 M 930 460 L 960 446 L 990 460 M 960 480 L 940 520 M 960 480 L 980 520" />`;
  const LINE = `fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;
  scene("s2c", `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <g id="shW" opacity="0"><g transform="translate(0 1040) scale(1 -1)" stroke="${SILVER}" ${LINE}>${FIG}</g></g>
      <line id="hz" x1="560" y1="520" x2="1360" y2="520" stroke="rgba(239,233,223,0.35)" stroke-width="2"
            stroke-dasharray="800" stroke-dashoffset="800" />
      <g id="fig" stroke="${GOLD}" ${LINE} opacity="0">${FIG}</g>
    </svg>
    <div class="lbl2" id="lbC" style="left:1390px;top:470px;opacity:0">意识</div>
    <div class="lbl2" id="lbU" style="left:1390px;top:546px;opacity:0">无意识</div>`, 14, 17);
  gsap.set(["#shW", "#fig"], { svgOrigin: "960 520" });

  const t14 = at(14);
  tl.fromTo("#hz", { strokeDashoffset: 800 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", ...IR }, t14);
  fadeIn("#fig", t14 + 0.15, -10, 0.4);
  fadeIn(["#lbC", "#lbU"], at(14, 1), 6, 0.35);
  tl.fromTo("#shW", { opacity: 0, scaleY: 0.4 }, { opacity: 0.6, scaleY: 0.7, duration: 0.5, ease: "power2.out", ...IR }, at(14, 2));

  // 第 15 小节：倒影一拍长一截
  const S = [0.7, 1.15, 1.55, 1.95, 2.35];
  for (let i = 0; i < 4; i++)
    tl.fromTo("#shW", { scaleY: S[i], scaleX: 1 + 0.12 * i }, { scaleY: S[i + 1], scaleX: 1 + 0.12 * (i + 1), duration: 0.3, ease: "back.out(2)", ...IR }, at(15, i));
  tl.fromTo("#shW", { opacity: 0.6 }, { opacity: 0.85, duration: 4 * BEAT, ease: "none", ...IR }, at(15));

  // 第 16 小节：先拖住（小人下沉、发抖、变暗），第 3 拍影子翻上来罩住它
  const t16 = at(16), tf = at(16, 2);
  tl.fromTo("#fig", { y: 0 }, { y: 16, duration: 2 * BEAT, ease: "power2.in", ...IR }, t16);
  shake("#fig", t16 + 0.1, [-4, 4, -4, 4, -3, 3, 0]);
  tl.fromTo("#fig", { stroke: GOLD }, { stroke: DIM, duration: 2 * BEAT, ease: "power1.in", ...IR }, t16);
  tl.fromTo("#shW", { rotation: 0 }, { rotation: -180, duration: 0.5, ease: "power3.inOut", ...IR }, tf - 0.12);
  tl.fromTo("#shW", { opacity: 0.85 }, { opacity: 1, duration: 0.3, ...IR }, tf + 0.3);
  tl.fromTo("#lbU", { color: "#a39887" }, { color: SILVER, duration: 0.3, ...IR }, tf);

  // ---------- 第 17、18 小节：老好人。压力条一拍蓄一格，第 18 小节重拍炸开 ----------
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    return `<line x1="${960 + 132 * c}" y1="${430 + 132 * s}" x2="${960 + 176 * c}" y2="${430 + 176 * s}" />`;
  }).join("");
  scene("s2d", `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <g id="face" fill="none" stroke="${GOLD}" stroke-width="5" stroke-linecap="round">
        <circle cx="960" cy="430" r="105" />
        <circle class="eye" cx="922" cy="405" r="7" fill="${GOLD}" stroke="none" />
        <circle class="eye" cx="998" cy="405" r="7" fill="${GOLD}" stroke="none" />
        <path id="mouth" d="M 915 462 Q 960 505 1005 462" />
        <path id="brow" d="M 902 366 L 940 384 M 1018 366 L 980 384" opacity="0" />
      </g>
      <g id="burst" stroke="${RED}" stroke-width="5" stroke-linecap="round" opacity="0">${rays}</g>
      <rect id="pOut" x="760" y="600" width="400" height="22" rx="11" fill="none" stroke="rgba(239,233,223,0.4)" stroke-width="2" />
      <rect id="pIn" x="763" y="603" width="0" height="16" rx="8" fill="${GOLD}" />
    </svg>`, 17, 19);
  gsap.set(["#face", "#burst"], { svgOrigin: "960 430" });
  gsap.set(["#pOut", "#pIn"], { svgOrigin: "960 611" });

  const W = [0, 99, 198, 297, 394];
  for (let i = 0; i < 4; i++)
    tl.fromTo("#pIn", { attr: { width: W[i] } }, { attr: { width: W[i + 1] }, duration: 0.25, ease: "power2.out", ...IR }, at(17, i));
  tl.fromTo("#pIn", { fill: GOLD }, { fill: RED, duration: 4 * BEAT, ease: "power1.in", ...IR }, at(17));
  shake("#face", at(17, 3), [-2, 2, -2, 2, -2, 2, 0], 0.06);

  const t18 = at(18);
  tl.fromTo(["#pOut", "#pIn"], { opacity: 1, scaleX: 1 }, { opacity: 0, scaleX: 1.25, duration: 0.35, ease: "power2.out", ...IR }, t18);
  tl.fromTo("#burst", { opacity: 1, scale: 0.8 }, { opacity: 0, scale: 1.3, duration: 0.6, ease: "power2.out", ...IR }, t18);
  tl.fromTo("#face", { stroke: GOLD }, { stroke: RED, duration: 0.15, ...IR }, t18);
  tl.fromTo("#face .eye", { fill: GOLD }, { fill: RED, duration: 0.15, ...IR }, t18);
  tl.fromTo("#mouth", { attr: { d: "M 915 462 Q 960 505 1005 462" } },
    { attr: { d: "M 915 482 Q 960 444 1005 482" }, duration: 0.2, ease: "power2.out", ...IR }, t18);
  tl.fromTo("#brow", { opacity: 0 }, { opacity: 1, duration: 0.15, ...IR }, t18);
  tl.fromTo("#face", { scale: 1 }, { scale: 1.12, duration: 0.1, ease: "power2.out", ...IR }, t18);
  tl.fromTo("#face", { scale: 1.12 }, { scale: 1, duration: 0.4, ease: "power2.inOut", ...IR }, t18 + 0.1);
  shake("#face", t18 + 0.05, [-10, 10, -8, 8, -5, 5, 0]);
});
