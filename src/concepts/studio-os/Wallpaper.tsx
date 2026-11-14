import { useEffect, useRef } from 'react'

/**
 * Wallpaper shader: one full-screen quad, no three.js. A dot grid that swells
 * slowly, bends away from the pointer and carries a ring ripple whenever a
 * window opens or is dropped (`sos:pulse` events). Lazy-loaded; the CSS dot
 * grid underneath is the fallback when WebGL or motion is unavailable.
 */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform vec3 u_pulse;uniform float u_dpr;
void main(){
  vec2 p=vec2(gl_FragCoord.x,u_res.y-gl_FragCoord.y);
  float cell=28.*u_dpr;
  vec2 d=p-u_mouse;float dist=length(d);
  float R=170.*u_dpr;
  float infl=exp(-(dist*dist)/(R*R));
  float pd=length(p-u_pulse.xy);
  float front=u_pulse.z*820.*u_dpr;
  float ring=exp(-pow((pd-front)/(54.*u_dpr),2.))*max(0.,1.-u_pulse.z/1.5);
  float swell=.5+.5*sin(p.x*.0031/u_dpr+p.y*.0047/u_dpr+u_time*.32);
  vec2 dir=dist>.001?d/dist:vec2(0.);
  vec2 pdir=pd>.001?(p-u_pulse.xy)/pd:vec2(0.);
  vec2 q=p-dir*infl*13.*u_dpr-pdir*ring*9.*u_dpr;
  vec2 g=mod(q,cell)-cell*.5;
  float r=(1.05+1.5*infl+1.3*ring+.28*swell)*u_dpr;
  float a=1.-smoothstep(r-.6*u_dpr,r+.6*u_dpr,length(g));
  float alpha=a*(.17+.11*swell+.6*infl+.6*ring);
  vec3 col=mix(vec3(.80,.84,1.),vec3(1.,.847,.29),clamp(infl*.95+ring*.9,0.,1.));
  gl_FragColor=vec4(col*alpha,alpha);
}`

export default function Wallpaper({ dprMax, onReady }: { dprMax: number; onReady: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' })
    if (!gl) return
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const U = (n: string) => gl.getUniformLocation(prog, n)
    const uRes = U('u_res')
    const uTime = U('u_time')
    const uMouse = U('u_mouse')
    const uPulse = U('u_pulse')
    const uDpr = U('u_dpr')

    let dpr = 1
    let rect = canvas.getBoundingClientRect()
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, dprMax)
      rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const target = { x: -9999, y: -9999 }
    const mouse = { x: -9999, y: -9999 }
    const pulse = { x: 0, y: 0, t0: -99 }
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
      if (mouse.x < -999) Object.assign(mouse, target)
    }
    const onLeave = () => {
      target.x = target.y = -9999
    }
    const onPulse = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail
      pulse.x = d.x - rect.left
      pulse.y = d.y - rect.top
      pulse.t0 = performance.now() / 1000
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('sos:pulse', onPulse)

    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (target.x < -999) {
        mouse.x = mouse.y = -9999
      } else {
        mouse.x += (target.x - mouse.x) * 0.14
        mouse.y += (target.y - mouse.y) * 0.14
      }
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform2f(uMouse, mouse.x * dpr, mouse.y * dpr)
      gl.uniform3f(uPulse, pulse.x * dpr, pulse.y * dpr, now / 1000 - pulse.t0)
      gl.uniform1f(uDpr, dpr)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)
    onReady()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('sos:pulse', onPulse)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dprMax])
  return <canvas ref={ref} className="sos-wall-gl" aria-hidden="true" />
}
