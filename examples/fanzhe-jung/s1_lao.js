// 第 6–9 小节：老子。草木（第七十六章）→ 祸福（第五十八章）
window.V.parts.push(function () {
  const { tl, at, BEAT, IR, scene, fadeIn, fadeOut, GOLD, SILVER, DIM } = window.V;

  // ---------- 第 6、7 小节：草木活着柔软，死了僵硬；枯枝退去，新芽长出 ----------
  const LIVE = "M 960 660 C 935 580 990 500 950 420";
  const DEAD = "M 960 660 C 960 590 961 520 960 440";
  const LEAF = "M 0 0 Q 30 -22 64 -6 Q 30 8 0 0 Z";
  // 叶子挂在 LIVE 曲线 t≈0.45、0.7 处；外层 g 不带 transform，专门给动画用
  const plant = (id) => `
    <g id="${id}">
      <path class="stem" d="${LIVE}" fill="none" stroke="${GOLD}" stroke-width="5" stroke-linecap="round" />
      <g class="leaf"><g transform="translate(959 552) rotate(-150)"><path d="${LEAF}" fill="${GOLD}" /></g></g>
      <g class="leaf"><g transform="translate(965 492) rotate(-30)"><path d="${LEAF}" fill="${GOLD}" /></g></g>
    </g>`;
  scene("s1a", `
    <div class="t quote" id="qA" style="top:236px">草木之生也<b>柔脆</b>，其死也<em>枯槁</em></div>
    <div class="t quote" id="qB" style="top:236px;opacity:0">坚强者<em>死之徒</em>，柔弱者<b>生之徒</b></div>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <line x1="800" y1="660" x2="1120" y2="660" stroke="rgba(239,233,223,0.22)" stroke-width="2" stroke-linecap="round" />
      ${plant("p1")}${plant("p2")}
    </svg>`, 6, 8);

  gsap.set(["#p1", "#p2"], { svgOrigin: "960 660" });
  // 随拍左右摆，返回最后的角度
  const sway = (sel, t, n) => {
    let r = 0;
    for (let i = 0; i < n; i++) {
      const r1 = i % 2 ? -5 : 5;
      tl.fromTo(sel, { rotation: r }, { rotation: r1, duration: BEAT, ease: "sine.inOut", ...IR }, t + i * BEAT);
      r = r1;
    }
    return r;
  };

  // 第 6 小节：前两拍摆动，第 3 拍枯死——变直、变灰，叶子掉落
  const td = at(6, 2);
  const r6 = sway("#p1", at(6), 2);
  tl.fromTo("#p1", { rotation: r6 }, { rotation: 0, duration: 0.4, ease: "power2.out", ...IR }, td);
  tl.fromTo("#p1 .stem", { attr: { d: LIVE }, stroke: GOLD }, { attr: { d: DEAD }, stroke: DIM, duration: 0.6, ease: "power2.inOut", ...IR }, td);
  tl.fromTo("#p1 .leaf", { y: 0, opacity: 1 }, { y: 80, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.in", ...IR }, td);

  // 第 7 小节：枯枝淡出，新芽从土里画出来，叶子长出，再接着摆
  const t7 = at(7);
  const len = document.querySelector("#p2 .stem").getTotalLength();
  gsap.set("#p2", { opacity: 0 });
  gsap.set("#p2 .stem", { strokeDasharray: len, strokeDashoffset: len });
  gsap.set("#p2 .leaf", { opacity: 0 });
  fadeOut("#p1", t7 - 0.3, 0.28);
  tl.fromTo("#p2", { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, t7);
  tl.fromTo("#p2 .stem", { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2 * BEAT, ease: "power2.out", ...IR }, t7);
  tl.fromTo("#p2 .leaf", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: BEAT / 2, ease: "power2.out", ...IR }, at(7, 1));
  sway("#p2", at(7, 2), 2);
  fadeOut("#qA", t7 - 0.27, 0.25);
  fadeIn("#qB", t7, 8, 0.35);

  // ---------- 第 8、9 小节（配乐高潮起点）：祸福圆牌，翻过来又翻回去 ----------
  scene("s1b", `
    <div class="t quote" id="qC" style="top:236px"><em>祸</em>兮，<b>福</b>之所倚</div>
    <div class="t quote" id="qD" style="top:236px;opacity:0"><b>福</b>兮，<em>祸</em>之所伏</div>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <circle id="ring" cx="960" cy="480" r="150" fill="none" stroke-width="2" opacity="0" />
    </svg>
    <div id="coinW"><div id="coin"><div class="face" id="fHuo">祸</div><div class="face" id="fFu">福</div></div></div>`, 8, 10);

  tl.fromTo("#coinW", { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(1.8)", ...IR }, at(8));
  // 压扁到侧面那一刻换面，像硬币翻转；落定时外圈放一个脉冲
  const flip = (t, from, to, color) => {
    tl.fromTo("#coin", { scaleX: 1 }, { scaleX: 0, duration: 0.14, ease: "power2.in", ...IR }, t - 0.14);
    tl.fromTo(from, { opacity: 1 }, { opacity: 0, duration: 0.01, ...IR }, t);
    tl.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, t);
    tl.fromTo("#coin", { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: "power2.out", ...IR }, t);
    tl.fromTo("#ring", { opacity: 0.8, stroke: color, attr: { r: 150 } }, { opacity: 0, stroke: color, attr: { r: 220 }, duration: 0.7, ease: "power2.out", ...IR }, t);
  };
  flip(at(8, 2), "#fHuo", "#fFu", GOLD);
  fadeOut("#qC", at(9) - 0.27, 0.25);
  fadeIn("#qD", at(9), 8, 0.35);
  flip(at(9, 2), "#fFu", "#fHuo", SILVER);
});
