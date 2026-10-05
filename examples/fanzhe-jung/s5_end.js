// 第 37–40 小节：收尾。回到开头的圆：金色“反”留在原点，另一个“反”走到对面倒成银色，圆补全
window.V.parts.push(function () {
  const { tl, at, BEAT, IR, scene, fadeIn, GOLD, SILVER } = window.V;
  scene("s5", `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="gs5" gradientUnits="userSpaceOnUse" x1="750" y1="0" x2="1170" y2="0">
          <stop offset="0%" stop-color="${GOLD}" /><stop offset="100%" stop-color="${SILVER}" />
        </linearGradient>
      </defs>
      <circle id="eGuide" cx="960" cy="450" r="210" fill="none" stroke="rgba(239,233,223,0.16)" stroke-width="2"
              stroke-dasharray="1319.47" stroke-dashoffset="1319.47" transform="rotate(180 960 450)" />
      <path id="eArcA" d="M 750 450 A 210 210 0 0 1 1170 450" fill="none" stroke="url(#gs5)" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="659.73" stroke-dashoffset="659.73" />
      <path id="eArcB" d="M 1170 450 A 210 210 0 0 1 750 450" fill="none" stroke="url(#gs5)" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="659.73" stroke-dashoffset="659.73" />
      <g id="eFlow" opacity="0"><circle cx="960" cy="240" r="6" fill="${GOLD}" /></g>
      <circle id="ePulX" cx="1170" cy="450" r="24" fill="none" stroke="${SILVER}" stroke-width="2" opacity="0" />
      <circle id="ePulO" cx="960" cy="450" r="210" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0" />
    </svg>
    <!-- 两个“反”起点重合，第 38 小节才分开（有意叠放） -->
    <div class="ch" id="eA" style="left:750px;top:350px" data-layout-allow-overlap>反</div>
    <div class="arm" id="eArm"><div class="armIn" id="eArmIn"><div class="mv" id="eMv"><div id="eMvIn" style="opacity:0">反</div></div></div></div>
    <div class="t serif" id="eTxt" style="top:716px;font-size:66px;font-weight:700;letter-spacing:6px;opacity:0">反过来的那一面，<b style="color:var(--gold)">也是你</b></div>
  `, 37, null);

  // 两个“反”都在圆的左端 (750, 450)：一个静止，一个挂在转臂上
  gsap.set("#eA", { scale: 0.55 });
  gsap.set("#eArmIn", { x: -210, y: 0 });
  gsap.set("#eMv", { scale: 0.55 });
  gsap.set("#eFlow", { svgOrigin: "960 450" });

  // ---------- 第 37 小节：圆画出来，一个小光点顺着圆走一圈 ----------
  const t37 = at(37);
  tl.fromTo("#eA", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 0.55, duration: 0.45, ease: "back.out(2)", ...IR }, t37);
  tl.fromTo("#eGuide", { strokeDashoffset: 1319.47 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", ...IR }, t37 + 0.05);
  tl.fromTo("#eFlow", { opacity: 0 }, { opacity: 1, duration: 0.2, ...IR }, at(37, 1));
  tl.fromTo("#eFlow", { rotation: 0 }, { rotation: 360, duration: 3 * BEAT, ease: "none", ...IR }, at(37, 1));
  tl.fromTo("#eFlow", { opacity: 1 }, { opacity: 0, duration: 0.2, ...IR }, at(38) - 0.2);

  // ---------- 第 38 小节：另一个“反”沿上半圆走到对面，倒过来，变成银色 ----------
  const t38 = at(38), tl38 = at(38, 2);
  tl.fromTo("#eMvIn", { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, t38);
  tl.fromTo("#eArm", { rotation: 0 }, { rotation: 180, duration: tl38 - t38, ease: "sine.inOut", ...IR }, t38);
  tl.fromTo("#eArcA", { strokeDashoffset: 659.73 }, { strokeDashoffset: 0, duration: tl38 - t38, ease: "sine.inOut", ...IR }, t38);
  tl.fromTo("#eMvIn", { color: GOLD }, { color: SILVER, duration: 0.3, ease: "power1.inOut", ...IR }, tl38 - 0.15);
  tl.fromTo("#ePulX", { opacity: 0.8, attr: { r: 24 } }, { opacity: 0, attr: { r: 76 }, duration: 0.7, ease: "power2.out", ...IR }, tl38);

  // ---------- 第 39 小节：下半圆补上，两面连成一个圆；大字收尾 ----------
  const t39 = at(39), tc = at(39, 2);
  tl.fromTo("#eArcB", { strokeDashoffset: 659.73 }, { strokeDashoffset: 0, duration: tc - t39, ease: "sine.inOut", ...IR }, t39);
  fadeIn("#eTxt", t39, 12, 0.5);
  tl.fromTo("#ePulO", { opacity: 0.7, attr: { r: 210 } }, { opacity: 0, attr: { r: 262 }, duration: 0.9, ease: "power2.out", ...IR }, tc);
  tl.fromTo("#eGuide", { stroke: "rgba(239,233,223,0.16)" }, { stroke: "rgba(242,196,109,0.45)", duration: 0.6, ...IR }, tc);

  // ---------- 第 40 小节：“也是你”亮一下，然后定格渐黑（渐黑在 core.js） ----------
  const OFF = "0 0 0px rgba(242,196,109,0)", ON = "0 0 28px rgba(242,196,109,0.6)";
  tl.fromTo("#eTxt b", { textShadow: OFF }, { textShadow: ON, duration: 0.5, ease: "power2.out", ...IR }, at(40));
});
