import React, { useState, useEffect } from 'react'
import type { Product, ProductColor, ProductStorageOption, StructuredSpecs, ReviewItem } from '../types'
import { vnd } from '../api'

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  reviews: ReviewItem[];
  onClose: () => void;
  onAddToCart: (
    product: Product,
    sourceEl: HTMLElement | null,
    selectedColor?: string,
    selectedStorage?: string,
    unitPrice?: number
  ) => void;
  onAddReview: (review: ReviewItem) => void;
  onToggleCompare: (product: Product) => void;
  onSelectOtherProduct: (product: Product) => void;
}

const SPEC_LABELS: Record<keyof StructuredSpecs, string> = {
  cpu: 'Vi xử lý / Chipset',
  ram: 'Bộ nhớ RAM / Tần số',
  storage: 'Lưu trữ / Bộ nhớ',
  gpu: 'Đồ họa / Driver',
  display: 'Màn hình / Thiết kế',
  battery: 'Pin & Công nghệ Sạc',
  weight: 'Trọng lượng',
  connectivity: 'Kết nối & Cổng giao tiếp'
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = (props) => {
  if (!props.product) return null
  return <ProductDetailModalContent {...props} product={props.product} />
}

const ProductDetailModalContent: React.FC<ProductDetailModalProps & { product: Product }> = ({
  product,
  allProducts,
  reviews,
  onClose,
  onAddToCart,
  onAddReview,
  onToggleCompare,
  onSelectOtherProduct
}) => {
  let colors: ProductColor[] = []
  let storages: ProductStorageOption[] = []
  let gallery: string[] = []
  let structured: StructuredSpecs = {}
  let fbtIds: number[] = []

  try { colors = product.colors ? JSON.parse(product.colors) : [] } catch {}
  try { storages = product.storageOptions ? JSON.parse(product.storageOptions) : [] } catch {}
  try { gallery = product.gallery ? JSON.parse(product.gallery) : [product.image] } catch { gallery = [product.image] }
  try { structured = product.structuredSpecs ? JSON.parse(product.structuredSpecs) : {} } catch {}
  try { fbtIds = product.frequentlyBoughtIds ? JSON.parse(product.frequentlyBoughtIds) : [15, 16] } catch { fbtIds = [15, 16] }

  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const [selectedStorageIdx, setSelectedStorageIdx] = useState(0)
  const [activeImage, setActiveImage] = useState(product.image)

  // Magnifier lens state
  const [zoomActive, setZoomActive] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  // Frequently Bought Together state
  const companionProducts = fbtIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined && p.id !== product.id)
    .slice(0, 2)

  const [selectedCompanionIds, setSelectedCompanionIds] = useState<number[]>(
    companionProducts.map(c => c.id)
  )

  // Reviews filter & new review state
  const [reviewFilter, setReviewFilter] = useState<'all' | '5star' | 'withImages'>('all')
  const [newRating, setNewRating] = useState(5)
  const [newAuthor, setNewAuthor] = useState('')
  const [newComment, setNewComment] = useState('')
  const [includeSamplePhoto, setIncludeSamplePhoto] = useState(true)

  useEffect(() => {
    setSelectedColorIdx(0)
    setSelectedStorageIdx(0)
    setActiveImage(product.image)
    setSelectedCompanionIds(
      fbtIds
        .map(id => allProducts.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined && p.id !== product.id)
        .slice(0, 2)
        .map(c => c.id)
    )
  }, [product.id])

  const activeColor = colors[selectedColorIdx]
  const activeStorage = storages[selectedStorageIdx]

  const dynamicPrice =
    product.price +
    (activeColor?.priceDelta || 0) +
    (activeStorage?.priceDelta || 0)

  const dynamicOldPrice =
    (product.oldPrice || Math.round(product.price * 1.18)) +
    (activeColor?.priceDelta || 0) +
    (activeStorage?.priceDelta || 0)

  const dynamicStock = activeStorage?.stock ?? product.stock ?? 20

  const allGalleryImages = Array.from(
    new Set([product.image, ...gallery, ...colors.map(c => c.img)].filter(Boolean))
  )

  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  // Combo pricing calculation
  const selectedCompanions = companionProducts.filter(c => selectedCompanionIds.includes(c.id))
  const rawComboTotal = dynamicPrice + selectedCompanions.reduce((sum, c) => sum + c.price, 0)
  const comboDiscount = selectedCompanions.length > 0 ? Math.round(rawComboTotal * 0.05) : 0
  const finalComboPrice = rawComboTotal - comboDiscount

  const handleAddCombo = (btnEl: HTMLElement | null) => {
    onAddToCart(product, btnEl, activeColor?.name, activeStorage?.label, dynamicPrice)
    for (const comp of selectedCompanions) {
      onAddToCart(comp, null)
    }
  }

  // Product reviews
  const prodReviews = reviews.filter(r => r.productId === product.id || r.id.startsWith('rev-'))
  const filteredReviews = prodReviews.filter(r => {
    if (reviewFilter === '5star') return r.rating === 5
    if (reviewFilter === 'withImages') return r.images && r.images.length > 0
    return true
  })

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const created: ReviewItem = {
      id: `rev-user-${Date.now()}`,
      productId: product.id,
      author: newAuthor.trim() || 'Khách hàng Thành viên VIP',
      avatar: '🌟',
      rating: newRating,
      date: 'Vừa xong • Đã mua hàng chính hãng',
      variant: `${activeColor?.name || 'Tiêu chuẩn'} • ${activeStorage?.label || 'Chính hãng'}`,
      comment: newComment.trim(),
      images: includeSamplePhoto ? [activeImage] : undefined,
      helpfulCount: 1,
      verified: true
    }
    onAddReview(created)
    setNewAuthor('')
    setNewComment('')
  }

  return (
    <div className="modal-backdrop-glass" onClick={onClose}>
      <div className="product-detail-modal-container" onClick={e => e.stopPropagation()}>
        {/* MODAL STICKY TOPBAR */}
        <div className="pdp-modal-header">
          <div className="pdp-breadcrumb">
            <span>Trang chủ</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <strong>{product.name}</strong>
          </div>
          <div className="pdp-header-actions">
            <button
              className="pdp-compare-btn"
              onClick={() => onToggleCompare(product)}
            >
              ⚖️ Đưa vào So sánh
            </button>
            <button className="pdp-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="pdp-scroll-body">
          {/* TOP HERO SPLIT: GALLERY WITH MAGNIFIER + DYNAMIC VARIANTS */}
          <div className="pdp-top-grid">
            {/* LEFT: MULTI-ANGLE GALLERY + MAGNIFIER ZOOM */}
            <div className="pdp-gallery-column">
              <div
                className="pdp-main-img-stage"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={handleMouseMoveZoom}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="pdp-main-img"
                  style={
                    zoomActive
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: 'scale(2.15)'
                        }
                      : undefined
                  }
                />
                <div className="zoom-hint-pill">
                  🔍 {zoomActive ? 'Đang phóng to chi tiết 2.15x' : 'Rê chuột vào ảnh để phóng to kính lúp'}
                </div>
              </div>

              <div className="pdp-thumbnails-row">
                {allGalleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    className={`pdp-thumb-btn ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: DYNAMIC CONFIGURATOR & LIVE PRICE/STOCK */}
            <div className="pdp-config-column">
              <div className="pdp-badges-line">
                <span className="pdp-brand-tag">{product.brand} Official</span>
                <span className="pdp-stock-badge">
                  🟢 Sẵn kho {dynamicStock} máy (Giao 2H)
                </span>
                <span className="pdp-rating-summary">
                  ⭐ {(product.rating || 4.9).toFixed(1)} ({product.reviewCount || 180} đánh giá)
                </span>
              </div>

              <h1 className="pdp-title">{product.name}</h1>
              <p className="pdp-desc">{product.description}</p>

              {/* LIVE DYNAMIC PRICE BOX */}
              <div className="pdp-live-price-box">
                <div className="pdp-price-main-row">
                  <strong className="pdp-live-price">{vnd(dynamicPrice)}</strong>
                  <del className="pdp-old-price">{vnd(dynamicOldPrice)}</del>
                  <span className="pdp-discount-pill">
                    Tiết kiệm {vnd(dynamicOldPrice - dynamicPrice)}
                  </span>
                </div>
                <div className="pdp-perks-strip">
                  <span>⚡ Trả góp 0% chỉ từ {vnd(dynamicPrice / 12)}/tháng</span>
                  <span>•</span>
                  <span>🎁 Tặng thêm 50.000 Xu tích lũy</span>
                </div>
              </div>

              {/* 1. COLOR SELECTOR */}
              {colors.length > 0 && (
                <div className="pdp-variant-section">
                  <label className="pdp-variant-label">
                    Màu sắc: <strong>{activeColor?.name}</strong>
                  </label>
                  <div className="pdp-color-options">
                    {colors.map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`pdp-color-pill ${idx === selectedColorIdx ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedColorIdx(idx)
                          if (col.img) setActiveImage(col.img)
                        }}
                      >
                        <span
                          className="pdp-color-circle"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="pdp-color-name">{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. STORAGE / VERSION SELECTOR */}
              {storages.length > 0 && (
                <div className="pdp-variant-section">
                  <label className="pdp-variant-label">
                    Phiên bản / Cấu hình: <strong>{activeStorage?.label}</strong>
                  </label>
                  <div className="pdp-storage-options">
                    {storages.map((st, idx) => {
                      const optPrice = product.price + (activeColor?.priceDelta || 0) + st.priceDelta
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`pdp-storage-card ${idx === selectedStorageIdx ? 'active' : ''}`}
                          onClick={() => setSelectedStorageIdx(idx)}
                        >
                          <strong>{st.label}</strong>
                          <span>{vnd(optPrice)}</span>
                          <small>Còn {st.stock} sản phẩm</small>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ADD TO CART & BUY NOW CTA */}
              <div className="pdp-cta-buttons">
                <button
                  className="pdp-add-cart-btn"
                  onClick={e =>
                    onAddToCart(
                      product,
                      e.currentTarget,
                      activeColor?.name,
                      activeStorage?.label,
                      dynamicPrice
                    )
                  }
                >
                  🛒 THÊM VÀO GIỎ HÀNG ({vnd(dynamicPrice)})
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: FREQUENTLY BOUGHT TOGETHER (THƯỜNG ĐƯỢC MUA CÙNG NHAU) */}
          {companionProducts.length > 0 && (
            <div className="pdp-fbt-section">
              <div className="pdp-section-head">
                <h3>🔥 THƯỜNG ĐƯỢC MUA CÙNG NHAU (COMBO GIẢM THÊM 5%)</h3>
                <span>Tích chọn phụ kiện đồng bộ để nhận ưu đãi Combo trực tiếp</span>
              </div>

              <div className="fbt-Layout-row">
                <div className="fbt-items-list">
                  {/* Main product */}
                  <div className="fbt-item-card main-fbt">
                    <img src={activeImage} alt={product.name} />
                    <div className="fbt-item-meta">
                      <span className="fbt-tag">Sản phẩm chính</span>
                      <h4>{product.name}</h4>
                      <strong>{vnd(dynamicPrice)}</strong>
                    </div>
                  </div>

                  {companionProducts.map(comp => {
                    const checked = selectedCompanionIds.includes(comp.id)
                    return (
                      <React.Fragment key={comp.id}>
                        <div className="fbt-plus-sign">+</div>
                        <div
                          className={`fbt-item-card ${checked ? 'checked' : 'unchecked'}`}
                          onClick={() =>
                            setSelectedCompanionIds(prev =>
                              prev.includes(comp.id)
                                ? prev.filter(id => id !== comp.id)
                                : [...prev, comp.id]
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {}}
                            className="fbt-checkbox"
                          />
                          <img src={comp.image} alt={comp.name} />
                          <div className="fbt-item-meta">
                            <span
                              className="fbt-tag clickable"
                              onClick={e => {
                                e.stopPropagation()
                                onSelectOtherProduct(comp)
                              }}
                            >
                              Xem máy này →
                            </span>
                            <h4>{comp.name}</h4>
                            <strong>{vnd(comp.price)}</strong>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })}
                </div>

                <div className="fbt-summary-box">
                  <div className="fbt-summary-line">
                    <span>Tổng {1 + selectedCompanions.length} sản phẩm:</span>
                    <del>{vnd(rawComboTotal)}</del>
                  </div>
                  <div className="fbt-summary-price">
                    <strong>{vnd(finalComboPrice)}</strong>
                    {comboDiscount > 0 && (
                      <span className="fbt-save-badge">Giảm thêm {vnd(comboDiscount)}</span>
                    )}
                  </div>
                  <button
                    className="fbt-buy-combo-btn"
                    onClick={e => handleAddCombo(e.currentTarget)}
                  >
                    ⚡ Thêm cả Combo vào Giỏ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DETAILED TECHNICAL SPECS & REVIEWS */}
          <div className="pdp-bottom-split">
            {/* LEFT: STRUCTURED TECHNICAL SPECS TABLE */}
            <div className="pdp-specs-panel">
              <h3>⚙️ THÔNG SỐ KỸ THUẬT CHI TIẾT</h3>
              <table className="pdp-specs-table">
                <tbody>
                  {(Object.keys(SPEC_LABELS) as Array<keyof StructuredSpecs>).map(key => {
                    const val = structured[key]
                    if (!val) return null
                    return (
                      <tr key={key}>
                        <th>{SPEC_LABELS[key]}</th>
                        <td>{val}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* RIGHT: CUSTOMER REVIEWS & STAR CHART */}
            <div className="pdp-reviews-panel">
              <h3>⭐ ĐÁNH GIÁ & NHẬN XÉT THỰC TẾ</h3>

              <div className="reviews-overview-box">
                <div className="reviews-score-big">
                  <strong>{(product.rating || 4.9).toFixed(1)}<span>/5</span></strong>
                  <div className="stars-gold">★★★★★</div>
                  <small>{product.reviewCount || 180} đánh giá xác thực</small>
                </div>

                <div className="reviews-bars-stack">
                  {[
                    { star: 5, pct: 89 },
                    { star: 4, pct: 9 },
                    { star: 3, pct: 2 },
                    { star: 2, pct: 0 },
                    { star: 1, pct: 0 }
                  ].map(row => (
                    <div className="review-bar-row" key={row.star}>
                      <span>{row.star} ★</span>
                      <div className="review-bar-track">
                        <div className="review-bar-fill" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span>{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FILTER PILLS */}
              <div className="reviews-filter-pills">
                <button
                  className={reviewFilter === 'all' ? 'active' : ''}
                  onClick={() => setReviewFilter('all')}
                >
                  Tất cả ({prodReviews.length})
                </button>
                <button
                  className={reviewFilter === '5star' ? 'active' : ''}
                  onClick={() => setReviewFilter('5star')}
                >
                  5 Sao Tuyệt đối
                </button>
                <button
                  className={reviewFilter === 'withImages' ? 'active' : ''}
                  onClick={() => setReviewFilter('withImages')}
                >
                  📸 Có hình ảnh thực tế
                </button>
              </div>

              {/* REVIEWS LIST */}
              <div className="reviews-feed">
                {filteredReviews.map(rev => (
                  <div className="review-card-item" key={rev.id}>
                    <div className="review-card-top">
                      <span className="review-avatar">{rev.avatar}</span>
                      <div>
                        <strong>{rev.author}</strong>
                        <div className="review-meta-line">
                          <span className="stars-gold">{'★'.repeat(rev.rating)}</span>
                          <span>•</span>
                          <span className="verified-tag">✔ {rev.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="review-variant-pill">Phiên bản: {rev.variant}</div>
                    <p className="review-comment-text">{rev.comment}</p>
                    {rev.images && rev.images.length > 0 && (
                      <div className="review-photos-row">
                        {rev.images.map((img, i) => (
                          <img key={i} src={img} alt="Ảnh thực tế" onClick={() => setActiveImage(img)} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* WRITE NEW REVIEW FORM */}
              <form className="write-review-form" onSubmit={handleSubmitReview}>
                <h4>✍️ Viết đánh giá của bạn</h4>
                <div className="form-star-picker">
                  <span>Chọn mức độ hài lòng:</span>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      type="button"
                      key={s}
                      className={`star-pick-btn ${s <= newRating ? 'active' : ''}`}
                      onClick={() => setNewRating(s)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="write-review-inputs">
                  <input
                    type="text"
                    placeholder="Tên của bạn (VD: Minh Hoàng - Kỹ sư Phần mềm)"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                  />
                  <textarea
                    rows={2}
                    placeholder="Chia sẻ trải nghiệm thực tế về hiệu năng, màn hình, thời lượng pin..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    required
                  />
                </div>
                <div className="write-review-foot">
                  <label className="attach-photo-check">
                    <input
                      type="checkbox"
                      checked={includeSamplePhoto}
                      onChange={e => setIncludeSamplePhoto(e.target.checked)}
                    />
                    <span>📸 Đính kèm ảnh chụp sản phẩm thực tế</span>
                  </label>
                  <button type="submit" className="submit-review-btn">
                    Gửi Đánh Giá Ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
