import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Product, Surface } from '../../data/products'
import { textureSource } from '../../media/manifest'
import { dprRange } from '../../shared/env'
import {
  dustLineFrag,
  dustPointFrag,
  dustVert,
  floorFrag,
  floorVert,
  paneFrag,
  paneVert,
  ringFrag,
  ringVert,
  routeFrag,
  routeVert,
} from './shaders'
import { COUNT, flight, FLOOR_Y, lateral, SPACING, STANDOFF, stations, type PaneSpec, type Station } from './stations'

/** One colour shared by every material — lerped toward the nearest station's hue each frame. */
const hueUniform = { value: new THREE.Color(stations[0].hue) }
const timeUniform = { value: 0 }
const stationHues = stations.map((s) => new THREE.Color(s.hue))
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const stationZ = (i: number) => -i * SPACING - STANDOFF

/**
 * R3F copies a <shaderMaterial uniforms> prop into its own wrappers, so values
 * written to our objects later never reach the GPU. Building the material here
 * keeps these uniform objects authoritative (and lets several materials share one).
 */
function useShader(
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
  opts: Partial<THREE.ShaderMaterialParameters> = {},
) {
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, ...opts }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vertexShader, fragmentShader, uniforms],
  )
  useEffect(() => () => material.dispose(), [material])
  return material
}

/* ————— capture textures ————— */

const TEX: Record<Surface, [number, number]> = { desktop: [1440, 900], mobile: [600, 1290] }

/**
 * Loads a capture (or the stamped placeholder) into a canvas texture. The SVG
 * placeholder is rasterised at an explicit size so it stays crisp, and gets an
 * extra large PLACEHOLDER tag so the label survives distance and perspective.
 */
function useCapture(product: Product, surface: Surface, slot: number, enabled: boolean, narrow: boolean) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!enabled) return
    let dead = false
    let made: THREE.Texture | null = null
    const accent = product.hue.bright
    const { src, placeholder } = textureSource(
      product,
      surface,
      { paper: '#0c0e11', ink: '#e9ebe4', line: 'rgba(233,235,228,.28)', accent },
      { index: slot },
    )
    const [bw, bh] = TEX[surface]
    const k = narrow ? 0.6 : 1
    const w = Math.round(bw * k)
    const h = Math.round(bh * k)
    let url = src
    if (src.startsWith('data:image/svg+xml')) {
      // intrinsic size is required for reliable canvas rasterisation
      const svg = decodeURIComponent(src.slice(src.indexOf(',') + 1))
      const sized = /<svg[^>]*\swidth=/.test(svg) ? svg : svg.replace('<svg ', `<svg width="${w}" height="${h}" `)
      url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`
    }
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (dead) return
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d')!
      g.fillStyle = '#0c0e11'
      g.fillRect(0, 0, w, h)
      // cover-fit, anchored to the top like a screenshot
      const s = Math.max(w / img.width, h / img.height)
      g.drawImage(img, (w - img.width * s) / 2, 0, img.width * s, img.height * s)
      if (placeholder) {
        const u = w / (surface === 'desktop' ? 1440 : 600)
        const fs = (surface === 'desktop' ? 30 : 26) * u
        g.font = `700 ${fs}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
        const label = 'PLACEHOLDER'
        const tw = g.measureText(label).width + fs * 1.4
        const x = w - tw - fs * 1.5
        const y = surface === 'desktop' ? fs * 2.6 : fs * 4.6
        g.fillStyle = '#0c0e11'
        g.fillRect(x, y, tw, fs * 2)
        g.strokeStyle = accent
        g.lineWidth = Math.max(2, 3 * u)
        g.strokeRect(x, y, tw, fs * 2)
        g.fillStyle = accent
        g.textBaseline = 'middle'
        g.fillText(label, x + fs * 0.7, y + fs * 1.05)
      }
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.NoColorSpace
      t.anisotropy = narrow ? 2 : 8
      t.generateMipmaps = true
      t.minFilter = THREE.LinearMipmapLinearFilter
      made = t
      setTex(t)
    }
    img.src = url
    return () => {
      dead = true
      made?.dispose()
    }
  }, [product, surface, slot, enabled, narrow])
  return tex
}

const STACKED_FOV = 64
const WIDE_FOV = 47

/* ————— application window / handset ————— */

const GLOW_PAD = 1.1
const blank = new THREE.DataTexture(new Uint8Array([12, 14, 17, 255]), 1, 1)
blank.needsUpdate = true

