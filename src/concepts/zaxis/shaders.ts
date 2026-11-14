/* GLSL for the Z-Axis scene. Everything is unlit and authored in display-referred
   colour (textures are sampled raw), so no tone mapping or colour-space chunks. */

export const paneVert = /* glsl */ `
varying vec2 vUv;
varying float vDist;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}`

/**
 * Application window / handset drawn entirely in the fragment shader:
 * rounded-rect SDF, title bar, capture texture, rim glow, and a rising scan
 * line that "materialises" the surface as the camera approaches.
 */
export const paneFrag = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uHasMap;
uniform vec2 uSize;
uniform vec2 uPlane;
uniform float uRadius;
uniform float uBar;
uniform float uPhone;
uniform float uMode;   // 0 full · 1 ghost · 2 restricted
uniform float uReveal;
uniform float uTime;
uniform vec3 uHue;
varying vec2 vUv;
varying float vDist;

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

void main() {
  vec2 p = (vUv - 0.5) * uPlane;
  float d = sdBox(p, uSize * 0.5, uRadius);
  float aa = max(fwidth(d), 1e-4);
  float inside = 1.0 - smoothstep(-aa, aa, d);
  vec2 w = p / uSize + 0.5;

  vec3 bone = vec3(0.925, 0.933, 0.910);
  vec3 panel = vec3(0.043, 0.050, 0.060);

  // — unmaterialised state: a faint survey grid in the station hue
  vec2 gc = p / 0.42;
  vec2 gg = abs(fract(gc - 0.5) - 0.5) / max(fwidth(gc), vec2(1e-4));
  float grid = 1.0 - min(min(gg.x, gg.y), 1.0);
  vec3 wire = uHue * (0.10 + grid * 0.55);
  float wireA = 0.10 + grid * 0.22;

  // — materialised state
  vec3 tex = panel;
  if (uPhone < 0.5) {
    float barF = uBar / uSize.y;
    if (w.y > 1.0 - barF) {
      tex = panel * 1.75;
      vec2 bp = vec2(p.x + uSize.x * 0.5, uSize.y * 0.5 - p.y);
      float r = uBar * 0.16;
      for (int i = 0; i < 3; i++) {
        float dd = length(bp - vec2(uBar * (0.62 + float(i) * 0.52), uBar * 0.5)) - r;
        float ring = 1.0 - smoothstep(0.0, fwidth(dd) * 1.5, abs(dd) - r * 0.18);
        tex = mix(tex, bone, ring * 0.55);
      }
      float div = 1.0 - smoothstep(0.0, fwidth(bp.y) * 1.5, abs(bp.y - uBar));
      tex = mix(tex, bone, div * 0.35);
    } else {
      vec2 tuv = vec2(w.x, w.y / (1.0 - barF));
      tex = texture2D(uMap, tuv).rgb;
    }
  } else {
    float bz = uSize.x * 0.045;
    vec2 innerSize = uSize - 2.0 * bz;
    float di = sdBox(p, innerSize * 0.5, max(uRadius - bz, 0.01));
    float innerMask = 1.0 - smoothstep(-fwidth(di), fwidth(di), di);
    vec2 tuv = p / innerSize + 0.5;
    vec3 shot = texture2D(uMap, clamp(tuv, 0.0, 1.0)).rgb;
    tex = mix(panel * 1.9, shot, innerMask);
    float inl = 1.0 - smoothstep(0.0, fwidth(di) * 1.5, abs(di));
    tex = mix(tex, bone, inl * 0.25);
    float isl = sdBox(p - vec2(0.0, innerSize.y * 0.5 - uSize.x * 0.075), vec2(uSize.x * 0.15, uSize.x * 0.035), uSize.x * 0.035);
    tex = mix(tex, vec3(0.0), 1.0 - smoothstep(-fwidth(isl), fwidth(isl), isl));
  }

  if (uMode > 1.5) {
    // restricted: hatched and held back — the surface is never fully disclosed
    float hatch = step(0.5, fract((p.x + p.y) * 1.7 - uTime * 0.04));
    tex = mix(tex * 0.22, tex * 0.62, hatch);
    tex += uHue * 0.035 * hatch;
  }

  // — rising scan
  float jitter = (hash(floor(w.x * 46.0)) - 0.5) * 0.05 * (1.0 - uReveal);
  float scan = uReveal * 1.24 - 0.12 + jitter;
  float shown = 1.0 - smoothstep(scan - 0.003, scan + 0.003, w.y);
  float mat = shown * uHasMap;
  if (uMode > 0.5 && uMode < 1.5) mat = 0.0;
  wireA *= mix(0.4, 1.0, uReveal);

  vec3 col = mix(wire, tex, mat);
  float alpha = mix(wireA, 1.0, mat);

  float edge = exp(-abs(w.y - scan) * 90.0) * step(0.001, uReveal) * (1.0 - step(0.999, uReveal));
  col += uHue * edge * 1.4;
  alpha = max(alpha, edge);

  // subtle raster on the materialised surface
  col *= 1.0 - 0.025 * mat * step(0.5, fract(gl_FragCoord.y * 0.5));

  float border = 1.0 - smoothstep(0.0, aa * 1.5, abs(d + aa));
  vec3 borderCol = mix(uHue, bone, 0.35 + 0.4 * mat);
  col = mix(col, borderCol, border * 0.9);
  alpha = max(alpha * inside, border * 0.95);

  // rim light outside the silhouette
  float glow = exp(-max(d, 0.0) * 4.2) * (0.05 + 0.2 * uReveal) * (1.0 - inside);
  col = mix(uHue, col, inside);
  alpha = max(alpha, glow);

  float depthFade = (1.0 - smoothstep(16.0, 84.0, vDist)) * smoothstep(1.2, 4.2, vDist);
  gl_FragColor = vec4(col, alpha * depthFade);
}`

export const floorVert = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

export const floorFrag = /* glsl */ `
precision highp float;
uniform vec3 uHue;
uniform vec3 uCam;
uniform float uSpacing;
uniform float uStandoff;
uniform float uVel;
varying vec3 vWorld;
void main() {
  vec2 c = vWorld.xz / 2.5;
  vec2 fw = max(fwidth(c), vec2(1e-4));
  vec2 g = abs(fract(c - 0.5) - 0.5) / fw;
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  // lines dissolve where they would alias (far, grazing)
  line *= 1.0 - smoothstep(0.25, 0.9, max(fw.x, fw.y));

  // a brighter cross-line marks every station depth
  float sz = mod(-vWorld.z - uStandoff + uSpacing * 0.5, uSpacing) - uSpacing * 0.5;
  float sfw = max(fwidth(vWorld.z), 1e-4);
  float sline = (1.0 - smoothstep(0.03, 0.03 + sfw * 1.5, abs(sz))) * (1.0 - smoothstep(0.6, 2.4, sfw));

  float dist = length(vWorld.xz - uCam.xz);
  float fade = exp(-dist * 0.034) * smoothstep(0.6, 3.5, dist);
  vec3 bone = vec3(0.925, 0.933, 0.910);
  vec3 col = mix(bone, uHue, 0.72);
  float a = (line * (0.20 + 0.25 * min(abs(uVel), 1.0)) + sline * 0.3) * fade;
  gl_FragColor = vec4(col, a);
}`

export const routeVert = /* glsl */ `
attribute float aT;
attribute float aS;
varying float vT;
varying float vS;
varying float vDist;
void main() {
  vT = aT;
  vS = aS;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}`

/** The Zaylo line: a solid, glowing core up to the head; a dashed preview beyond it. */
export const routeFrag = /* glsl */ `
precision highp float;
uniform vec3 uHue;
uniform float uHead;
uniform float uTime;
varying float vT;
varying float vS;
varying float vDist;
void main() {
  float a = abs(vS);
  float fw = max(fwidth(vS), 1e-4);
  float coreW = 0.022;
  float core = 1.0 - smoothstep(coreW, coreW + fw * 1.5, a);
  core = max(core, (1.0 - smoothstep(0.0, fw * 1.2, a)) * 0.85);
  float glow = exp(-a * 7.0) * 0.3;
  float drawn = 1.0 - smoothstep(uHead - 0.06, uHead + 0.06, vT);
  float head = exp(-abs(vT - uHead) * 0.9) * drawn;
  float dash = step(0.5, fract(vT * 0.9 - uTime * 0.25));
  vec3 col = mix(uHue, vec3(1.0), core * 0.3);
  float thin = 1.0 - smoothstep(0.012, 0.012 + fw * 1.5, a);
  float alpha = drawn * (core + glow * (0.7 + head * 1.6)) + (1.0 - drawn) * thin * dash * 0.45;
  alpha *= exp(-vDist * 0.012) * smoothstep(0.4, 2.0, vDist);
  gl_FragColor = vec4(col, alpha);
}`

export const dustVert = /* glsl */ `
attribute float aSeed;
attribute float aEnd;
uniform float uCamZ;
uniform float uRange;
uniform float uStreak;
uniform float uPx;
uniform float uSize;
varying float vA;
void main() {
  vec3 p = position;
  p.z = uCamZ + 5.0 - mod(uCamZ + 5.0 - p.z, uRange);
  p.z -= aEnd * uStreak * (0.5 + aSeed);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  vA = (1.0 - smoothstep(uRange * 0.45, uRange, dist)) * smoothstep(0.3, 2.5, dist) * (0.35 + 0.65 * aSeed);
  gl_PointSize = uSize * uPx * (0.5 + aSeed) / max(dist, 0.5);
  gl_Position = projectionMatrix * mv;
}`

export const dustPointFrag = /* glsl */ `
precision highp float;
uniform vec3 uHue;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.1, 0.5, d)) * vA * 0.5;
  vec3 col = mix(vec3(0.925, 0.933, 0.910), uHue, 0.45);
  gl_FragColor = vec4(col, a);
}`

export const dustLineFrag = /* glsl */ `
precision highp float;
uniform vec3 uHue;
uniform float uStreak;
varying float vA;
void main() {
  float a = vA * min(abs(uStreak) * 0.5, 0.55);
  vec3 col = mix(vec3(0.925, 0.933, 0.910), uHue, 0.6);
  gl_FragColor = vec4(col, a);
}`

export const ringVert = /* glsl */ `
varying vec2 vUv;
varying float vDist;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}`

/** Containment ring: dashed outer band, tick marks, slow rotation. Drawn on a quad. */
export const ringFrag = /* glsl */ `
precision highp float;
uniform vec3 uHue;
uniform float uTime;
uniform float uReveal;
varying vec2 vUv;
varying float vDist;
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  float ang = atan(p.y, p.x);
  float fw = max(fwidth(r), 1e-4);
  float outer = 1.0 - smoothstep(0.0, fw * 1.5, abs(r - 0.94));
  float dash = step(0.35, fract((ang + uTime * 0.08) * 12.0 / 6.2831853));
  float inner = 1.0 - smoothstep(0.0, fw * 1.5, abs(r - 0.80));
  float tick = step(0.9, fract((ang - uTime * 0.05) * 48.0 / 6.2831853)) * step(0.80, r) * step(r, 0.86);
  float sweep = smoothstep(0.0, 1.0, fract((ang + 3.14159) / 6.2831853 - uTime * 0.06)) * step(0.80, r) * step(r, 0.94) * 0.12;
  float a = (outer * dash * 0.9 + inner * 0.35 + tick * 0.5 + sweep) * uReveal;
  a *= (1.0 - smoothstep(16.0, 84.0, vDist)) * smoothstep(1.2, 4.2, vDist);
  gl_FragColor = vec4(uHue, a);
}`
