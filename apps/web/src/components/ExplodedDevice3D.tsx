import React, { useEffect, useMemo, useRef, useState } from 'react'

/* ==========================================================================
   EXPLODED DEVICE 3D ENGINE — Pure CSS 3D (preserve-3d), zero external assets
   - Thiết bị tự lắp ráp (assemble) mỗi lần đổi slide
   - Rê chuột / chạm => tách lớp linh kiện (exploded view) + nhãn chú thích
   ========================================================================== */

export type DeviceKind = 'macbook' | 'phone' | 'gaming' | 'keyboard'

interface View { rx: number; ry: number; rz: number; s: number }

interface LayerDef {
  id: string
  name: string
  spec: string
  w: number
  h: number
  x?: number
  y?: number
  idleZ: number
  explodedZ: number
  side: 'left' | 'right'
  cls: string
  color: string
  content?: React.ReactNode
  idleTransform?: string
  explodedTransform?: string
  origin?: string
}

interface DeviceDef {
  kind: DeviceKind
  title: string
  idleView: View
  explodedView: View
  layers: LayerDef[]
}

const keys = (n: number, cls = 'xd-key', offset = 0) =>
  Array.from({ length: n }, (_, i) => <i key={i + offset} className={cls} />)

/** Bàn phím 15 cột: 4 hàng đủ + hàng cuối có phím Space dài */
const keyboardGrid = (cls: string) => (
  <>
    {keys(60, cls)}
    {keys(4, cls, 100)}
    <i className={`${cls} space`} />
    {keys(5, cls, 200)}
  </>
)

const nowClock = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function buildLaptop(kind: 'macbook' | 'gaming'): DeviceDef {
  const g = kind === 'gaming'
  const W = 264
  const H = 172
  return {
    kind,
    title: g ? 'ROG Strix SCAR 16' : 'MacBook Pro M3 Max',
    idleView: { rx: 62, ry: 0, rz: -26, s: 0.94 },
    explodedView: { rx: 57, ry: 0, rz: -36, s: 0.8 },
    layers: [
      {
        id: 'bottom', name: g ? 'Vỏ đáy hợp kim + LED Aura' : 'Vỏ nhôm nguyên khối',
        spec: g ? 'Dải LED RGB 360° • Khe hút gió kép' : 'Nhôm tái chế 100% • Space Black',
        w: W, h: H, idleZ: 0, explodedZ: -125, side: 'left', cls: 'xd-lap-bottom', color: '#94a3b8',
        content: (
          <div className="xd-body">
            <div className="xd-vents" />
            <i className="xd-foot f1" /><i className="xd-foot f2" /><i className="xd-foot f3" /><i className="xd-foot f4" />
            {g && <div className="xd-rgb-strip" />}
          </div>
        )
      },
      {
        id: 'battery', name: g ? 'Pin Li-Po 90Wh' : 'Pin Li-Po 72.4Wh',
        spec: g ? 'Sạc nhanh 100W USB-C PD' : '22 giờ xem video • MagSafe 3',
        w: 232, h: 84, y: 34, idleZ: 3, explodedZ: -75, side: 'right', cls: 'xd-lap-battery', color: '#22c55e',
        content: (
          <div className="xd-body">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="xd-cell"><span>{g ? '15Wh' : '12Wh'}</span><b /></div>
            ))}
          </div>
        )
      },
      {
        id: 'board', name: g ? 'Mainboard i9-14900HX + RTX 4080' : 'Mainboard + Chip M3 Max',
        spec: g ? '24 nhân CPU • GPU 175W TGP' : '16 nhân CPU • 40 nhân GPU • 36GB RAM',
        w: 214, h: 64, y: -44, idleZ: 5, explodedZ: -25, side: 'left', cls: 'xd-lap-board', color: '#06b6d4',
        content: (
          <div className="xd-body xd-pcb-pattern">
            {g ? (
              <>
                <div className="xd-soc cpu"><b>i9</b><span>14900HX</span></div>
                <div className="xd-soc gpu"><b>RTX</b><span>4080</span></div>
              </>
            ) : (
              <div className="xd-soc"><b>M3</b><span>MAX</span></div>
            )}
            <i className="xd-ram r1" /><i className="xd-ram r2" /><i className="xd-ram r3" /><i className="xd-ram r4" />
            <i className="xd-trace t1" /><i className="xd-trace t2" />
          </div>
        )
      },
      {
        id: 'cooling', name: g ? 'Tản nhiệt kim loại lỏng' : 'Tản nhiệt quạt kép',
        spec: g ? '3 quạt Arc Flow 84 cánh • Buồng hơi' : 'Ống đồng • Quạt êm 0dB khi tải nhẹ',
        w: 236, h: 70, y: -44, idleZ: 7, explodedZ: 25, side: 'right', cls: 'xd-lap-cooling', color: '#f97316',
        content: (
          <div className="xd-body">
            <div className="xd-fan"><div className="xd-fan-blades" /></div>
            <div className="xd-heatpipe" />
            {g && <div className="xd-fan small"><div className="xd-fan-blades" /></div>}
            <div className="xd-fan"><div className="xd-fan-blades reverse" /></div>
          </div>
        )
      },
      {
        id: 'topcase', name: g ? 'Bàn phím RGB Per-Key' : 'Magic Keyboard + Trackpad',
        spec: g ? 'Hành trình 2mm • N-Key Rollover' : 'Touch ID • Force Touch Trackpad',
        w: W, h: H, idleZ: 10, explodedZ: 75, side: 'left', cls: 'xd-lap-topcase', color: g ? '#ec4899' : '#a78bfa',
        content: (
          <div className="xd-body">
            <div className={`xd-keys-grid ${g ? 'rgb' : ''}`}>{keyboardGrid('xd-key')}</div>
            <div className="xd-trackpad" />
          </div>
        )
      },
      {
        id: 'lid', name: g ? 'Màn hình Nebula Mini-LED 240Hz' : 'Liquid Retina XDR 14.2"',
        spec: g ? 'QHD+ 16" • 1100 nits • 3ms' : 'Mini-LED • 1600 nits HDR • 120Hz',
        w: W, h: 168, idleZ: 12, explodedZ: 150, side: 'right', cls: 'xd-lap-lid', color: '#3b82f6',
        origin: '50% 100%',
        idleTransform: `translate3d(0px, -170px, 12px) rotateX(-76deg)`,
        explodedTransform: `translate3d(0px, 0px, 150px) rotateX(0deg)`,
        content: (
          <div className="xd-body">
            <div className={`xd-screen ${g ? 'gaming' : 'mac'}`}>
              {!g && <i className="xd-notch" />}
              <div className="xd-screen-ui">
                <strong>{g ? 'ROG' : 'STOREZ'}</strong>
                <span>{g ? '240 FPS • ULTRA' : 'Liquid Retina XDR'}</span>
              </div>
              <div className="xd-screen-bars">
                <i /><i /><i /><i /><i />
              </div>
            </div>
          </div>
        )
      }
    ]
  }
}

