import React, { useEffect, useMemo, useState } from 'react'
import type { Product, ProductColor } from '../types'
import { vnd } from '../api'

interface ProductCardProps {
  product: Product;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, sourceEl: HTMLElement | null, selectedColor?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isCompared,
  onToggleCompare,
  onQuickView,
  onAddToCart
}) => {
  let colorList: ProductColor[] = []
  try {
    colorList = product.colors ? JSON.parse(product.colors) : []
  } catch {}

  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const activeColor = colorList[selectedColorIdx]
  const activeImg = activeColor?.img || product.image

  // Bộ sưu tập ảnh tự chuyển động khi rê chuột (auto-cycle gallery)
  const slideImages = useMemo(() => {
    let gallery: string[] = []
    try { gallery = product.gallery ? JSON.parse(product.gallery) : [] } catch {}
    return Array.from(new Set([activeImg, ...gallery].filter(Boolean))).slice(0, 4)
  }, [activeImg, product.gallery])
  const [imgIdx, setImgIdx] = useState(0)
  const [cycling, setCycling] = useState(false)

  useEffect(() => { setImgIdx(0) }, [activeImg])
  useEffect(() => {
    if (!cycling || slideImages.length < 2) return
    const t = window.setInterval(() => setImgIdx(i => (i + 1) % slideImages.length), 1150)
    return () => window.clearInterval(t)
  }, [cycling, slideImages.length])
  const effectivePrice = product.price + (activeColor?.priceDelta || 0)
  const oldPrice = product.oldPrice || Math.round(product.price * 1.18)
  const discountPct = Math.max(5, Math.round((1 - effectivePrice / oldPrice) * 100))

  const specItems = (product.specs || '').split('|').filter(Boolean).slice(0, 3)

  return (
    <article className="luxury-product-card">
      {/* TOP BADGES */}
      <div className="card-badges-top">
        <span className="badge-discount">-{discountPct}%</span>
        {product.installment0 !== 0 && (
          <span className="badge-installment">Trả góp 0%</span>
        )}
      </div>

      {/* HOVER QUICK ACTIONS */}
      <div className="card-floating-actions">
        <button
          className="card-float-btn"
          title="Xem nhanh chi tiết & Phóng to ảnh"
          onClick={() => onQuickView(product)}
        >
          👁️ Xem nhanh
        </button>
        <button
          className={`card-float-btn ${isCompared ? 'compared-active' : ''}`}
          title="Đưa vào bảng So sánh cấu hình"
          onClick={() => onToggleCompare(product)}
        >
          {isCompared ? '✓ Đang so sánh' : '⚖️ So sánh'}
        </button>
      </div>

      {/* PRODUCT IMAGE STAGE */}
      <div
        className={`luxury-card-img-stage ${cycling ? 'is-cycling' : ''}`}
        onClick={() => onQuickView(product)}
        onMouseEnter={() => { setCycling(true); if (slideImages.length > 1) setImgIdx(1) }}
        onMouseLeave={() => { setCycling(false); setImgIdx(0) }}
      >
        {slideImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? product.name : ''}
            loading="lazy"
            className={`luxury-card-img ${i === imgIdx ? 'active' : ''}`}
          />
        ))}
        {slideImages.length > 1 && (
          <span className="card-img-dots">
            {slideImages.map((_, i) => (
              <i key={i} className={i === imgIdx ? 'on' : ''} />
            ))}
          </span>
        )}
        {product.freeship !== 0 && (
          <span className="freeship-corner-tag">🚚 Freeship 2H</span>
        )}
      </div>

      {/* CARD BODY */}
      <div className="luxury-card-body">
        <div className="card-brand-rating-row">
          <span className="card-brand-pill">{product.brand || 'TechStore'}</span>
          <span className="card-rating-pill">
            ⭐ {(product.rating || 4.9).toFixed(1)} <em>({product.soldCount || 215} đã bán)</em>
          </span>
        </div>

        <h3 className="luxury-card-title" onClick={() => onQuickView(product)}>
          {product.name}
        </h3>

        {/* DYNAMIC COLOR DOTS */}
        {colorList.length > 0 && (
          <div className="card-color-swatches">
            {colorList.map((col, idx) => (
              <button
                key={idx}
                type="button"
                className={`swatch-dot ${idx === selectedColorIdx ? 'active' : ''}`}
                style={{ backgroundColor: col.hex }}
                title={`Màu: ${col.name}`}
                onMouseEnter={() => setSelectedColorIdx(idx)}
                onClick={() => setSelectedColorIdx(idx)}
              />
            ))}
            <span className="swatch-active-name">{activeColor?.name}</span>
          </div>
        )}

        {/* SPEC CHIPS */}
        {specItems.length > 0 && (
          <ul className="luxury-spec-list">
            {specItems.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}

        {/* PRICE & ACTIONS FOOTER */}
        <div className="luxury-card-footer">
          <div className="luxury-price-block">
            <strong className="luxury-current-price">{vnd(effectivePrice)}</strong>
            <del className="luxury-old-price">{vnd(oldPrice)}</del>
          </div>

          <div className="luxury-btn-row">
            <button
              className="btn-detail-outline"
              onClick={() => onQuickView(product)}
            >
              Chi tiết
            </button>
            <button
              className="btn-add-cart-glow"
              onClick={e => onAddToCart(product, e.currentTarget, activeColor?.name)}
            >
              + Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
