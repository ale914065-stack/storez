import React, { useState, useEffect, useRef, useCallback } from 'react'
import { HERO_SLIDES } from '../data/catalog'
import type { Product } from '../types'
import { vnd } from '../api'
import { ExplodedDevice3D, type DeviceKind } from './ExplodedDevice3D'

interface HeroBanner3DProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, sourceEl: HTMLElement | null) => void;
  onOpenAI: (prompt?: string) => void;
  onOpenVouchers: () => void;
}

const SLIDE_DEVICES: { kind: DeviceKind; icon: string; label: string }[] = [
  { kind: 'macbook', icon: '💻', label: 'MacBook' },
  { kind: 'phone', icon: '📱', label: 'iPhone' },
  { kind: 'gaming', icon: '🎮', label: 'Gaming' },
  { kind: 'keyboard', icon: '⌨️', label: 'Gear' }
]

const AUTOPLAY_MS = 5200

/** Mạch điện tử chạy xung năng lượng làm nền cho Hero */
const CircuitBackdrop: React.FC = () => {
  const paths = [
    'M0 70 H140 L175 105 H330 L360 75 H520',
    'M0 330 H90 L130 290 H260 L290 320 H470',
    'M800 40 H660 L620 80 H520 L495 55 H420',
    'M800 360 H700 L660 320 H560 L530 350 H380',
    'M60 0 V60 L100 100 V200 L70 230 V400',
    'M740 0 V90 L700 130 V250 L735 285 V400',
    'M200 400 V350 L240 310 H330',
    'M600 0 V40 L560 80 H470'
  ]
  return (
    <svg className="hero-circuit-svg" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="circuitPulse" x1="0" x2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} className="circuit-trace" />
          <path
            d={d}
            className="circuit-pulse"
            style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${4 + (i % 3)}s` }}
          />
        </g>
      ))}
      {[[140, 70], [330, 105], [130, 290], [620, 80], [660, 320], [100, 100], [700, 130], [240, 310]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.2" className="circuit-node" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </svg>
  )
}

export const HeroBanner3D: React.FC<HeroBanner3DProps> = ({
  products,
  onQuickView,
  onAddToCart,
  onOpenAI,
  onOpenVouchers
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [xray, setXray] = useState(false)
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Tự động đổi thiết bị liên tục, tạm dừng khi khách đang soi linh kiện
  useEffect(() => {
    if (xray) return
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % HERO_SLIDES.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [xray, activeIndex])

  const slide = HERO_SLIDES[activeIndex]
  const device = SLIDE_DEVICES[activeIndex % SLIDE_DEVICES.length]
  const matchedProduct = products.find(p => p.id === slide.productId) || products[0]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    })
  }

  const handleExplode = useCallback((v: boolean) => setXray(v), [])
  const handleOpenDetail = useCallback(() => {
    if (matchedProduct) onQuickView(matchedProduct)
  }, [matchedProduct, onQuickView])

  return (
    <section className="hero-bento-section">
      {/* MAIN 3D STAGE */}
      <div
        ref={cardRef}
        className={`hero-3d-stage ${xray ? 'is-xray' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setGlare({ x: 50, y: 50 })}
      >
        <CircuitBackdrop />
        <div className="hero-aurora a1" />
        <div className="hero-aurora a2" />

        {/* SPOTLIGHT RADIAL GLOW REFLECTION */}
        <div
          className="hero-spotlight-overlay"
          style={{
            background: `radial-gradient(650px circle at ${glare.x}% ${glare.y}%, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.07) 40%, transparent 75%)`
          }}
        />

        <div className="hero-content-left" key={`copy-${slide.id}`}>
          <div className="hero-tag-badge hero-anim-in" style={{ animationDelay: '0ms' }}>{slide.tag}</div>
          <h2 className="hero-headline hero-anim-in" style={{ animationDelay: '60ms' }}>{slide.title}</h2>
          <p className="hero-description hero-anim-in" style={{ animationDelay: '120ms' }}>{slide.subtitle}</p>

          <div className="hero-spec-chips hero-anim-in" style={{ animationDelay: '180ms' }}>
            {slide.badges.map((b, i) => (
              <span key={i} className="hero-spec-chip">✦ {b}</span>
            ))}
          </div>

          <div className="hero-price-block hero-anim-in" style={{ animationDelay: '240ms' }}>
            <div className="hero-price-current">{vnd(slide.price)}</div>
            <div className="hero-price-old">{vnd(slide.oldPrice)}</div>
            <span className="hero-save-tag">
              Tiết kiệm {vnd(slide.oldPrice - slide.price)}
            </span>
          </div>

          <div className="hero-cta-group hero-anim-in" style={{ animationDelay: '300ms' }}>
            <button
              className="hero-btn-primary"
              onClick={e => matchedProduct && onAddToCart(matchedProduct, e.currentTarget)}
            >
              <span>🛒 Mua Ngay • Freeship 2H</span>
            </button>
            <button
              className="hero-btn-secondary"
              onClick={() => matchedProduct && onQuickView(matchedProduct)}
            >
              <span>🔍 Xem Cấu Hình 360°</span>
            </button>
          </div>
        </div>

        <div className="hero-visual-right">
          <ExplodedDevice3D
            kind={device.kind}
            onExplodeChange={handleExplode}
            onOpenDetail={handleOpenDetail}
          />

          {/* ẢNH THẬT NỔI */}
          <button
            className="hero-real-photo"
            key={`photo-${slide.id}`}
            onClick={() => matchedProduct && onQuickView(matchedProduct)}
            title="Xem ảnh thực tế sản phẩm"
          >
            <img src={slide.image} alt={slide.title} />
            <span>📸 Ảnh thật</span>
          </button>

          <div className="hero-floating-warranty-card">
            <span className="warranty-icon">🛡️</span>
            <div>
              <strong>Chính hãng VN/A</strong>
              <span>1 đổi 1 trong 30 ngày</span>
            </div>
          </div>
        </div>

        {/* DEVICE SWITCHER + AUTOPLAY PROGRESS */}
        <div className="hero-device-switcher">
          {HERO_SLIDES.map((s, idx) => {
            const d = SLIDE_DEVICES[idx % SLIDE_DEVICES.length]
            const active = idx === activeIndex
            return (
              <button
                key={s.id}
                className={`hero-device-pill ${active ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                title={s.title}
              >
                <span className="pill-icon">{d.icon}</span>
                <span className="pill-label">{d.label}</span>
                {active && (
                  <i
                    key={`prog-${activeIndex}-${xray ? 'p' : 'r'}`}
                    className={`pill-progress ${xray ? 'paused' : ''}`}
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* RIGHT BENTO STACK */}
      <div className="hero-side-bento">
        <div
          className="bento-card ai-concierge-bento"
          onClick={() => onOpenAI('Tư vấn giúp mình cấu hình Laptop và Gear đáng mua nhất hôm nay')}
        >
          <div className="bento-glow-orb">🤖</div>
          <div className="bento-info">
            <span className="bento-eyebrow">APPLE INTELLIGENCE STYLE</span>
            <h3>Trợ Lý AI Tư Vấn Cấu Hình</h3>
            <p>Phân tích nhu cầu Gaming, Đồ họa, Sinh viên IT &amp; So sánh trực tiếp trong 0.2 giây.</p>
            <span className="bento-link">Hỏi Chuyên Gia AI Ngay →</span>
          </div>
        </div>

        <div
          className="bento-card voucher-bento"
          onClick={onOpenVouchers}
        >
          <div className="bento-glow-orb voucher-orb">🎟️</div>
          <div className="bento-info">
            <span className="bento-eyebrow">SIÊU VÍ VOUCHER &amp; VÒNG QUAY</span>
            <h3>Săn Mã Giảm Tới 2.000.000₫</h3>
            <p>Lưu mã TECH10, VIP2TR, Freeship Hỏa tốc 2H &amp; Điểm danh nhận 50.000 Xu mỗi ngày.</p>
            <span className="bento-link">Mở Kho Voucher &amp; Quay Thưởng →</span>
          </div>
        </div>
      </div>
    </section>
  )
}
