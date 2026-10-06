// 3D 线框场景模板（Three.js）：第 1–5 小节示例，按分镜替换主体模型和相机走位
// 前提：index.html 已引入 vendor/three.iife.js（打包方法见 env.md），core.js 含 frameHooks
// 首次使用：先按 hyperframes.md「3D 场景」一节的验证清单逐项确认，再做正式场景
window.V.parts.push(function () {
  const { tl, at, IR, scene, frameHooks, GOLD, SILVER } = window.V;
  const el = scene("s1", `<canvas id="gl1" width="1920" height="1080" style="position:absolute;left:0;top:0"></canvas>`, 1, 6);

  // ---------- 渲染器与场景：preserveDrawingBuffer 保证截图拿到当前帧；固定像素比 1 ----------
  const canvas = el.querySelector("#gl1");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(1920, 1080, false);
  const scene3 = new THREE.Scene();
  scene3.fog = new THREE.Fog(0x0c0a07, 900, 2600);        // 远处淡进背景色，拉纵深
  const camera = new THREE.PerspectiveCamera(42, 1920 / 1080, 1, 6000);
  camera.position.set(0, 120, 900);
  camera.lookAt(0, 0, 0);

  // 地面网格：暖色、稀疏、低透明，只起参照——不是赛博网格（见 style.md「3D 线框」）
  const grid = new THREE.GridHelper(4000, 40, 0x8a6f47, 0x4a3d2a);
  grid.material.transparent = true;
  grid.material.opacity = 0.14;
  scene3.add(grid);

  // 主体：金色线框。这里是占位模型——正式场景按分镜建模（建筑、器物、结构），金主银辅
  const body = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.TorusKnotGeometry(160, 44, 96, 12)),
    new THREE.LineBasicMaterial({ color: parseInt(GOLD.slice(1), 16), transparent: true, opacity: 0.9 })
  );
  scene3.add(body);

  // 渲染挂在主时间线更新上：禁 rAF 自驱、禁 performance.now()、禁 THREE.Clock——seek 到哪儿渲哪儿
  // 用 bloom 时（composer 从 window.THREE 上取，打包入口见 env.md）：render 换成 composer.render()，
  // 参数克制：threshold≈0.6、strength≈0.5、radius≈0.4，只让亮线微微发光
  function render() { renderer.render(scene3, camera); }
  frameHooks.push(render);
  render();   // 首帧

  // ---------- 第 1–5 小节：相机缓慢推近，主体匀速自转一周（大动作 ease none，≥2 小节） ----------
  tl.fromTo(camera.position, { z: 900 }, { z: 560, duration: at(5) - at(1), ease: "none", ...IR }, at(1));
  tl.fromTo(body.rotation, { y: 0 }, { y: Math.PI * 2, duration: at(5) - at(1), ease: "none", ...IR }, at(1));
});
