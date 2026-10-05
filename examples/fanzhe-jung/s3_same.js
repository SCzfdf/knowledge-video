// 第 19–27 小节：三个相同点。中间一个图示，左栏老子、右栏荣格
window.V.parts.push(function () {
  const { tl, at, BEAT, IR, scene, fadeIn, fadeOut, GOLD, SILVER, INK } = window.V;
  const head = (k, text) => `<div class="t head" id="${k}H">${text}<i></i></div>`;
  const pair = (k, l, r) => `
    <div class="col l" id="${k}L" style="top:400px;opacity:0"><div class="who">老子</div><div class="big">${l}</div></div>
    <div class="col r" id="${k}R" style="top:400px;opacity:0"><div class="who">荣格</div><div class="big">${r}</div></div>`;
  // 每个相同点 3 小节：第 1 小节标题 + 图示，第 2 小节出老子，第 3 小节出荣格
  const cols = (k, b) => { fadeIn(`#${k}L`, at(b + 1), 12); fadeIn(`#${k}R`, at(b + 2), 12); };
  const pulse = (sel, t, r0, r1) =>
    tl.fromTo(sel, { opacity: 0.8, attr: { r: r0 } }, { opacity: 0, attr: { r: r1 }, duration: 0.7, ease: "power2.out", ...IR }, t);

  // ---------- ① 对立相依（第 19–21 小节）：金与暗的太极慢慢转 ----------
  const SLATE = "#55585e";
  scene("s3a", `${head("s3a", "相同点 ① · 对立相依")}
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <g id="tj">
        <circle cx="960" cy="470" r="150" fill="${SLATE}" />
        <path d="M 960 320 A 150 150 0 0 1 960 620 A 75 75 0 0 1 960 470 A 75 75 0 0 0 960 320 Z" fill="${GOLD}" />
        <circle id="tjS" cx="960" cy="545" r="22" fill="${SLATE}" />
        <circle id="tjG" cx="960" cy="395" r="22" fill="${GOLD}" />
        <circle cx="960" cy="470" r="150" fill="none" stroke="rgba(239,233,223,0.55)" stroke-width="2" />
      </g>
    </svg>${pair("s3a", "有无相生", "互相补偿")}`, 19, 22);
  gsap.set("#tj", { svgOrigin: "960 470" });
  tl.fromTo("#tj", { scale: 0.85 }, { scale: 1, duration: 0.6, ease: "back.out(1.6)", ...IR }, at(19));
  tl.fromTo("#tj", { rotation: 0 }, { rotation: -240, duration: at(22) - at(19), ease: "none", ...IR }, at(19));
  // 你中有我：老子出场时金里的暗点一跳，荣格出场时暗里的金点一跳
  [["#tjS", 20], ["#tjG", 21]].forEach(([id, b]) => {
    tl.fromTo(id, { attr: { r: 22 } }, { attr: { r: 32 }, duration: 0.12, ease: "power2.out", ...IR }, at(b));
    tl.fromTo(id, { attr: { r: 32 } }, { attr: { r: 22 }, duration: 0.5, ease: "power2.inOut", ...IR }, at(b) + 0.12);
  });
  cols("s3a", 19);

  // ---------- ② 极端转向（第 22–24 小节）：钟摆两拍摆到一头，去右边变银，回左边变金 ----------
  const A = 38, L = 300, PX = 960, PY = 260, rad = (A * Math.PI) / 180;
  const lx = PX - L * Math.sin(rad), rx = PX + L * Math.sin(rad), ey = PY + L * Math.cos(rad);
  scene("s3b", `${head("s3b", "相同点 ② · 极端转向")}
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <path d="M ${lx} ${ey} A ${L} ${L} 0 0 0 ${rx} ${ey}" fill="none" stroke="rgba(239,233,223,0.2)" stroke-width="2" stroke-dasharray="4 10" />
      <circle id="pkL" cx="${lx}" cy="${ey}" r="22" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
      <circle id="pkR" cx="${rx}" cy="${ey}" r="22" fill="none" stroke="${SILVER}" stroke-width="2" opacity="0" />
      <line x1="${PX - 60}" y1="${PY}" x2="${PX + 60}" y2="${PY}" stroke="rgba(239,233,223,0.4)" stroke-width="2" />
      <g id="pend">
        <line x1="${PX}" y1="${PY}" x2="${PX}" y2="${PY + L - 22}" stroke="rgba(239,233,223,0.6)" stroke-width="3" />
        <circle id="bob" cx="${PX}" cy="${PY + L}" r="22" fill="${GOLD}" />
      </g>
      <circle cx="${PX}" cy="${PY}" r="6" fill="${INK}" />
    </svg>${pair("s3b", "正复为奇", "对立转化")}`, 22, 25);
  // 顺时针转为正：rotation = A 时摆锤在左
  gsap.set("#pend", { svgOrigin: `${PX} ${PY}`, rotation: A });
  for (let i = 0; i < 6; i++) {
    const t = at(22) + 2 * i * BEAT, toRight = i % 2 === 0;
    tl.fromTo("#pend", { rotation: toRight ? A : -A }, { rotation: toRight ? -A : A, duration: 2 * BEAT, ease: "sine.inOut", ...IR }, t);
    tl.fromTo("#bob", { fill: toRight ? GOLD : SILVER }, { fill: toRight ? SILVER : GOLD, duration: 2 * BEAT, ease: "sine.inOut", ...IR }, t);
    if (i < 5) pulse(toRight ? "#pkR" : "#pkL", t + 2 * BEAT, 22, 60);
  }
  cols("s3b", 22);

  // ---------- ③ 自我平衡（第 25–27 小节）：一个水槽，中间隔板底下留缝；高的一边流向低的一边，晃几下后持平 ----------
  const BOT = 618, EQ = 150;
  const lv = (h) => ({ y: BOT - h, height: h });
  scene("s3c", `${head("s3c", "相同点 ③ · 自我平衡")}
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <rect id="lqL" x="732" y="${BOT - 250}" width="218" height="250" fill="${GOLD}" opacity="0.75" />
      <rect id="lqR" x="970" y="${BOT - 50}" width="218" height="50" fill="${GOLD}" opacity="0.75" />
      <rect x="950" y="598" width="20" height="20" fill="${GOLD}" opacity="0.75" />
      <path d="M 730 330 L 730 620 L 1190 620 L 1190 330 M 950 330 L 950 596 L 970 596 L 970 330"
            fill="none" stroke="rgba(239,233,223,0.55)" stroke-width="2" stroke-linejoin="round" />
      <line id="lvl" x1="700" y1="${BOT - EQ}" x2="1220" y2="${BOT - EQ}" stroke="${GOLD}" stroke-width="2" stroke-dasharray="8 8" opacity="0" />
    </svg>
    <div class="lbl2" id="lbYu" style="left:781px;top:644px;width:120px;text-align:center;opacity:0">有余</div>
    <div class="lbl2" id="lbBz" style="left:1019px;top:644px;width:120px;text-align:center;opacity:0">不足</div>
    ${pair("s3c", "损有余，补不足", "自我调节")}`, 25, 28);
  fadeIn(["#lbYu", "#lbBz"], at(25) + 0.1, 6, 0.35);
  // 左边液面高度的关键帧，右边 = 300 - 左边（总量不变）
  const KL = [250, 135, 160, 145, EQ], KD = [0.55, 0.35, 0.3, 0.25];
  let t = at(25, 2);
  for (let i = 0; i < 4; i++) {
    tl.fromTo("#lqL", { attr: lv(KL[i]) }, { attr: lv(KL[i + 1]), duration: KD[i], ease: "sine.inOut", ...IR }, t);
    tl.fromTo("#lqR", { attr: lv(300 - KL[i]) }, { attr: lv(300 - KL[i + 1]), duration: KD[i], ease: "sine.inOut", ...IR }, t);
    t += KD[i];
  }
  fadeOut(["#lbYu", "#lbBz"], at(27), 0.3);
  gsap.set("#lvl", { svgOrigin: `960 ${BOT - EQ}` });
  tl.fromTo("#lvl", { opacity: 0, scaleX: 0 }, { opacity: 0.8, scaleX: 1, duration: 0.6, ease: "power2.out", ...IR }, at(27));
  cols("s3c", 25);
});
