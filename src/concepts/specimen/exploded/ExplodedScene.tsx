/**
 * Exploded specimen — WebGL scene (lazy-loaded chunk).
 *
 * Four plates drawn with one SDF shader: rounded corners, 1px hairlines that
 * stay crisp at any zoom, a procedural grid, window chrome, soft contact
 * shadows and a scanning line. An orthographic camera gives the technical
 * drawing look. Labels and pins are real DOM (drei <Html>) so text stays sharp.
 */
import { Html, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { Product, Surface } from '../../../data/products'
import { textureSource } from '../../../media/manifest'
import { LAYERS, paperTone, structureDataUrl, type Pin } from './layers'

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const frag = /* glsl */ `
uniform int uMode;        // 0 grid · 1 texture · 2 interface · 3 acetate · 4 shadow
uniform vec2 uSize;       // quad size in world units
uniform vec2 uPlate;      // plate size (smaller than the quad for shadows)
uniform float uRadius;
uniform float uOpacity;
uniform float uBar;
uniform float uScan;
uniform float uBlur;
uniform vec3 uPaper;
uniform vec3 uPaperLo;
uniform vec3 uInk;
uniform vec3 uSignal;
uniform sampler2D uMap;
varying vec2 vUv;

float sdRound(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float gridLine(vec2 p, float cell) {
  vec2 g = p / cell;
  vec2 l = abs(fract(g - 0.5) - 0.5) / fwidth(g);
  return 1.0 - min(min(l.x, l.y), 1.0);
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdRound(p, uPlate * 0.5, uRadius);
  float aa = max(fwidth(d), 1e-5);

  if (uMode == 4) {
    float a = (1.0 - smoothstep(-uBlur, uBlur, d)) * uOpacity;
    gl_FragColor = vec4(uInk, a);
    #include <colorspace_fragment>
    return;
  }

  float inside = 1.0 - smoothstep(-aa, aa, d);
  float edge = smoothstep(-aa * 2.4, -aa * 1.2, d) * inside;
  vec3 col = uPaper;
  float alpha = inside;

  if (uMode == 0) {
    col = uPaperLo;
    col = mix(col, uInk, gridLine(p, 0.2) * 0.10 + gridLine(p, 1.0) * 0.20);
  } else if (uMode == 1) {
    col = texture2D(uMap, vUv).rgb;
  } else if (uMode == 2) {
    float fromTop = uSize.y * 0.5 - p.y;
    if (fromTop < uBar) {
      for (int k = 0; k < 3; k++) {
        vec2 c = vec2(-uSize.x * 0.5 + 0.13 + float(k) * 0.085, uSize.y * 0.5 - uBar * 0.5);
        float ring = 1.0 - smoothstep(0.0, aa * 1.4, abs(length(p - c) - 0.024));
        col = mix(col, uInk, ring * 0.75);
      }
    } else {
      vec2 tuv = vec2(vUv.x, (p.y + uSize.y * 0.5) / (uSize.y - uBar));
      col = texture2D(uMap, tuv).rgb;
    }
    col = mix(col, uInk, 1.0 - smoothstep(0.0, aa * 1.4, abs(fromTop - uBar)));
    if (uScan > -0.5) {
      float sx = (uScan - 0.5) * uSize.x * 1.5;
      float trail = smoothstep(0.7, 0.0, sx - p.x) * step(p.x, sx);
      col = mix(col, uSignal, trail * 0.14);
      col = mix(col, uSignal, 1.0 - smoothstep(0.0, aa * 1.6, abs(p.x - sx)));
    }
  } else if (uMode == 3) {
    float dash = step(0.5, fract((p.x - p.y) / 0.09));
    col = mix(uPaper, uSignal, edge);
    alpha = inside * 0.09 + edge * dash;
    edge = 0.0;
  }

  col = mix(col, uInk, edge);
  gl_FragColor = vec4(col, alpha * uOpacity);
  #include <colorspace_fragment>
}`

const C = {
  paper: new THREE.Color('#f8f5ee'),
  paperLo: new THREE.Color('#e7e1d3'),
  ink: new THREE.Color('#15140f'),
  signal: new THREE.Color('#e8431c'),
}

function plateMaterial(mode: number, size: [number, number], plate: [number, number], extra: Record<string, unknown> = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    uniforms: {
      uMode: { value: mode },
      uSize: { value: new THREE.Vector2(...size) },
      uPlate: { value: new THREE.Vector2(...plate) },
      uRadius: { value: 0.06 },
      uOpacity: { value: 1 },
      uBar: { value: 0 },
      uScan: { value: -1 },
      uBlur: { value: 0.1 },
      uPaper: { value: C.paper },
      uPaperLo: { value: C.paperLo },
      uInk: { value: C.ink },
      uSignal: { value: C.signal },
      uMap: { value: null },
      ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, { value: v }])),
    },
  })
}

