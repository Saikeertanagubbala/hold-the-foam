// Interactive 3D lid viewer.
// Loads assets/models/lid.stl; if it isn't there yet, shows a simple stand-in lid.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

const MODEL_URL = "assets/models/lid.stl";

const stage = document.getElementById("lid-stage");
const status = document.getElementById("lid-status");
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = !reduceMotion;
controls.autoRotateSpeed = 1.2;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a6a4a, 1.3));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-4, -2, -3);
scene.add(rimLight);

const material = new THREE.MeshStandardMaterial({
  color: css("--lid") || "#f5f3ee",
  roughness: 0.45,
  metalness: 0,
  side: THREE.DoubleSide,
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => material.color.set(css("--lid")));

let radius = 1;

// ---------- Camera views (like AutoCAD's ViewCube) ----------
const VIEWS = {
  top:    new THREE.Vector3(0, 1, 0.0001),
  bottom: new THREE.Vector3(0, -1, 0.0001),
  front:  new THREE.Vector3(0, 0, 1),
  right:  new THREE.Vector3(1, 0, 0),
  iso:    new THREE.Vector3(1, 0.8, 1),
};
let tween = null;

function setView(name, instant = false) {
  const to = VIEWS[name].clone().normalize().multiplyScalar(radius * 3.2);
  if (instant || reduceMotion) {
    camera.position.copy(to);
  } else {
    tween = { from: camera.position.clone(), to, t: 0 };
  }
  controls.target.set(0, 0, 0);
  document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
}

document.querySelectorAll("[data-view]").forEach((btn) =>
  btn.addEventListener("click", () => {
    setSpin(false);
    setView(btn.dataset.view);
  })
);

const wireBtn = document.getElementById("toggle-wire");
wireBtn.addEventListener("click", () => {
  material.wireframe = !material.wireframe;
  wireBtn.setAttribute("aria-pressed", material.wireframe);
});

const spinBtn = document.getElementById("toggle-spin");
function setSpin(on) {
  controls.autoRotate = on;
  spinBtn.setAttribute("aria-pressed", on);
}
setSpin(controls.autoRotate);
spinBtn.addEventListener("click", () => setSpin(!controls.autoRotate));
controls.addEventListener("start", () => {
  tween = null;
  document.querySelectorAll("[data-view]").forEach((b) => b.classList.remove("active"));
});

// ---------- Model ----------
function showGeometry(geometry, isStandIn) {
  geometry.center();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  radius = geometry.boundingSphere.radius;

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  camera.near = radius / 100;
  camera.far = radius * 100;
  camera.updateProjectionMatrix();
  controls.minDistance = radius * 1.2;
  controls.maxDistance = radius * 8;
  setView("iso", true);

  if (isStandIn) {
    status.textContent = "Showing a stand-in lid. Add your model as assets/models/lid.stl to see the real one.";
  } else {
    // STL has no units; AutoCAD exports usually use millimetres.
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);
    const dia = Math.max(size.x, size.z).toFixed(1);
    const height = size.y.toFixed(1);
    status.textContent = `Ø ${dia} × ${height} high (drawing units, usually mm)`;
  }
}

// A rough lid made by spinning a side profile around the center, used until lid.stl exists.
function standInLid() {
  const profile = [
    [0, 9], [30, 9], [33, 10], [36, 13], [39, 13], [41, 10], [42, 4],
    [45, 2], [45, -4], [43, -5], [42, 0], [40, 2], [0, 2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(profile, 96);
}

new STLLoader().load(
  MODEL_URL,
  (geometry) => {
    geometry.rotateX(-Math.PI / 2); // AutoCAD is Z-up; three.js is Y-up
    showGeometry(geometry, false);
  },
  undefined,
  () => showGeometry(standInLid(), true)
);

// ---------- Render loop ----------
function resize() {
  const { clientWidth: w, clientHeight: h } = stage;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

renderer.setAnimationLoop(() => {
  if (tween) {
    tween.t = Math.min(1, tween.t + 0.06);
    const ease = 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.from, tween.to, ease);
    if (tween.t === 1) tween = null;
  }
  controls.update();
  renderer.render(scene, camera);
});
