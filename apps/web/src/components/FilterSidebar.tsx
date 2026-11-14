import React from 'react'
import type { FilterState } from '../types'
import { vnd } from '../api'

interface FilterSidebarProps {
  filters: FilterState;
  availableCategories: string[];
  availableBrands: string[];
  totalMatched: number;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const MAX_PRICE_LIMIT = 70000000

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  availableCategories,
  availableBrands,
  totalMatched,
  onChange,
  onReset
}) => {
  const toggleBrand = (brand: string) => {
    const exists = filters.brands.includes(brand)
    const nextBrands = exists
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]
    onChange({ ...filters, brands: nextBrands })
  }

  const setQuickPrice = (min: number, max: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max })
  }

  const hasActiveFilters =
    filters.category !== 'Tất cả' ||
    filters.minPrice > 0 ||
    filters.maxPrice < MAX_PRICE_LIMIT ||
    filters.brands.length > 0 ||
    filters.minRating > 0 ||
    filters.onlyInStock ||
    filters.onlyFreeship ||
    filters.onlyInstallment0 ||
    filters.onlyFlashSale

  return (
    <aside className="amazon-filter-sidebar">
      <div className="filter-head-row">
        <div className="filter-title-wrap">
          <span className="filter-icon">🎛️</span>
          <h3>BỘ LỌC THÔNG MINH</h3>
        </div>
        {hasActiveFilters && (
          <button className="filter-reset-link" onClick={onReset}>
            Đặt lại ↺
          </button>
        )}
      </div>

      <div className="filter-result-summary">
        Hiển thị <strong>{totalMatched}</strong> siêu phẩm công nghệ
      </div>

      {/* 1. DANH MỤC */}
      <div className="filter-group">
        <h4 className="filter-group-label">Danh mục Điện tử</h4>
        <div className="filter-cat-list">
          {availableCategories.map(cat => (
            <button
              key={cat}
              className={`filter-cat-pill ${filters.category === cat ? 'active' : ''}`}
              onClick={() => onChange({ ...filters, category: cat })}
            >
              <span>{cat}</span>
              {filters.category === cat && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 2. KHOẢNG GIÁ (DUAL RANGE SLIDER) */}
      <div className="filter-group">
        <h4 className="filter-group-label">Khoảng giá</h4>
        <div className="price-range-readout">
          <span>{vnd(filters.minPrice)}</span>
          <span>—</span>
          <span>{vnd(filters.maxPrice)}</span>
        </div>

        <div className="dual-slider-box">
          <label className="slider-mini-label">Giá tối thiểu:</label>
          <input
            type="range"
            min={0}
            max={MAX_PRICE_LIMIT - 2000000}
            step={500000}
            value={filters.minPrice}
            onChange={e => {
              const val = Math.min(Number(e.target.value), filters.maxPrice - 1000000)
              onChange({ ...filters, minPrice: Math.max(0, val) })
            }}
            className="tech-range-slider"
          />
          <label className="slider-mini-label">Giá tối đa:</label>
          <input
            type="range"
            min={1000000}
            max={MAX_PRICE_LIMIT}
            step={500000}
            value={filters.maxPrice}
            onChange={e => {
              const val = Math.max(Number(e.target.value), filters.minPrice + 1000000)
              onChange({ ...filters, maxPrice: val })
            }}
            className="tech-range-slider"
          />
        </div>

        <div className="quick-price-grid">
          <button
            className={`quick-price-chip ${filters.minPrice === 0 && filters.maxPrice === 3000000 ? 'active' : ''}`}
            onClick={() => setQuickPrice(0, 3000000)}
          >
            Dưới 3 triệu
          </button>
          <button
            className={`quick-price-chip ${filters.minPrice === 3000000 && filters.maxPrice === 15000000 ? 'active' : ''}`}
            onClick={() => setQuickPrice(3000000, 15000000)}
          >
            3 - 15 triệu
          </button>
          <button
            className={`quick-price-chip ${filters.minPrice === 15000000 && filters.maxPrice === 30000000 ? 'active' : ''}`}
            onClick={() => setQuickPrice(15000000, 30000000)}
          >
            15 - 30 triệu
          </button>
          <button
            className={`quick-price-chip ${filters.minPrice === 30000000 && filters.maxPrice === MAX_PRICE_LIMIT ? 'active' : ''}`}
            onClick={() => setQuickPrice(30000000, MAX_PRICE_LIMIT)}
          >
            Trên 30 triệu
          </button>
        </div>
      </div>

      {/* 3. THƯƠNG HIỆU */}
      <div className="filter-group">
        <h4 className="filter-group-label">Thương hiệu Chính hãng</h4>
        <div className="brand-chips-grid">
          {availableBrands.map(brand => {
            const active = filters.brands.includes(brand)
            return (
              <button
                key={brand}
                className={`brand-filter-chip ${active ? 'active' : ''}`}
                onClick={() => toggleBrand(brand)}
              >
                {brand}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. ĐÁNH GIÁ SAO */}
      <div className="filter-group">
        <h4 className="filter-group-label">Đánh giá Khách hàng</h4>
        <div className="rating-filter-list">
          {[5.0, 4.9, 4.8].map(stars => (
            <button
              key={stars}
              className={`rating-filter-row ${filters.minRating === stars ? 'active' : ''}`}
              onClick={() =>
                onChange({ ...filters, minRating: filters.minRating === stars ? 0 : stars })
              }
            >
              <span className="stars-gold">★★★★★</span>
              <span>Từ {stars.toFixed(1)} sao trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. TRẠNG THÁI & ƯU ĐÃI */}
      <div className="filter-group">
        <h4 className="filter-group-label">Dịch vụ & Khuyến mãi</h4>
        <div className="status-toggles-stack">
          <label className="status-checkbox-row">
            <input
              type="checkbox"
              checked={filters.onlyInStock}
              onChange={e => onChange({ ...filters, onlyInStock: e.target.checked })}
            />
            <span>📦 Còn hàng giao ngay</span>
          </label>
          <label className="status-checkbox-row">
            <input
              type="checkbox"
              checked={filters.onlyFreeship}
              onChange={e => onChange({ ...filters, onlyFreeship: e.target.checked })}
            />
            <span>🚚 Freeship Extra 2H</span>
          </label>
          <label className="status-checkbox-row">
            <input
              type="checkbox"
              checked={filters.onlyInstallment0}
              onChange={e => onChange({ ...filters, onlyInstallment0: e.target.checked })}
            />
            <span>💳 Trả góp 0% Lãi suất</span>
          </label>
          <label className="status-checkbox-row">
            <input
              type="checkbox"
              checked={filters.onlyFlashSale}
              onChange={e => onChange({ ...filters, onlyFlashSale: e.target.checked })}
            />
            <span>⚡ Đang Flash Sale Giờ Vàng</span>
          </label>
        </div>
      </div>
    </aside>
  )
}