export interface ExplodedSceneProps {
  product: Product
  surface: Surface
  /** 0 = stacked, 1 = fully exploded. */
  explode: number | MotionValue<number>
  /** 0 = axonometric, 1 = facing the viewer. */
  flatten?: number | MotionValue<number>
  pins?: Pin[]
  activePin?: number | null
  /** Layer index to isolate; others fade back. */
  isolate?: number | null
  narrow?: boolean
  still?: boolean
  running?: boolean
  showLabels?: boolean
}

const read = (v: number | MotionValue<number> | undefined, fallback = 0) =>
  v === undefined ? fallback : typeof v === 'number' ? v : v.get()

const BAR = 0.13
/** Pin drop-line: unit length along −Z, scaled each frame to the layer gap. */
const DROP_GEO = new THREE.BoxGeometry(0.008, 0.008, 1).translate(0, 0, -0.5)
const SHADOW_PAD = 0.9

function Stack({ product, surface, explode, flatten, pins = [], activePin, isolate = null, narrow, still, showLabels = true, portal }: ExplodedSceneProps & { portal: RefObject<HTMLDivElement> }) {
  const W = surface === 'desktop' ? 3.2 : 0.96
  const H = surface === 'desktop' ? 2.0 : 2.064
  const tone = useMemo(() => paperTone(product), [product])
  const source = useMemo(() => textureSource(product, surface, tone), [product, surface, tone])
  const [capture, structure] = useTexture([source.src, structureDataUrl(surface)])
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    for (const t of [capture, structure]) {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
      t.needsUpdate = true
    }
  }, [capture, structure, gl])

  const mats = useMemo(() => {
    const plate: [number, number] = [W, H]
    const face: [number, number] = [W, H + BAR]
    const big: [number, number] = [W + SHADOW_PAD * 2, H + BAR + SHADOW_PAD * 2]
    return {
      layers: [
        plateMaterial(0, plate, plate),
        plateMaterial(1, plate, plate, { uMap: structure }),
        plateMaterial(2, face, face, { uMap: capture, uBar: BAR }),
        plateMaterial(3, face, face),
      ],
      shadows: [0, 1, 2, 3].map(() => plateMaterial(4, big, face, { uOpacity: 0.14 })),
    }
  }, [W, H, capture, structure])
  useEffect(() => () => [...mats.layers, ...mats.shadows].forEach((m) => m.dispose()), [mats])

  const group = useRef<THREE.Group>(null!)
  const layerRefs = useRef<(THREE.Group | null)[]>([])
  const shadowRefs = useRef<(THREE.Mesh | null)[]>([])
  const dropRefs = useRef<(THREE.Mesh | null)[]>([])
  const cur = useRef({ e: read(explode, 1), f: read(flatten), px: 0, py: 0, op: [1, 1, 1, 1] })

  const { size, camera } = useThree()
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera
    const needW = surface === 'desktop' ? (narrow ? 6.1 : 6.5) : narrow ? 3.6 : 4.4
    const needH = surface === 'desktop' ? 4.5 : 5.2
    cam.zoom = Math.min(size.width / needW, size.height / needH)
    cam.updateProjectionMatrix()
  }, [size, camera, surface, narrow])

  useFrame((state, dt) => {
    const c = cur.current
    const k = still ? 1000 : 6
    c.e = THREE.MathUtils.damp(c.e, read(explode, 1), k, dt)
    c.f = THREE.MathUtils.damp(c.f, read(flatten), k, dt)
    c.px = THREE.MathUtils.damp(c.px, still ? 0 : state.pointer.x, 3, dt)
    c.py = THREE.MathUtils.damp(c.py, still ? 0 : state.pointer.y, 3, dt)

    const gap = THREE.MathUtils.lerp(0.012, surface === 'desktop' ? 0.78 : 0.66, c.e) * (1 - c.f * 0.9)
    const tilt = THREE.MathUtils.lerp(-1.0, 0, c.f)
    const yaw = THREE.MathUtils.lerp(0.5, 0, c.f)
    group.current.rotation.set(tilt + c.py * 0.07, c.px * 0.05 * c.f, yaw + c.px * 0.09 * (1 - c.f))
    // facing the viewer the stack is a single window, so it can sit larger and centred
    group.current.scale.setScalar((surface === 'mobile' ? 1.25 : 1) * (1 + c.f * (surface === 'mobile' ? 0.25 : 0.5)))
    group.current.position.x = baseX * (1 - c.f)

    for (let i = 0; i < 4; i++) {
      const z = (i - 1.5) * gap
      const layer = layerRefs.current[i]
      if (layer) layer.position.z = z
      const target = isolate === null || isolate === i ? 1 : 0.12
      c.op[i] = THREE.MathUtils.damp(c.op[i], target, still ? 1000 : 8, dt)
      mats.layers[i].uniforms.uOpacity.value = i === 3 ? c.op[i] * THREE.MathUtils.smoothstep(c.e, 0.05, 0.4) : c.op[i]
      const shadow = shadowRefs.current[i]
      if (shadow) {
        // each plate drops its shadow onto whatever is below it
        const below = i === 0 ? z - 0.34 - gap * 0.3 : z - gap + 0.002
        shadow.position.set(-0.07 * gap * 2, -0.09 * gap * 2 - (i === 0 ? 0.1 : 0), below)
        const m = mats.shadows[i].uniforms
        m.uBlur.value = i === 0 ? 0.42 : 0.03 + gap * 0.24
        m.uOpacity.value = (i === 0 ? 0.13 : 0.15) * Math.min(1, gap * 6) * c.op[i] * (i === 3 ? 0.35 : 1)
      }
    }
    for (const d of dropRefs.current) if (d) d.scale.z = Math.max(gap, 0.001)
    mats.layers[2].uniforms.uScan.value = still ? -1 : (state.clock.elapsedTime * 0.09) % 1
  })

  const baseX = showLabels ? (narrow ? -0.8 : -0.85) : 0
  const facing = read(flatten) > 0.5
  const pinPos = (p: Pin): [number, number, number] => [(p.x - 0.5) * W, (0.5 - p.y) * H - BAR / 2, 0]

  return (
    <group ref={group} position={[baseX, surface === 'desktop' ? -0.1 : 0, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`s${i}`} ref={(m) => void (shadowRefs.current[i] = m)} renderOrder={i * 2} material={mats.shadows[i]}>
          <planeGeometry args={[W + SHADOW_PAD * 2, H + BAR + SHADOW_PAD * 2]} />
        </mesh>
      ))}
      {LAYERS.map((layer, i) => (
        <group key={layer.id} ref={(g) => void (layerRefs.current[i] = g)}>
          <mesh renderOrder={i * 2 + 1} material={mats.layers[i]} position={[0, i < 2 ? -BAR / 2 : 0, 0]}>
            <planeGeometry args={i < 2 ? [W, H] : [W, H + BAR]} />
          </mesh>
          {showLabels && (
            <Html portal={portal as RefObject<HTMLElement>} position={[W / 2, -(H + BAR) / 2 + 0.16, 0]} zIndexRange={[4, 0]} style={{ opacity: facing ? 0 : isolate === null || isolate === i ? 1 : 0.25, transition: 'opacity .3s' }}>
              <div className="sp-ex-label">
                <b>{layer.id}</b> {layer.name}
                {!narrow && <span>— {layer.note}</span>}
              </div>
            </Html>
          )}
          {i === 3 &&
            pins.map((p, n) => (
              <group key={n} position={pinPos(p)}>
                <mesh ref={(m) => void (dropRefs.current[n] = m)} renderOrder={9} geometry={DROP_GEO}>
                  <meshBasicMaterial color="#e8431c" transparent opacity={0.9} depthTest={false} toneMapped={false} />
                </mesh>
                <Html portal={portal as RefObject<HTMLElement>} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
                  <span className="sp-ex-pin" style={{ translate: 'none', scale: activePin === n ? '1.3' : '1', transition: 'scale .25s' }}>
                    {n + 1}
                  </span>
                </Html>
              </group>
            ))}
        </group>
      ))}
    </group>
  )
}

export default function ExplodedScene(props: ExplodedSceneProps) {
  // Labels mount into one fixed layer. Without it drei re-creates each label's root when its
  // default mount target changes, which throws on unmount.
  const labels = useRef<HTMLDivElement>(null!)
  return (
    <>
      <Canvas
        orthographic
        flat
        dpr={props.narrow ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 20], near: 0.1, far: 60, zoom: 120 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        frameloop={props.running === false ? 'never' : 'always'}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <Stack {...props} portal={labels} />
        </Suspense>
      </Canvas>
      <div ref={labels} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
    </>
  )
}
