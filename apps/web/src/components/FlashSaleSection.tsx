import React, { useState, useEffect } from 'react'
import type { Product } from '../types'
import { vnd } from '../api'

interface FlashSaleSectionProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, sourceEl: HTMLElement | null) => void;
}

const TIME_SLOTS = [
  { id: 'slot-1', time: '12:00', status: 'Đang diễn ra 🔥', active: true },
  { id: 'slot-2', time: '15:00', status: 'Sắp diễn ra', active: false },
  { id: 'slot-3', time: '20:00', status: 'Đêm Săn Siêu Deal', active: false },
  { id: 'slot-4', time: '00:00', status: 'Ngày mai', active: false }
]

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  onQuickView,
  onAddToCart
}) => {
  const [selectedSlot, setSelectedSlot] = useState('slot-1')
  const [secondsLeft, setSecondsLeft] = useState(2 * 3600 + 45 * 60 + 38) // 02:45:38

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 3 * 3600))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')

  const flashProducts = products.filter(p => p.isFlashSale === 1)
  const displayDeals =
    selectedSlot === 'slot-1'
      ? flashProducts
      : selectedSlot === 'slot-2'
      ? [...flashProducts].reverse()
      : selectedSlot === 'slot-3'
      ? products.slice(0, 6)
      : products.slice(6, 12)

  return (
    <section className="flash-sale-wrapper" id="flash-sale-section">
      {/* FLASH SALE HEADER & REAL-TIME COUNTDOWN */}
      <div className="flash-sale-header">
        <div className="flash-title-group">
          <div className="flash-lightning-badge">⚡ FLASH SALE GIỜ VÀNG</div>
          <span className="flash-sub-note">Săn Deal Công Nghệ Giá Sốc • Số Lượng Có Hạn</span>
        </div>

        <div className="flash-countdown-box">
          <span className="countdown-label">Kết thúc trong:</span>
          <div className="countdown-digits">
            <span className="digit-box">{hrs}</span>
            <span className="digit-colon">:</span>
            <span className="digit-box">{mins}</span>
            <span className="digit-colon">:</span>
            <span className="digit-box pulse-sec">{secs}</span>
          </div>
        </div>
      </div>

      {/* TIME SLOT TABS */}
      <div className="flash-slot-tabs">
        {TIME_SLOTS.map(slot => (
          <button
            key={slot.id}
            className={`flash-slot-tab ${selectedSlot === slot.id ? 'active' : ''}`}
            onClick={() => setSelectedSlot(slot.id)}
          >
            <strong className="slot-hour">{slot.time}</strong>
            <span className="slot-status">{slot.status}</span>
          </button>
        ))}
      </div>

      {/* FLASH SALE CARDS GRID */}
      <div className="flash-deals-carousel">
        {displayDeals.slice(0, 6).map(p => {
          const salePrice = p.flashSalePrice || Math.round(p.price * 0.9)
          const origPrice = p.oldPrice || Math.round(p.price * 1.18)
          const discountPct = Math.round((1 - salePrice / origPrice) * 100)
          const sold = p.flashSaleSold || 44
          const total = p.flashSaleTotal || 50
          const soldPercent = Math.min(96, Math.max(65, Math.round((sold / total) * 100)))

          return (
            <div className="flash-deal-card" key={p.id}>
              <div className="flash-discount-ribbon">⚡ -{discountPct}%</div>

              <div className="flash-img-container" onClick={() => onQuickView(p)}>
                <img src={p.image} alt={p.name} loading="lazy" />
              </div>

              <div className="flash-card-body">
                <span className="flash-brand-tag">{p.brand}</span>
                <h4 className="flash-prod-title" onClick={() => onQuickView(p)}>
                  {p.name}
                </h4>

                <div className="flash-price-stack">
                  <strong className="flash-sale-price">{vnd(salePrice)}</strong>
                  <del className="flash-orig-price">{vnd(origPrice)}</del>
                </div>

                {/* FIRE PROGRESS BAR */}
                <div className="flash-progress-track">
                  <div
                    className="flash-progress-fill"
                    style={{ width: `${soldPercent}%` }}
                  />
                  <span className="flash-progress-text">
                    🔥 Đã bán {soldPercent}% {soldPercent >= 85 ? '• Sắp cháy hàng' : ''}
                  </span>
                </div>

                <button
                  className="flash-grab-btn"
                  onClick={e => onAddToCart(p, e.currentTarget)}
                >
                  ⚡ SĂN NGAY
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