function Pane({ spec, station, index, mirror, z }: { spec: PaneSpec; station: Station; index: number; mirror: number; z: number }) {
  const narrow = useThree((s) => s.size.width < 768)
  const mesh = useRef<THREE.Mesh>(null)
  const mode = spec.mode ?? 'full'
  const phone = spec.surface === 'mobile'
  // capture textures are only fetched once the camera is within two stations
  const [near, setNear] = useState(false)
  const tex = useCapture(station.product!, spec.surface, Math.max(1, spec.slot), near && mode !== 'ghost', narrow)

  const dims = useMemo(() => {
    const w = spec.w
    if (phone) {
      const bz = w * 0.045
      return { w, h: (w - bz * 2) * 2.15 + bz * 2, bar: 0, radius: w * 0.17 }
    }
    const bar = Math.min(0.26, w * 0.055)
    return { w, h: w / 1.6 + bar, bar, radius: 0.05 + w * 0.012 }
  }, [spec.w, phone])

  const uniforms = useMemo(
    () => ({
      uMap: { value: blank as THREE.Texture },
      uHasMap: { value: 0 },
      uSize: { value: new THREE.Vector2(dims.w, dims.h) },
      uPlane: { value: new THREE.Vector2(dims.w + GLOW_PAD * 2, dims.h + GLOW_PAD * 2) },
      uRadius: { value: dims.radius },
      uBar: { value: dims.bar },
      uPhone: { value: phone ? 1 : 0 },
      uMode: { value: mode === 'ghost' ? 1 : mode === 'restricted' ? 2 : 0 },
      uReveal: { value: 0 },
      uTime: timeUniform,
      uHue: { value: new THREE.Color(station.hue) },
    }),
    [dims, phone, mode, station.hue],
  )

  const material = useShader(paneVert, paneFrag, uniforms)

  useEffect(() => {
    uniforms.uMap.value = tex ?? blank
    uniforms.uHasMap.value = tex ? 1 : 0
  }, [tex, uniforms])

  const phase = useMemo(() => index * 1.7 + spec.pos[0], [index, spec.pos])
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, clock }) => {
    const m = mesh.current
    if (!m) return
    m.getWorldPosition(world)
    const dist = camera.position.z - world.z
    const isNear = dist < SPACING * 2.2 && dist > -6
    if (isNear !== near) setNear(isNear)
    m.visible = dist > -1 && dist < SPACING * 3.4
    if (!m.visible) return
    // far → wireframe; approaching → the scan rises; at the station → fully materialised
    // measured from the station, so every pane has landed by the time you arrive
    const r = smooth(27, 11.5, camera.position.z - z + (spec.delay ?? 0) * 6)
    uniforms.uReveal.value = mode === 'restricted' ? Math.min(r, 0.86) : r
    m.position.y = spec.pos[1] + Math.sin(clock.elapsedTime * 0.5 + phase) * 0.045
  })

  const rot = spec.rot ?? [0, 0, 0]
  return (
    <mesh ref={mesh} position={[mirror * spec.pos[0], spec.pos[1], spec.pos[2]]} rotation={[rot[0], mirror * rot[1], mirror * rot[2]]} renderOrder={10}>
      <planeGeometry args={[dims.w + GLOW_PAD * 2, dims.h + GLOW_PAD * 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function ContainmentRing({ station }: { station: Station }) {
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({ uHue: { value: new THREE.Color(station.hue) }, uTime: timeUniform, uReveal: { value: 0 } }),
    [station.hue],
  )
  const material = useShader(ringVert, ringFrag, uniforms, { blending: THREE.AdditiveBlending })
  const world = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    const m = mesh.current
    if (!m) return
    m.getWorldPosition(world)
    const dist = camera.position.z - world.z
    m.visible = dist > -1 && dist < SPACING * 3
    uniforms.uReveal.value = 0.35 + 0.65 * smooth(30, 12, dist)
  })
  return (
    <mesh ref={mesh} position={[0, 0.1, -0.35]} renderOrder={9}>
      <planeGeometry args={[6.4, 6.4]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/** Floor marker + stem tying a station's windows back to the Zaylo line. */
function Anchor({ station, x, z }: { station: Station; x: number; z: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1.25, 0], 3))
    return g
  }, [])
  return (
    <group position={[x, FLOOR_Y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <ringGeometry args={[0.36, 0.4, 48]} />
        <meshBasicMaterial color={station.hue} transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial color={station.hue} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <lineSegments geometry={geo} renderOrder={2}>
        <lineBasicMaterial color={station.hue} transparent opacity={0.5} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

function StationGroup({ station, index, narrow }: { station: Station; index: number; narrow: boolean }) {
  const aspect = useThree((s) => s.size.width / s.size.height)
  const x = station.side * lateral(narrow)
  const z = stationZ(index)
  const mirror = -station.side || 1
  // stacked: size the group to the visible width at the stand-off distance
  const visibleWidth = 2 * Math.tan(THREE.MathUtils.degToRad(STACKED_FOV / 2)) * STANDOFF * aspect
  const scale = narrow ? THREE.MathUtils.clamp(visibleWidth * 0.112, 0.5, 0.9) : 0.92
  return (
    <>
      <group position={[x, narrow ? 2.4 : -0.2, z]} rotation={[0, -station.side * (narrow ? 0.1 : 0.3), 0]} scale={scale}>
        {station.panes.map((spec, i) => (
          <Pane key={i} spec={spec} station={station} index={index + i} mirror={mirror} z={z} />
        ))}
        {station.ring && <ContainmentRing station={station} />}
      </group>
      <Anchor station={station} x={station.side * routeLateral(narrow)} z={z} />
    </>
  )
}

/* ————— the Zaylo line ————— */

const routeLateral = (narrow: boolean) => (narrow ? 1.5 : lateral(narrow))

function buildRoute(narrow: boolean) {
  const R = routeLateral(narrow)
  const y = FLOOR_Y + 0.01
  const nodes: THREE.Vector3[] = [new THREE.Vector3(-R * 0.35, y, -12), new THREE.Vector3(R * 0.95, y, -12)]
  for (let i = 1; i < COUNT - 1; i++) nodes.push(new THREE.Vector3(stations[i].side * R, y, stationZ(i)))
  nodes.push(new THREE.Vector3(0, y, stationZ(COUNT - 1) + 1.5))

  const half = 0.75
  const pos: number[] = []
  const aT: number[] = []
  const aS: number[] = []
  const idx: number[] = []
  const cumulative: number[] = [0]
  let t = 0
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]
    const b = nodes[i + 1]
    const dir = new THREE.Vector3().subVectors(b, a)
    const len = dir.length()
    dir.normalize()
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(half)
    const base = pos.length / 3
    // overshoot slightly so the corners meet cleanly
    const a0 = a.clone().addScaledVector(dir, -0.03)
    const b0 = b.clone().addScaledVector(dir, 0.03)
    for (const [pt, tt] of [
      [a0, t],
      [b0, t + len],
    ] as const) {
      pos.push(pt.x - perp.x, pt.y, pt.z - perp.z, pt.x + perp.x, pt.y, pt.z + perp.z)
      aT.push(tt, tt)
      aS.push(-1, 1)
    }
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    t += len
    cumulative.push(t)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1))
  geo.setAttribute('aS', new THREE.Float32BufferAttribute(aS, 1))
  geo.setIndex(idx)
  // head position (arc length) when the camera is at station k: node k+1
  const heads = stations.map((_, k) => cumulative[Math.min(k + 1, cumulative.length - 1)])
  return { geo, heads }
}

