// 字幕与右上角出处。字幕在小节重拍切换，换条硬切 0.02 秒，最后一条淡出 0.25 秒；文案见 01_分片文案.md
window.V.parts.push(function () {
  const { tl, at, IR, $, cite } = window.V;

  // [小节, html]：一小节一条，不计标点一般 ≤ 12 字；一处 <b>（显示为金色）；null 表示上一条到此结束。细则见 skill 的 references/style.md
  const CAPS = [
    [1, "__CAPTION__<b>__KEY__</b>"],
    [2, null],
  ];

  CAPS.forEach(([bar, html], i) => {
    if (!html) return;
    const el = document.createElement("div");
    el.className = "cap";
    el.innerHTML = html;
    $("caps").appendChild(el);
    tl.fromTo(el, { opacity: i ? 0.5 : 0, y: i ? 6 : 12 },
      { opacity: 1, y: 0, duration: i ? 0.12 : 0.2, ease: "power2.out", ...IR }, at(bar));
    const next = CAPS[i + 1];
    if (!next) return;
    const d = next[1] ? 0.02 : 0.25;   // 换下一条硬切；最后一条淡出
    tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: d, ...IR }, at(next[0]) - d);
  });

  // 右上角出处：[文字, 起始小节, 结束小节)
  [
    ["__CITE__", 1, 2],
  ].forEach(([text, b0, b1]) => cite(text, b0, b1));
});
