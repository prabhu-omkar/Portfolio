// Chess piece geometry and materials.
// Pieces are built procedurally (lathe profiles + an extruded knight head) so the
// site works with zero downloads. If MODEL_URL is set, matching meshes from a
// .glb replace the procedural ones (see loadModelPieces).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const GLYPH = {
  white: { pawn: '♙', knight: '♘', bishop: '♗', rook: '♖', queen: '♕', king: '♔' },
  black: { pawn: '♟', knight: '♞', bishop: '♝', rook: '♜', queen: '♛', king: '♚' },
};
export const LETTER = { knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K', pawn: '' };
export const HEIGHT = { pawn: 0.82, knight: 1.12, bishop: 1.17, rook: 0.95, queen: 1.2, king: 1.3 };

const SEG = 64;
const V = (x, y) => new THREE.Vector2(Math.max(x, 0.0005), y);

function arc(cy, r, a0, a1, n = 16, ry = r) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = THREE.MathUtils.degToRad(a0 + ((a1 - a0) * i) / n);
    out.push(V(Math.cos(a) * r, cy + Math.sin(a) * ry));
  }
  return out;
}
// Shared foot: flat base, a bead, then a concave sweep up into the stem.
const foot = (r) => [V(0, 0), V(r, 0), V(r, 0.045), V(r - 0.025, 0.07), V(r - 0.02, 0.1), V(r - 0.06, 0.13), V(r - 0.11, 0.165)];
const lathe = (pts) => new THREE.LatheGeometry(pts, SEG);

function merge(list) {
  const flat = list.map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
    n.clearGroups();
    return n;
  });
  return mergeGeometries(flat, false);
}

function pawnGeo() {
  return lathe([
    ...foot(0.34),
    V(0.15, 0.22), V(0.12, 0.32), V(0.11, 0.42),
    V(0.2, 0.46), V(0.205, 0.49), V(0.13, 0.52),
    ...arc(0.67, 0.155, -62, 90),
  ]);
}

function bishopGeo() {
  const body = lathe([
    ...foot(0.35),
    V(0.15, 0.24), V(0.12, 0.4), V(0.105, 0.56),
    V(0.2, 0.6), V(0.21, 0.63), V(0.13, 0.665), V(0.14, 0.7),
    ...arc(0.86, 0.155, -55, 90, 18, 0.2),
  ]);
  const tip = new THREE.SphereGeometry(0.055, 24, 16).translate(0, 1.11, 0);
  return merge([body, tip]);
}

function rookGeo() {
  const body = lathe([
    ...foot(0.37),
    V(0.27, 0.2), V(0.25, 0.28), V(0.23, 0.62),
    V(0.29, 0.68), V(0.3, 0.84), V(0.23, 0.84), V(0.23, 0.78), V(0, 0.78),
  ]);
  const merlons = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const b = new THREE.BoxGeometry(0.075, 0.1, 0.13);
    b.rotateY(-a).translate(Math.cos(a) * 0.265, 0.885, Math.sin(a) * 0.265);
    merlons.push(b);
  }
  return merge([body, ...merlons]);
}

function queenGeo() {
  const body = lathe([
    ...foot(0.37),
    V(0.17, 0.24), V(0.13, 0.42), V(0.105, 0.7),
    V(0.19, 0.74), V(0.2, 0.77), V(0.12, 0.8), V(0.13, 0.86),
    V(0.23, 1.06), V(0.2, 1.08), V(0.12, 1.05), V(0, 1.05),
  ]);
  const parts = [body, new THREE.SphereGeometry(0.075, 24, 16).translate(0, 1.13, 0)];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    parts.push(new THREE.SphereGeometry(0.034, 12, 10).translate(Math.cos(a) * 0.215, 1.09, Math.sin(a) * 0.215));
  }
  return merge(parts);
}

function knightGeo() {
  const base = lathe([...foot(0.36), V(0.27, 0.2), V(0.26, 0.26), V(0, 0.26)]);
  // Side silhouette of the horse head, facing +x.
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0.22);
  s.lineTo(0.19, 0.22);
  s.quadraticCurveTo(0.23, 0.37, 0.13, 0.48);
  s.quadraticCurveTo(0.19, 0.56, 0.32, 0.6);
  s.quadraticCurveTo(0.41, 0.66, 0.36, 0.74);
  s.quadraticCurveTo(0.29, 0.8, 0.17, 0.86);
  s.quadraticCurveTo(0.09, 0.92, 0.05, 1.01);
  s.lineTo(-0.01, 1.08);
  s.quadraticCurveTo(-0.08, 1.0, -0.12, 0.93);
  s.quadraticCurveTo(-0.27, 0.82, -0.26, 0.55);
  s.quadraticCurveTo(-0.25, 0.36, -0.2, 0.22);
  const head = new THREE.ExtrudeGeometry(s, {
    depth: 0.2, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.035, bevelSegments: 5, curveSegments: 20,
  });
  head.translate(0, 0, -0.1);
  head.computeVertexNormals();
  return merge([base, head]);
}