function Route({ narrow }: { narrow: boolean }) {
  const { geo, heads } = useMemo(() => buildRoute(narrow), [narrow])
  const uniforms = useMemo(() => ({ uHue: hueUniform, uHead: { value: 0 }, uTime: timeUniform }), [])
  const material = useShader(routeVert, routeFrag, uniforms, { blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  const intro = useRef(0)
  useFrame((_, dt) => {
    intro.current = Math.min(1, intro.current + dt / 1.8)
    const e = 1 - Math.pow(1 - intro.current, 3)
    const p = Math.min(COUNT - 1, Math.max(0, flight.p))
    const i = Math.min(COUNT - 2, Math.floor(p))
    const f = p - i
    const head = heads[i] + (heads[i + 1] - heads[i]) * f
    uniforms.uHead.value = head * (p < 0.02 ? e : 1)
  })
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <mesh geometry={geo} renderOrder={1} frustumCulled={false}>
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/* ————— floor + depth field ————— */

function Floor() {
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({
      uHue: hueUniform,
      uCam: { value: new THREE.Vector3() },
      uSpacing: { value: SPACING },
      uStandoff: { value: STANDOFF },
      uVel: { value: 0 },
    }),
    [],
  )
  const material = useShader(floorVert, floorFrag, uniforms, { blending: THREE.AdditiveBlending })
  useFrame(({ camera }) => {
    if (!mesh.current) return
    mesh.current.position.set(0, FLOOR_Y, camera.position.z - 70)
    uniforms.uCam.value.copy(camera.position)
    uniforms.uVel.value = flight.vel
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0} frustumCulled={false}>
      <planeGeometry args={[240, 170]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

const DUST_RANGE = 70

function Dust({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const height = useThree((s) => s.size.height)
  const { points, lines } = useMemo(() => {
    const pp: number[] = []
    const ps: number[] = []
    const lp: number[] = []
    const ls: number[] = []
    const le: number[] = []
    let seed = 1337
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
    for (let i = 0; i < count; i++) {
      // keep a clear corridor around the camera path so nothing strikes the lens
      let x = (rnd() - 0.5) * 34
      const y = FLOOR_Y + 0.25 + rnd() * rnd() * 12
      if (Math.abs(x) < 1.1 && y < 1.6) x += x < 0 ? -1.4 : 1.4
      const z = -rnd() * DUST_RANGE
      const s = rnd()
      pp.push(x, y, z)
      ps.push(s)
      lp.push(x, y, z, x, y, z)
      ls.push(s, s)
      le.push(0, 1)
    }
    const points = new THREE.BufferGeometry()
    points.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3))
    points.setAttribute('aSeed', new THREE.Float32BufferAttribute(ps, 1))
    points.setAttribute('aEnd', new THREE.Float32BufferAttribute(new Float32Array(count), 1))
    const lines = new THREE.BufferGeometry()
    lines.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3))
    lines.setAttribute('aSeed', new THREE.Float32BufferAttribute(ls, 1))
    lines.setAttribute('aEnd', new THREE.Float32BufferAttribute(le, 1))
    return { points, lines }
  }, [count])
  useEffect(
    () => () => {
      points.dispose()
      lines.dispose()
    },
    [points, lines],
  )

  const uniforms = useMemo(
    () => ({
      uHue: hueUniform,
      uCamZ: { value: 0 },
      uRange: { value: DUST_RANGE },
      uStreak: { value: 0 },
      uPx: { value: 1 },
      uSize: { value: 0.05 },
    }),
    [],
  )
  const pointMaterial = useShader(dustVert, dustPointFrag, uniforms, { blending: THREE.AdditiveBlending })
  const lineMaterial = useShader(dustVert, dustLineFrag, uniforms, { blending: THREE.AdditiveBlending })
  useFrame(({ camera }) => {
    uniforms.uCamZ.value = camera.position.z
    // stretch with travel speed (stations/second → world units)
    const target = THREE.MathUtils.clamp(flight.vel * 2.6, -7, 7)
    uniforms.uStreak.value += (target - uniforms.uStreak.value) * 0.18
    uniforms.uPx.value = height * dpr
  })
  return (
    <>
      <points geometry={points} frustumCulled={false} renderOrder={3}>
        <primitive object={pointMaterial} attach="material" />
      </points>
      <lineSegments geometry={lines} frustumCulled={false} renderOrder={3}>
        <primitive object={lineMaterial} attach="material" />
      </lineSegments>
    </>
  )
}

/* ————— camera rig ————— */

function Rig({ narrow }: { narrow: boolean }) {
  const look = useMemo(() => new THREE.Vector3(), [])
  const px = useRef(0)
  const py = useRef(0)
  useFrame(({ camera, clock }, dt) => {
    timeUniform.value = clock.elapsedTime
    const cam = camera as THREE.PerspectiveCamera
    const fov = narrow ? STACKED_FOV : WIDE_FOV
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
    const p = Math.min(COUNT - 1, Math.max(0, flight.p))
    const i = Math.min(COUNT - 2, Math.floor(p))
    const f = p - i
    const e = f * f * (3 - 2 * f)

    // hue floods toward the nearest station
    hueUniform.value.copy(stationHues[i]).lerp(stationHues[i + 1], smooth(0.3, 0.7, f))

    const k = 1 - Math.exp(-dt * 4)
    px.current += (flight.pointerX - px.current) * k
    py.current += (flight.pointerY - py.current) * k

    // the camera leans toward each station's windows, so the route reads as a zig-zag
    const sway = narrow ? 0 : 0.55
    const side = stations[i].side + (stations[i + 1].side - stations[i].side) * e
    const z = -p * SPACING
    const baseY = 0.2
    camera.position.set(side * sway + px.current * 0.45, baseY + py.current * 0.22, z)
    // a slight bank while travelling between stations
    const bank = Math.sin(f * Math.PI) * (stations[i + 1].side - stations[i].side) * (narrow ? 0 : 0.035)
    look.set(side * sway * 0.4 + px.current * 1.6, baseY + (narrow ? 0.95 : -0.1) + py.current * 0.7, z - 14)
    camera.up.set(bank, 1, 0).normalize()
    camera.lookAt(look)
  })
  return null
}

/* ————— canvas ————— */

export default function Scene({ narrow, stacked }: { narrow: boolean; stacked: boolean }) {
  // stop rendering entirely while the tab is hidden
  const [visible, setVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const on = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  return (
    <Canvas
      className="zx-canvas"
      frameloop={visible ? 'always' : 'never'}
      dpr={dprRange(narrow)}
      flat
      gl={{ antialias: !narrow, alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: stacked ? STACKED_FOV : WIDE_FOV, near: 0.1, far: 260, position: [0, 0.2, 0] }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Rig narrow={stacked} />
      <Floor />
      <Route narrow={stacked} />
      <Dust count={narrow ? 700 : 1700} />
      {stations.map((s, i) => (s.kind === 'product' ? <StationGroup key={s.id} station={s} index={i} narrow={stacked} /> : null))}
    </Canvas>
  )
}
