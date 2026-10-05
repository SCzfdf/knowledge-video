// 第 0–5 小节：题眼“反者道之动” → “反”的两层意思 → 引出“弱者道之用”。0–4 小节与已通过的样片一致
window.V.parts.push(function () {
  const { tl, at, BEAT, IR, scene, GOLD, SILVER, DIM } = window.V;
  // 第 5 小节的两行字：120px 字号 = 168px 的格子缩放 0.714，中心 x 间隔 150
  const L2 = [..."弱者道之用"].map((c, i) =>
    `<div class="ch l2" id="d${i}" style="left:${660 + 150 * i}px;top:460px">${c}</div>`).join("");
  scene("s0", `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <!-- 左（原点）金，右（对立面）银 -->
        <linearGradient id="gs" gradientUnits="userSpaceOnUse" x1="750" y1="0" x2="1170" y2="0">
          <stop offset="0%" stop-color="#f2c46d" /><stop offset="100%" stop-color="#c8ced8" />
        </linearGradient>
      </defs>
      <circle id="guide" cx="960" cy="450" r="210" fill="none" stroke="rgba(239,233,223,0.16)" stroke-width="2"
              stroke-dasharray="1319.47" stroke-dashoffset="1319.47" transform="rotate(180 960 450)" opacity="0" />
      <path id="arcA" d="M 750 450 A 210 210 0 0 1 1170 450" fill="none" stroke="url(#gs)" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="659.73" stroke-dashoffset="659.73" opacity="0" />
      <path id="arcB" d="M 1170 450 A 210 210 0 0 1 750 450" fill="none" stroke="url(#gs)" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="659.73" stroke-dashoffset="659.73" opacity="0" />
      <circle id="pulseX" cx="1170" cy="450" r="24" fill="none" stroke="#c8ced8" stroke-width="2" opacity="0" />
      <circle id="pulseO" cx="750" cy="450" r="24" fill="none" stroke="#f2c46d" stroke-width="2" opacity="0" />
    </svg>
    <div id="head0" class="t head" style="opacity:0">“反”的两层意思<i></i></div>
    <div class="ch" id="c1" style="left:750px">者</div>
    <div class="ch" id="c2" style="left:960px">道</div>
    <div class="ch" id="c3" style="left:1170px">之</div>
    <div class="ch" id="c4" style="left:1380px">动</div>
    ${L2}
    <div id="q">为什么越用力，<span class="key">越适得其反<span class="ul"></span></span>？</div>
    <div id="src">—— 老子《道德经》第四十章</div>
    <div id="lblX" class="lbl" style="left:1242px">相反</div>
    <div id="lblO" class="lbl" style="left:558px;width:120px;text-align:right">返回</div>
    <!-- “反”挂在圆心的转臂上：先在题眼里，再沿圆走到对面、绕回原点 -->
    <div class="arm" id="arm"><div class="armIn" id="armIn"><div class="mv" id="mv"><div id="mvIn">反</div></div></div></div>
  `, 0, 6);

  // “反”起始在题眼第一格 (540, 420)，相对圆心 (960, 450)
  gsap.set("#armIn", { x: -420, y: -30 });
  gsap.set(".l2", { scale: 0.714 });
  gsap.set(["#d1", "#d2", "#d3", "#d4"], { color: DIM });

  // ---------- 第 0 小节：题眼 + 问题，第 1 帧就能读 ----------
  const rest = ["#c1", "#c2", "#c3", "#c4"], five = ["#mvIn", ...rest];
  tl.fromTo(five, { opacity: 0.92, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" }, 0);
  tl.fromTo("#q", { opacity: 0.9, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0);
  tl.fromTo("#q .ul", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, at(0, 2));

  // ---------- 第 1 小节：五个字按八分音符逐个亮一下，像在数数 ----------
  const ON = "0 0 30px rgba(242,196,109,0.7)", OFF = "0 0 0px rgba(242,196,109,0)";
  five.forEach((id, i) => {
    const t = at(1, 1) + (i * BEAT) / 2;
    tl.fromTo(id, { scale: 1, textShadow: OFF }, { scale: 1.08, textShadow: ON, duration: 0.08, ease: "power2.out", ...IR }, t);
    tl.fromTo(id, { scale: 1.08, textShadow: ON }, { scale: 1, textShadow: OFF, duration: 0.4, ease: "power2.inOut", ...IR }, t + 0.08);
  });

  // ---------- 第 2 小节：聚焦“反” ----------
  tl.fromTo("#q", { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in", ...IR }, at(2) - 0.3);
  tl.fromTo(rest, { color: GOLD }, { color: DIM, duration: 0.4, ease: "power1.out", ...IR }, at(2));
  tl.fromTo("#mv", { scale: 1 }, { scale: 1.1, duration: 0.35, ease: "back.out(2)", ...IR }, at(2));
  tl.fromTo("#src", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", ...IR }, at(2, 1));

  // 第 2 小节最后一拍：其余字退场，“反”落到圆的左端（原点）
  const tx = at(2, 3), t3 = at(3);
  tl.fromTo([...rest, "#src"], { opacity: 1, y: 0 }, { opacity: 0, y: 20, duration: 0.3, stagger: 0.03, ease: "power2.in", ...IR }, tx - 0.1);
  tl.fromTo("#armIn", { x: -420, y: -30 }, { x: -210, y: 0, duration: t3 - tx, ease: "power3.inOut", ...IR }, tx);
  tl.fromTo("#mv", { scale: 1.1 }, { scale: 0.55, duration: t3 - tx, ease: "power3.inOut", ...IR }, tx);
  tl.fromTo("#guide", { opacity: 1, strokeDashoffset: 1319.47 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", ...IR }, tx + 0.05);
  tl.fromTo("#head0", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", ...IR }, t3);

  // ---------- 第 3、4 小节：沿圆周走；走到对面正好倒过来，绕回原点又正过来 ----------
  const travel = (r0, r1, a, b, arc) => {
    tl.fromTo("#arm", { rotation: r0 }, { rotation: r1, duration: b - a, ease: "sine.inOut", ...IR }, a);
    tl.fromTo(arc, { opacity: 1, strokeDashoffset: 659.73 }, { strokeDashoffset: 0, duration: b - a, ease: "sine.inOut", ...IR }, a);
  };
  const land = (t, c0, c1, pulse, lbl) => {
    tl.fromTo("#mvIn", { color: c0 }, { color: c1, duration: 0.3, ease: "power1.inOut", ...IR }, t - 0.15);
    tl.fromTo(pulse, { opacity: 0.8, attr: { r: 24 } }, { opacity: 0, attr: { r: 76 }, duration: 0.7, ease: "power2.out", ...IR }, t);
    tl.fromTo(lbl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", ...IR }, t);
  };
  travel(0, 180, at(3), at(3, 2), "#arcA");
  land(at(3, 2), GOLD, SILVER, "#pulseX", "#lblX");
  travel(180, 360, at(4), at(4, 2), "#arcB");
  land(at(4, 2), SILVER, GOLD, "#pulseO", "#lblO");
  tl.fromTo("#guide", { stroke: "rgba(239,233,223,0.16)" }, { stroke: "rgba(242,196,109,0.45)", duration: 0.6, ...IR }, at(4, 2));

  // ---------- 第 5 小节：“反”回到第一行，下面接上“弱者道之用”，“弱”亮起 ----------
  const t5 = at(5);
  tl.fromTo(["#guide", "#arcA", "#arcB", "#lblX", "#lblO", "#head0"], { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.in", ...IR }, t5 - 0.3);
  // 第一行中心 (660, 380)，相对圆心 (-300, -70)
  tl.fromTo("#armIn", { x: -210, y: 0 }, { x: -300, y: -70, duration: 0.7, ease: "power3.inOut", ...IR }, t5 - 0.2);
  tl.fromTo("#mv", { scale: 0.55 }, { scale: 0.714, duration: 0.7, ease: "power3.inOut", ...IR }, t5 - 0.2);
  // 其余四字回到第一行，中心 x = 810 / 960 / 1110 / 1260
  [60, 0, -60, -120].forEach((x, i) =>
    tl.fromTo(rest[i], { opacity: 0, x, y: -24, scale: 0.714 },
      { opacity: 1, x, y: -40, scale: 0.714, duration: 0.4, ease: "power2.out", ...IR }, t5 + 0.25 + i * 0.05));
  tl.fromTo(".l2", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", ...IR }, at(5, 1));
  const t52 = at(5, 2), GLOW = "0 0 26px rgba(242,196,109,0.55)";
  tl.fromTo("#mvIn", { color: GOLD }, { color: DIM, duration: 0.4, ease: "power1.out", ...IR }, t52);
  tl.fromTo("#d0", { scale: 0.714, textShadow: OFF }, { scale: 0.8, textShadow: ON, duration: 0.12, ease: "power2.out", ...IR }, t52);
  tl.fromTo("#d0", { scale: 0.8, textShadow: ON }, { scale: 0.76, textShadow: GLOW, duration: 0.6, ease: "power2.inOut", ...IR }, t52 + 0.12);
});