function kingGeo() {
  const body = lathe([
    ...foot(0.38),
    V(0.17, 0.24), V(0.13, 0.44), V(0.11, 0.76),
    V(0.2, 0.8), V(0.21, 0.83), V(0.13, 0.86), V(0.15, 0.92),
    V(0.22, 1.1), V(0.12, 1.14), V(0, 1.14),
  ]);
  const v = new THREE.BoxGeometry(0.06, 0.2, 0.06).translate(0, 1.23, 0);
  const h = new THREE.BoxGeometry(0.16, 0.06, 0.06).translate(0, 1.25, 0);
  return merge([body, v, h]);
}

const BUILDERS = { pawn: pawnGeo, knight: knightGeo, bishop: bishopGeo, rook: rookGeo, queen: queenGeo, king: kingGeo };
const cache = {};
export function geometry(type) {
  return (cache[type] ??= BUILDERS[type]());
}

// Replace procedural geometry with meshes from a .glb whose node or mesh names
// contain the piece names (pawn, knight, bishop, rook, queen, king).
export async function loadModelPieces(url) {
  const gltf = await new GLTFLoader().loadAsync(url);
  gltf.scene.updateMatrixWorld(true);
  const found = {};
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const name = `${o.name} ${o.parent?.name ?? ''}`.toLowerCase();
    for (const type of Object.keys(BUILDERS)) {
      if (!found[type] && name.includes(type)) found[type] = o;
    }
  });
  for (const [type, mesh] of Object.entries(found)) {
    const g = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    g.computeBoundingBox();
    const bb = g.boundingBox;
    const c = bb.getCenter(new THREE.Vector3());
    g.translate(-c.x, -bb.min.y, -c.z);
    const s = HEIGHT[type] / (bb.max.y - bb.min.y);
    g.scale(s, s, s);
    if (!g.attributes.normal) g.computeVertexNormals();
    cache[type] = g;
  }
  return Object.keys(found);
}

/* ---------- materials ---------- */

const rimVert = /* glsl */ `
  #include <clipping_planes_pars_vertex>
  varying vec3 vN; varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <clipping_planes_vertex>
  }`;
const rimFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity, uPower, uOpacity, uNear, uFar;
  varying vec3 vN; varying vec3 vW;
  #include <clipping_planes_pars_fragment>
  void main() {
    #include <clipping_planes_fragment>
    vec3 v = normalize(cameraPosition - vW);
    float f = pow(1.0 - clamp(abs(dot(normalize(vN), v)), 0.0, 1.0), uPower);
    float d = distance(vW, cameraPosition);
    float fade = 1.0 - smoothstep(uNear, uFar, d);
    gl_FragColor = vec4(uColor * uIntensity * f * fade * uOpacity, 1.0);
  }`;

function rimMaterial(color, intensity, power) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
      uPower: { value: power },
      uOpacity: { value: 1 },
      uNear: { value: 9 },
      uFar: { value: 24 },
    },
    vertexShader: rimVert,
    fragmentShader: rimFrag,
    clipping: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function assemble(type, coreMat, rimMat, rimScale) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(geometry(type), coreMat);
  const rim = new THREE.Mesh(geometry(type), rimMat);
  rim.scale.setScalar(rimScale);
  rim.renderOrder = 3;
  g.add(core, rim);
  g.userData = { type, core, rim, flash: 0, baseRim: rimMat.uniforms.uIntensity.value, baseOpacity: coreMat.opacity };
  return g;
}

// Translucent white "ghost" piece with a cool glowing edge.
export function ghostPiece(type) {
  const core = new THREE.MeshPhysicalMaterial({
    color: '#e4ebff', roughness: 0.65, metalness: 0, transparent: true, opacity: 0.22,
    emissive: '#8094d6', emissiveIntensity: 0.2, depthWrite: false,
    blending: THREE.AdditiveBlending, // a ghost only ever adds light, so a faded one never looks like a dark piece
  });
  const g = assemble(type, core, rimMaterial('#cddbff', 1.15, 2.2), 1.012);
  g.userData.core.renderOrder = 2;
  return g;
}

// Glossy black piece (the player) with a glowing accent rim.
export function obsidianPiece(type, rimColor = '#8f7dff') {
  const core = new THREE.MeshPhysicalMaterial({
    color: '#111116', roughness: 0.55, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.5,
    sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(rimColor).multiplyScalar(0.25),
    transparent: true, opacity: 1,
  });
  return assemble(type, core, rimMaterial(rimColor, 0.85, 3.0), 1.008);
}

export function setGlow(piece, k) {
  piece.userData.rim.material.uniforms.uIntensity.value = piece.userData.baseRim * k;
}
export function setFade(piece, k) {
  const { core, rim, baseOpacity } = piece.userData;
  core.material.opacity = baseOpacity * k;
  rim.material.uniforms.uOpacity.value = k;
}
export function swapType(piece, type) {
  piece.userData.type = type;
  piece.userData.core.geometry = geometry(type);
  piece.userData.rim.geometry = geometry(type);
}

// Clip a piece with world-space planes (used by the promotion scan). Pass null to clear.
export function setClip(piece, planes) {
  for (const m of [piece.userData.core.material, piece.userData.rim.material]) {
    m.clippingPlanes = planes;
    m.needsUpdate = true;
  }
}
