import React from 'react'
import type { Product, StructuredSpecs } from '../types'
import { vnd } from '../api'

interface CompareModalProps {
  compareProducts: Product[];
  allProducts: Product[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemoveProduct: (id: number) => void;
  onAddProduct: (product: Product) => void;
  onClearAll: () => void;
  onAddToCart: (product: Product, sourceEl: HTMLElement | null) => void;
}

const COMPARE_ROWS: Array<{
  key: keyof StructuredSpecs | 'price' | 'rating' | 'brand';
  label: string;
  mode: 'min' | 'max' | 'text';
}> = [
  { key: 'price', label: '💰 Giá bán Ưu đãi', mode: 'min' },
  { key: 'brand', label: '🏢 Thương hiệu', mode: 'text' },
  { key: 'cpu', label: '🧠 Vi xử lý (CPU / Chip)', mode: 'max' },
  { key: 'ram', label: '⚡ Bộ nhớ RAM / Tần số', mode: 'max' },
  { key: 'storage', label: '💾 Lưu trữ / Bộ nhớ', mode: 'max' },
  { key: 'gpu', label: '🎮 Đồ họa / Driver', mode: 'max' },
  { key: 'display', label: '🖥️ Màn hình / Thiết kế', mode: 'max' },
  { key: 'battery', label: '🔋 Pin & Sạc nhanh', mode: 'max' },
  { key: 'weight', label: '⚖️ Trọng lượng', mode: 'min' },
  { key: 'connectivity', label: '📡 Chuẩn kết nối', mode: 'text' },
  { key: 'rating', label: '⭐ Đánh giá & Lượt bán', mode: 'max' }
]

export const CompareModal: React.FC<CompareModalProps> = ({
  compareProducts,
  allProducts,
  isOpen,
  onOpen,
  onClose,
  onRemoveProduct,
  onAddProduct,
  onClearAll,
  onAddToCart
}) => {
  const parseSpecMap = (p: Product): StructuredSpecs => {
    try {
      return p.structuredSpecs ? JSON.parse(p.structuredSpecs) : {}
    } catch {
      return {}
    }
  }

  const extractScore = (
    p: Product,
    key: (typeof COMPARE_ROWS)[number]['key'],
    specMap: StructuredSpecs
  ): number => {
    if (key === 'price') return p.price
    if (key === 'rating') return (p.rating || 4.9) * 10000 + (p.soldCount || 100)
    const raw = (specMap[key as keyof StructuredSpecs] || '').toLowerCase()
    if (!raw) return 0

    if (key === 'weight') {
      const mKg = raw.match(/(\d+(?:\.\d+)?)\s*kg/)
      if (mKg) return parseFloat(mKg[1]) * 1000
      const mG = raw.match(/(\d+(?:\.\d+)?)\s*g/)
      if (mG) return parseFloat(mG[1])
      return 99999
    }

    if (key === 'storage') {
      const tb = raw.match(/(\d+)\s*tb/)
      if (tb) return parseInt(tb[1], 10) * 1024
    }

    const nums = raw.match(/(\d+(?:\.\d+)?)/g)
    if (!nums) return raw.length
    return Math.max(...nums.map(Number))
  }

  // Suggestions to fill up to 3 slots
  const suggestions = allProducts
    .filter(p => !compareProducts.some(cp => cp.id === p.id))
    .slice(0, 4)

  return (
    <>
      {/* FLOATING COMPARE DOCK AT BOTTOM */}
      {compareProducts.length > 0 && !isOpen && (
        <div className="floating-compare-dock">
          <div className="compare-dock-inner">
            <div className="compare-dock-title">
              <span className="dock-icon">⚖️</span>
              <div>
                <strong>So sánh Cấu hình ({compareProducts.length}/3)</strong>
                <span>Tự động tô sáng thông số vượt trội</span>
              </div>
            </div>

            <div className="compare-dock-slots">
              {[0, 1, 2].map(slotIdx => {
                const prod = compareProducts[slotIdx]
                return prod ? (
                  <div className="compare-slot-filled" key={`filled-${prod.id}-${slotIdx}`}>
                    <img src={prod.image} alt={prod.name} />
                    <div className="slot-meta">
                      <span>{prod.name}</span>
                      <strong>{vnd(prod.price)}</strong>
                    </div>
                    <button
                      className="slot-remove-x"
                      onClick={() => onRemoveProduct(prod.id)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="compare-slot-empty" key={`empty-${slotIdx}`}>
                    <span>+ Chọn thêm sản phẩm {slotIdx + 1}</span>
                  </div>
                )
              })}
            </div>

            <div className="compare-dock-actions">
              <button className="dock-clear-btn" onClick={onClearAll}>
                Xóa hết
              </button>
              <button className="dock-launch-btn" onClick={onOpen}>
                ⚡ Đối Chiếu Ngay ({compareProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SPEC COMPARISON MODAL */}
      {isOpen && (
        <div className="modal-backdrop-glass" onClick={onClose}>
          <div className="compare-modal-window" onClick={e => e.stopPropagation()}>
            <div className="compare-modal-header">
              <div>
                <h2>⚖️ ĐỐI CHIẾU THÔNG SỐ KỸ THUẬT CHUYÊN SÂU (CHUẨN AMAZON)</h2>
                <p>Hệ thống AI tự động phân tích và tô sáng xanh lá (🏆 Vượt trội) các thông số mạnh hơn trên từng dòng</p>
              </div>
              <div className="compare-header-btns">
                {compareProducts.length > 0 && (
                  <button className="compare-clear-all" onClick={onClearAll}>
                    Làm mới danh sách
                  </button>
                )}
                <button className="pdp-close-btn" onClick={onClose}>✕</button>
              </div>
            </div>

            <div className="compare-modal-body">
              {compareProducts.length < 3 && (
                <div className="compare-quick-add-strip">
                  <span>➕ Thêm nhanh sản phẩm để so sánh đủ 3 cột:</span>
                  <div className="compare-quick-chips">
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        className="compare-suggest-chip"
                        onClick={() => onAddProduct(s)}
                      >
                        + {s.name} ({vnd(s.price)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {compareProducts.length === 0 ? (
                <div className="compare-empty-box">
                  <p>Chưa có sản phẩm nào trong bảng so sánh. Hãy chọn nhanh các siêu phẩm bên trên!</p>
                </div>
              ) : (
                <div className="compare-table-wrapper">
                  <table className="luxury-compare-table">
                    <thead>
                      <tr>
                        <th className="compare-feature-col">Tiêu chí đối chiếu</th>
                        {compareProducts.map(p => (
                          <th key={p.id} className="compare-prod-col">
                            <button
                              className="compare-col-remove"
                              onClick={() => onRemoveProduct(p.id)}
                            >
                              ✕ Bỏ
                            </button>
                            <img src={p.image} alt={p.name} className="compare-col-img" />
                            <h4>{p.name}</h4>
                            <button
                              className="compare-col-buy-btn"
                              onClick={e => onAddToCart(p, e.currentTarget)}
                            >
                              + Thêm vào giỏ
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_ROWS.map(row => {
                        const scores = compareProducts.map(p =>
                          extractScore(p, row.key, parseSpecMap(p))
                        )
                        const validScores = scores.filter(s => s > 0)
                        let bestScore = -1
                        if (compareProducts.length >= 2 && validScores.length >= 2 && row.mode !== 'text') {
                          bestScore =
                            row.mode === 'min'
                              ? Math.min(...validScores)
                              : Math.max(...validScores)
                        }
                        const allEqual = validScores.every(s => s === validScores[0])

                        return (
                          <tr key={row.key}>
                            <td className="compare-row-label">{row.label}</td>
                            {compareProducts.map((p, idx) => {
                              const specMap = parseSpecMap(p)
                              let displayVal = ''
                              if (row.key === 'price') displayVal = vnd(p.price)
                              else if (row.key === 'brand') displayVal = p.brand || 'Chính hãng'
                              else if (row.key === 'rating')
                                displayVal = `⭐ ${(p.rating || 4.9).toFixed(1)} (${p.soldCount || 210} đã bán)`
                              else displayVal = specMap[row.key] || (p.specs || '').split('|')[0] || 'Đang cập nhật'

                              const isWinner =
                                !allEqual &&
                                bestScore > 0 &&
                                scores[idx] === bestScore &&
                                row.mode !== 'text'

                              return (
                                <td
                                  key={p.id}
                                  className={`compare-cell ${isWinner ? 'winner-spec-cell' : ''}`}
                                >
                                  <div className="compare-cell-inner">
                                    <span>{displayVal}</span>
                                    {isWinner && (
                                      <span className="winner-spec-badge">🏆 Vượt trội</span>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