function buildPhone(): DeviceDef {
  const W = 140
  const H = 288
  const s = 46
  return {
    kind: 'phone',
    title: 'iPhone 15 Pro Max',
    idleView: { rx: 6, ry: -22, rz: 4, s: 1.02 },
    explodedView: { rx: 58, ry: 0, rz: -32, s: 0.8 },
    layers: [
      {
        id: 'back', name: 'Mặt lưng kính nhám', spec: 'Kính pha màu • Titan Tự Nhiên',
        w: W, h: H, idleZ: 0, explodedZ: -3 * s, side: 'left', cls: 'xd-ph-back', color: '#cbd5e1',
        content: (
          <div className="xd-body">
            <div className="xd-cam-bump"><i /><i /><i /><b /></div>
            <span className="xd-back-logo">Z</span>
          </div>
        )
      },
      {
        id: 'battery', name: 'Pin Li-ion 4.441 mAh', spec: 'Sạc nhanh 27W • MagSafe 15W',
        w: 110, h: 168, y: 46, idleZ: 2, explodedZ: -2 * s, side: 'right', cls: 'xd-ph-battery', color: '#22c55e',
        content: (
          <div className="xd-body">
            <span className="xd-bolt">⚡</span>
            <em>Li-ion<br />4441 mAh</em>
            <div className="xd-charge"><b /></div>
          </div>
        )
      },
      {
        id: 'board', name: 'Bo mạch logic + Chip A17 Pro', spec: 'Tiến trình 3nm • 6 nhân GPU',
        w: 118, h: 96, y: -80, idleZ: 4, explodedZ: -1 * s, side: 'left', cls: 'xd-ph-board', color: '#06b6d4',
        content: (
          <div className="xd-body xd-pcb-pattern">
            <div className="xd-soc phone"><b>A17</b><span>PRO</span></div>
            <i className="xd-ram r1" /><i className="xd-ram r2" />
            <i className="xd-trace t1" />
          </div>
        )
      },
      {
        id: 'camera', name: 'Cụm camera 48MP Pro', spec: 'Telephoto 5x • LiDAR • OIS',
        w: 58, h: 58, x: -30, y: -104, idleZ: 5, explodedZ: 0, side: 'right', cls: 'xd-ph-camera', color: '#f59e0b',
        content: (
          <div className="xd-body">
            <i /><i /><i />
          </div>
        )
      },
      {
        id: 'frame', name: 'Khung viền Titanium cấp 5', spec: 'Nhẹ hơn 19g • Chuẩn hàng không',
        w: W, h: H, idleZ: 7, explodedZ: 1 * s, side: 'left', cls: 'xd-ph-frame', color: '#d6d3d1',
        content: <div className="xd-body"><i className="xd-btn-action" /><i className="xd-btn-power" /></div>
      },
      {
        id: 'display', name: 'Màn hình Super Retina XDR', spec: '6.7" OLED • 120Hz • 2000 nits',
        w: 130, h: 278, idleZ: 9, explodedZ: 2 * s, side: 'right', cls: 'xd-ph-display', color: '#8b5cf6',
        content: (
          <div className="xd-body">
            <div className="xd-screen phone">
              <i className="xd-island" />
              <div className="xd-ph-clock">{nowClock()}</div>
              <div className="xd-ph-date">STOREZ PRO</div>
              <div className="xd-app-grid">
                {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ['--h' as string]: `${i * 30}deg` }} />)}
              </div>
              <div className="xd-dock"><i /><i /><i /><i /></div>
            </div>
          </div>
        )
      },
      {
        id: 'glass', name: 'Kính Ceramic Shield', spec: 'Cứng gấp 4 lần • Chống lóa',
        w: W, h: H, idleZ: 11, explodedZ: 3 * s, side: 'left', cls: 'xd-ph-glass', color: '#38bdf8',
        content: <div className="xd-body"><div className="xd-glare" /></div>
      }
    ]
  }
}

