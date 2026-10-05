// 第 28–36 小节：三个不同点。左栏老子，右栏荣格，中间一条竖线
window.V.parts.push(function () {
  const { tl, at, BEAT, IR, scene, fadeIn, GOLD, SILVER, INK } = window.V;
  // 描线：按路径长度从头画出来
  const draw = (sel, t, d = 0.8) => document.querySelectorAll(sel).forEach((el) => {
    const len = el.getTotalLength();
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    tl.fromTo(el, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut", ...IR }, t);
  });
  const pulse = (sel, t, r0, r1, d = 0.5) =>
    tl.fromTo(sel, { opacity: 0.8, attr: { r: r0 } }, { opacity: 0, attr: { r: r1 }, duration: d, ease: "power2.out", ...IR }, t);
  const pop = (sel, t, r) =>
    tl.fromTo(sel, { opacity: 0, attr: { r: 0 } }, { opacity: 1, attr: { r }, duration: 0.3, ease: "back.out(3)", ...IR }, t);
  const lab = (id, side, text) =>
    `<div class="lab" id="${id}" style="left:${side === "l" ? 160 : 1120}px;opacity:0">${text}</div>`;
  const SVG = (inner) => `<svg width="1920" height="1080" viewBox="0 0 1920 1080">${inner}</svg>`;

  // ---------- 框架：中线 + 两栏名字，第 28–36 小节一直在 ----------
  scene("s4", `${SVG(`<line id="dv" x1="960" y1="220" x2="960" y2="780" stroke="rgba(239,233,223,0.18)" stroke-width="2" />`)}
    <div class="colh" id="hL" style="left:280px;opacity:0">老子</div>
    <div class="colh" id="hR" style="left:1240px;opacity:0">荣格</div>`, 28, 37);
  draw("#dv", at(28));
  fadeIn("#hL", at(28) + 0.1, 10);
  fadeIn("#hR", at(28, 1), 10);

  // ---------- ① 舞台（第 28–30 小节）：左边天地，右边一个人胸口的一点光 ----------
  const STARS = [[360, 500], [410, 450], [470, 425], [540, 445], [600, 490], [630, 540], [330, 550], [450, 480], [525, 480], [565, 425]];
  const LINE = `fill="none" stroke="rgba(239,233,223,0.55)" stroke-width="2"`;
  scene("s4a", `<div class="t head">不同点 ① · 舞台<i></i></div>
    ${SVG(`
      <path class="dA" d="M 260 600 A 220 220 0 0 1 700 600" ${LINE} />
      <path class="dA" d="M 240 600 L 720 600" ${LINE} />
      <path class="dA" d="M 290 600 L 370 530 L 420 565 L 490 505 L 560 560 L 610 535 L 670 600" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round" />
      ${STARS.map(([x, y], i) => `<circle class="star" cx="${x}" cy="${y}" r="${i % 3 ? 3 : 5}" fill="${i % 2 ? INK : GOLD}" opacity="0" />`).join("")}
      <circle class="dB" cx="1440" cy="400" r="55" ${LINE} />
      <path class="dB" d="M 1310 610 C 1310 520 1370 485 1440 485 C 1510 485 1570 520 1570 610" ${LINE} stroke-linecap="round" />
      <circle id="heartH" cx="1440" cy="548" r="34" fill="${GOLD}" opacity="0" />
      <circle id="heartP" cx="1440" cy="548" r="12" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
      <circle id="heart" cx="1440" cy="548" r="10" fill="${GOLD}" opacity="0" />`)}
    ${lab("lbA1", "l", "天地万物")}${lab("lbA2", "r", "一个人的内心")}`, 28, 31);

  draw("#s4a .dA", at(29));
  fadeIn("#lbA1", at(29) + 0.1, 10);
  document.querySelectorAll("#s4a .star").forEach((el, i) => {
    tl.fromTo(el, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)", transformOrigin: "50% 50%", ...IR }, at(29, 1) + (i * BEAT) / 4);
    tl.fromTo(el, { opacity: 1 }, { opacity: 0.3, duration: BEAT, ease: "sine.inOut", repeat: 3, yoyo: true, ...IR }, at(30) + ((i % 3) * BEAT) / 3);
  });
  draw("#s4a .dB", at(30));
  fadeIn("#lbA2", at(30) + 0.1, 10);
  pop("#heart", at(30, 1), 10);
  tl.fromTo("#heartH", { opacity: 0 }, { opacity: 0.22, duration: 0.6, ...IR }, at(30, 1));
  [1, 2, 3].forEach((k) => pulse("#heartP", at(30, k), 12, 56));

  // ---------- ② 应对（第 31–33 小节）：左边流水；右边一团阴影，被一盏灯照亮 ----------
  const wave = (y, amp, wl = 100, x0 = -200, x1 = 900) => {
    let d = `M ${x0} ${y}`;
    for (let x = x0; x < x1; x += wl) d += ` q ${wl / 4} ${-amp} ${wl / 2} 0 t ${wl / 2} 0`;
    return d;
  };
  const FIG = `<circle cx="1490" cy="395" r="48" />
    <path d="M 1405 610 C 1405 520 1440 470 1490 470 C 1540 470 1575 520 1575 610 Z" />`;
  scene("s4b", `<div class="t head">不同点 ② · 应对<i></i></div>
    ${SVG(`
      <defs>
        <linearGradient id="wf" gradientUnits="userSpaceOnUse" x1="260" y1="0" x2="700" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0" /><stop offset="0.2" stop-color="#fff" />
          <stop offset="0.8" stop-color="#fff" /><stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <mask id="wm"><rect x="260" y="360" width="440" height="240" fill="url(#wf)" /></mask>
        <linearGradient id="beamG" gradientUnits="userSpaceOnUse" x1="1300" y1="0" x2="1620" y2="0">
          <stop offset="0" stop-color="${GOLD}" stop-opacity="0.4" /><stop offset="1" stop-color="${GOLD}" stop-opacity="0.03" />
        </linearGradient>
        <clipPath id="litC"><rect id="litR" x="1400" y="330" width="0" height="290" /></clipPath>
      </defs>
      <!-- 波浪比可见区长，靠遮罩裁出 260–700 这一段（有意溢出） -->
      <g mask="url(#wm)" fill="none" stroke="${GOLD}" stroke-linecap="round" data-layout-allow-overflow>
        <path id="w1" d="${wave(420, 16)}" stroke-width="3" />
        <path id="w2" d="${wave(475, 12)}" stroke-width="3" opacity="0.6" />
        <path id="w3" d="${wave(530, 9)}" stroke-width="2" opacity="0.35" />
      </g>
      <polygon id="beam" points="1300,420 1620,300 1620,640" fill="url(#beamG)" opacity="0" />
      <g id="shd" fill="#34363b" stroke="rgba(200,206,216,0.35)" stroke-width="2" opacity="0">${FIG}</g>
      <g clip-path="url(#litC)" fill="${GOLD}" opacity="0.92">${FIG}</g>
      <g fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="3 6">
        <circle class="imag" cx="1405" cy="330" r="12" opacity="0" />
        <circle class="imag" cx="1500" cy="305" r="14" opacity="0" />
        <circle class="imag" cx="1580" cy="340" r="12" opacity="0" />
      </g>
      <circle id="lampH" cx="1300" cy="420" r="26" fill="${GOLD}" opacity="0" />
      <circle id="lamp" cx="1300" cy="420" r="10" fill="${GOLD}" opacity="0" />
      <circle id="litP" cx="1490" cy="480" r="140" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />`)}
    ${lab("lbB1", "l", "守柔 · 无为")}${lab("lbB2", "r", "直面阴影")}`, 31, 34);

  // 水一直往右流，三层速度不同
  [["#w1", 200], ["#w2", 150], ["#w3", 100]].forEach(([id, dx]) =>
    tl.fromTo(id, { x: 0 }, { x: dx, duration: at(34) - at(31), ease: "none", ...IR }, at(31)));
  fadeIn("#lbB1", at(31) + 0.1, 10);
  // 第 32 小节：阴影出现；头顶几团“想象出来的光”亮一下就散了
  tl.fromTo("#shd", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", ...IR }, at(32));
  fadeIn("#lbB2", at(32) + 0.1, 10);
  document.querySelectorAll("#s4b .imag").forEach((el, i) => {
    tl.fromTo(el, { opacity: 0 }, { opacity: 0.8, duration: 0.3, ...IR }, at(32, 1) + (i * BEAT) / 2);
    tl.fromTo(el, { opacity: 0.8 }, { opacity: 0, duration: 0.4, ...IR }, at(32, 3) + i * 0.08);
  });
  // 第 33 小节：灯亮，光从左边照进阴影，直到照满
  pop("#lamp", at(33), 10);
  tl.fromTo("#lampH", { opacity: 0 }, { opacity: 0.25, duration: 0.4, ...IR }, at(33));
  gsap.set("#beam", { svgOrigin: "1300 420" });
  tl.fromTo("#beam", { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.5, ease: "power2.out", ...IR }, at(33) + 0.05);
  tl.fromTo("#litR", { attr: { width: 0 } }, { attr: { width: 180 }, duration: 3 * BEAT, ease: "power1.inOut", ...IR }, at(33) + 0.15);
  pulse("#litP", at(33, 3) + 0.2, 140, 180, 0.6);

  // ---------- ③ 归宿（第 34–36 小节）：左边散点收回圆心；右边四段弧拼成一个圆 ----------
  const N = 16, RX = 480, RY = 470;
  const DOTS = Array.from({ length: N }, (_, i) => {
    const a = i * 2.39996, r = 60 + 100 * Math.sqrt((i + 0.5) / N);   // 黄金角排布，固定不随机
    return [RX + r * Math.cos(a), RY + r * Math.sin(a)];
  });
  const CX = 1440, CY = 470, R = 130;
  const arc = (k) => {
    const p = (deg) => [CX + R * Math.cos((deg * Math.PI) / 180), CY + R * Math.sin((deg * Math.PI) / 180)].map((v) => v.toFixed(1));
    const [x1, y1] = p(k * 90 + 4), [x2, y2] = p(k * 90 + 86);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  scene("s4c", `<div class="t head">不同点 ③ · 归宿<i></i></div>
    ${SVG(`
      <defs>
        <radialGradient id="indF"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.35" /><stop offset="1" stop-color="${GOLD}" stop-opacity="0" /></radialGradient>
      </defs>
      <g id="roots">${DOTS.map(([x, y], i) =>
        `<circle class="rd" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 3 ? 5 : 7}" fill="${i % 2 ? INK : GOLD}" opacity="0" />`).join("")}</g>
      <circle id="rootR" cx="${RX}" cy="${RY}" r="36" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
      <circle id="rootP" cx="${RX}" cy="${RY}" r="16" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
      <circle id="rootC" cx="${RX}" cy="${RY}" r="14" fill="${GOLD}" opacity="0" />
      <circle id="indG" cx="${CX}" cy="${CY}" r="${R + 40}" fill="url(#indF)" opacity="0" />
      ${[0, 1, 2, 3].map((k) =>
        `<g class="frag" opacity="0"><path d="${arc(k)}" fill="none" stroke="${k % 2 ? SILVER : GOLD}" stroke-width="6" stroke-linecap="round" /></g>`).join("")}
      <circle id="indC" cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${GOLD}" stroke-width="3" opacity="0" />
      <circle id="indP" cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
      <circle id="indD" cx="${CX}" cy="${CY}" r="12" fill="${GOLD}" opacity="0" />`)}
    ${lab("lbC1", "l", "复归其根")}${lab("lbC2", "r", "个体化")}
    <div class="note" id="lbC3" style="position:absolute;left:1120px;top:748px;width:640px;text-align:center;opacity:0">Individuation</div>`, 34, 37);

  // 第 34 小节：散点冒出来，转着收回圆心，到了就成一个根
  document.querySelectorAll("#s4c .rd").forEach((el, i) => {
    tl.fromTo(el, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(3)", transformOrigin: "50% 50%", ...IR }, at(34) + i * 0.03);
    tl.fromTo(el, { attr: { cx: DOTS[i][0], cy: DOTS[i][1] } }, { attr: { cx: RX, cy: RY }, duration: 2 * BEAT, ease: "power3.in", ...IR }, at(34, 1));
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.12, ...IR }, at(34, 3) - 0.08);
  });
  gsap.set("#roots", { svgOrigin: `${RX} ${RY}` });
  tl.fromTo("#roots", { rotation: 0 }, { rotation: 150, duration: 2 * BEAT, ease: "power2.in", ...IR }, at(34, 1));
  const ta = at(34, 3);
  pop("#rootC", ta - 0.05, 14);
  pulse("#rootP", ta, 16, 90, 0.7);
  tl.fromTo("#rootR", { opacity: 0, attr: { r: 20 } }, { opacity: 0.5, attr: { r: 36 }, duration: 0.5, ease: "power2.out", ...IR }, ta + 0.1);
  fadeIn("#lbC1", ta - 0.1, 10);

  // 第 35 小节：四段弧（金银相间）按八分音符飞回原位
  document.querySelectorAll("#s4c .frag").forEach((el, k) => {
    const m = ((k * 90 + 45) * Math.PI) / 180;
    gsap.set(el, { svgOrigin: `${CX} ${CY}` });
    tl.fromTo(el, { opacity: 0, x: 90 * Math.cos(m), y: 90 * Math.sin(m), rotation: k % 2 ? 40 : -40 },
      { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.7, ease: "power3.out", ...IR }, at(35) + (k * BEAT) / 2);
  });
  // 第 36 小节：圆补满、亮起来
  tl.fromTo("#indC", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out", ...IR }, at(36));
  tl.fromTo("#indG", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out", ...IR }, at(36));
  pop("#indD", at(36), 12);
  pulse("#indP", at(36), R, R + 60, 0.8);
  fadeIn("#lbC2", at(36) + 0.05, 10);
  fadeIn("#lbC3", at(36, 1), 6);
});
