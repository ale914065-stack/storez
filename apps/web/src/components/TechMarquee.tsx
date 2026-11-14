import React, { useMemo } from 'react'
import type { Product } from '../types'
import { vnd } from '../api'

interface TechMarqueeProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

const PERKS = [
  '🚀 Giao Hỏa tốc 2H nội thành',
  '🛡️ Bảo hành chính hãng 24 tháng',
  '💳 Trả góp 0% qua thẻ tín dụng',
  '🔁 1 đổi 1 trong 30 ngày',
  '🤖 Trợ lý AI tư vấn 24/7',
  '🎁 Quà tặng tới 2.000.000₫',
  '⚡ Flash Sale mỗi khung giờ vàng',
  '🧾 Hóa đơn VAT điện tử tức thì'
]

/** Dải băng chuyền sản phẩm & đặc quyền chạy vô tận (pause khi rê chuột) */
export const TechMarquee: React.FC<TechMarqueeProps> = ({ products, onQuickView }) => {
  const items = useMemo(() => products.slice(0, 14), [products])
  if (items.length === 0) return null

  return (
    <section className="tech-marquee-section" aria-label="Sản phẩm đang hot">
      <div className="marquee-head">
        <span className="marquee-live-dot" />
        <strong>ĐANG HOT TRÊN STOREZ</strong>
        <em>Cập nhật theo thời gian thực • Rê chuột để dừng</em>
      </div>

      <div className="marquee-viewport">
        <div className="marquee-track" style={{ animationDuration: `${items.length * 4.2}s` }}>
          {[...items, ...items].map((p, i) => (
            <button
              key={`${p.id}-${i}`}
              className="marquee-product"
              onClick={() => onQuickView(p)}
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : 0}
            >
              <span className="marquee-img-wrap">
                <img src={p.image} alt={p.name} loading="lazy" />
              </span>
              <span className="marquee-info">
                <strong>{p.name}</strong>
                <span>
                  <b>{vnd(p.price)}</b>
                  {p.oldPrice ? <del>{vnd(p.oldPrice)}</del> : null}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="marquee-viewport perks">
        <div className="marquee-track reverse">
          {[...PERKS, ...PERKS].map((t, i) => (
            <span key={i} className="marquee-perk" aria-hidden={i >= PERKS.length}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