function buildKeyboard(): DeviceDef {
  const W = 304
  const H = 124
  const s = 48
  return {
    kind: 'keyboard',
    title: 'NuPhy Air75 V2',
    idleView: { rx: 56, ry: 0, rz: -18, s: 1 },
    explodedView: { rx: 57, ry: 0, rz: -30, s: 0.9 },
    layers: [
      {
        id: 'case', name: 'Vỏ nhôm CNC Anodized', spec: 'Gia công nguyên khối • 2 góc gõ',
        w: W, h: H, idleZ: 0, explodedZ: -2.5 * s, side: 'left', cls: 'xd-kb-case', color: '#cbd5e1',
        content: <div className="xd-body"><div className="xd-underglow" /></div>
      },
      {
        id: 'foam', name: 'Foam tiêu âm Poron', spec: 'Giảm cộng hưởng • Âm thock trầm',
        w: 288, h: 108, idleZ: 3, explodedZ: -1.5 * s, side: 'right', cls: 'xd-kb-foam', color: '#f472b6',
        content: <div className="xd-body" />
      },
      {
        id: 'pcb', name: 'PCB Hot-swap + Chip 8KHz', spec: 'QMK/VIA • Tri-mode BT/2.4G/USB',
        w: 288, h: 108, idleZ: 5, explodedZ: -0.5 * s, side: 'left', cls: 'xd-kb-pcb', color: '#06b6d4',
        content: (
          <div className="xd-body xd-pcb-pattern">
            <div className="xd-soc kb"><b>MCU</b><span>8KHz</span></div>
            <div className="xd-sockets">{keys(45, 'xd-socket')}</div>
          </div>
        )
      },
      {
        id: 'plate', name: 'Plate thép mạ kẽm', spec: 'Gasket mount • Độ nảy êm',
        w: 288, h: 108, idleZ: 7, explodedZ: 0.5 * s, side: 'right', cls: 'xd-kb-plate', color: '#94a3b8',
        content: <div className="xd-body"><div className="xd-keys-grid plate">{keyboardGrid('xd-hole')}</div></div>
      },
      {
        id: 'switch', name: 'Switch Gateron Low-Profile 2.0', spec: 'Lực nhấn 45gf • 70 triệu lần',
        w: 280, h: 100, idleZ: 9, explodedZ: 1.5 * s, side: 'left', cls: 'xd-kb-switch', color: '#ef4444',
        content: <div className="xd-body"><div className="xd-keys-grid switches">{keyboardGrid('xd-sw')}</div></div>
      },
      {
        id: 'caps', name: 'Keycap PBT Double-shot', spec: 'Profile nSA • Chống bóng dầu',
        w: 292, h: 112, idleZ: 12, explodedZ: 2.5 * s, side: 'right', cls: 'xd-kb-caps', color: '#f59e0b',
        content: <div className="xd-body"><div className="xd-keys-grid caps">{keyboardGrid('xd-cap')}</div></div>
      }
    ]
  }
}

const DEVICE_BUILDERS: Record<DeviceKind, () => DeviceDef> = {
  macbook: () => buildLaptop('macbook'),
  gaming: () => buildLaptop('gaming'),
  phone: buildPhone,
  keyboard: buildKeyboard
}

interface ExplodedDevice3DProps {
  kind: DeviceKind
  onExplodeChange?: (exploded: boolean) => void
  onOpenDetail?: () => void
}

export const ExplodedDevice3D: React.FC<ExplodedDevice3DProps> = ({ kind, onExplodeChange, onOpenDetail }) => {
  const def = useMemo(() => DEVICE_BUILDERS[kind](), [kind])
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [assembledKind, setAssembledKind] = useState<DeviceKind | null>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const sceneRef = useRef<HTMLDivElement>(null)

  // Hiệu ứng tự lắp ráp mỗi lần đổi thiết bị (mount ở trạng thái tách lớp -> ráp lại)
  useEffect(() => {
    const t = window.setTimeout(() => setAssembledKind(kind), 160)
    return () => window.clearTimeout(t)
  }, [kind])
  const assembled = assembledKind === kind

  const userExploded = hover || pinned
  const exploded = userExploded || !assembled

  useEffect(() => {
    onExplodeChange?.(userExploded)
  }, [userExploded, onExplodeChange])

  const view = exploded ? def.explodedView : def.idleView
  const ev = def.explodedView
  const billboard = `rotateZ(${-ev.rz}deg) rotateY(${-ev.ry}deg) rotateX(${-ev.rx}deg)`
  const n = def.layers.length

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !sceneRef.current) return
    const r = sceneRef.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: -py * 12, y: px * 16 })
  }

  return (
    <div
      ref={sceneRef}
      className={`xd-scene ${exploded ? 'is-exploded' : ''} ${userExploded ? 'is-xray' : ''} kind-${kind}`}
      onPointerEnter={e => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={e => {
        if (e.pointerType !== 'mouse') return
        setHover(false)
        setTilt({ x: 0, y: 0 })
      }}
      onPointerMove={handleMove}
      onClick={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
          setPinned(p => !p)
        } else {
          onOpenDetail?.()
        }
      }}
      role="img"
      aria-label={`Mô hình 3D ${def.title} — rê chuột để tách lớp linh kiện`}
    >
      <div className="xd-scanline" />
      <div className="xd-grid-floor" />

      <div className="xd-perspective" key={kind}>
        <div className="xd-floor-shadow" />
        <div
          className="xd-float"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          <div className="xd-bob">
            <div
              className={`xd-device device-${kind}`}
              style={{
                transform: `rotateX(${view.rx}deg) rotateY(${view.ry}deg) rotateZ(${view.rz}deg) scale3d(${view.s}, ${view.s}, ${view.s})`
              }}
            >
              {def.layers.map((l, i) => {
                const transform = exploded
                  ? l.explodedTransform ?? `translate3d(${l.x || 0}px, ${l.y || 0}px, ${l.explodedZ}px) rotateX(0deg)`
                  : l.idleTransform ?? `translate3d(${l.x || 0}px, ${l.y || 0}px, ${l.idleZ}px) rotateX(0deg)`
                const delay = exploded ? i * 55 : (n - 1 - i) * 45
                return (
                  <div
                    key={l.id}
                    className={`xd-layer ${l.cls}`}
                    style={{
                      width: l.w,
                      height: l.h,
                      left: -l.w / 2,
                      top: -l.h / 2,
                      transform,
                      transformOrigin: l.origin,
                      transitionDelay: `${delay}ms`,
                      ['--accent' as string]: l.color
                    }}
                  >
                    {l.content}
                    <div className={`xd-label-anchor ${l.side}`} style={{ transform: billboard }}>
                      <div
                        className="xd-label"
                        style={{ transitionDelay: userExploded ? `${380 + i * 80}ms` : '0ms' }}
                      >
                        <span className="xd-label-idx">{String(i + 1).padStart(2, '0')}</span>
                        <div className="xd-label-text">
                          <strong>{l.name}</strong>
                          <em>{l.spec}</em>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={`xd-hint ${userExploded ? 'on' : ''}`}>
        <span className="xd-hud-dot" />
        {userExploded ? (
          <span><b>X-RAY</b> • {n} linh kiện • {def.title}</span>
        ) : (
          <span><b className="xd-hint-mouse" /> Rê chuột vào thiết bị để tách linh kiện</span>
        )}
      </div>
    </div>
  )
}
