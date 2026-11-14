import React, { useState, useEffect, useRef } from 'react'
import type { Product } from '../types'
import { MEGA_CATEGORIES, HOT_SEARCH_KEYWORDS } from '../data/catalog'
import { vnd } from '../api'
import { normalizeVN } from '../utils/aiEngine'

interface HeaderProps {
  products: Product[];
  cartCount: number;
  cartTotal: number;
  compareIds: number[];
  savedVouchersCount: number;
  userCoins: number;
  ordersCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenCompare: () => void;
  onOpenVouchers: (tab?: 'vouchers' | 'gamification') => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onQuickViewProduct: (p: Product) => void;
  onAddToCart: (p: Product, sourceEl: HTMLElement | null) => void;
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  cartCount,
  compareIds,
  savedVouchersCount,
  userCoins,
  ordersCount,
  theme,
  onToggleTheme,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenCompare,
  onOpenVouchers,
  onOpenOrders,
  onOpenAdmin,
  onQuickViewProduct,
  onAddToCart,
  user,
  onOpenAuth
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [hoveredCatId, setHoveredCatId] = useState<string>(MEGA_CATEGORIES[0].id)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('techstore_search_history') || '["MacBook M3", "iPhone 15 Pro Max", "Chuột 8KHz"]')
    } catch {
      return ['MacBook M3', 'iPhone 15 Pro Max', 'Chuột 8KHz']
    }
  })

  const searchRef = useRef<HTMLDivElement>(null)
  const megaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 36)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const saveSearchTerm = (term: string) => {
    const clean = term.replace(/^[^\wÀ-ỹ]+/, '').trim()
    if (!clean) return
    const updated = [clean, ...searchHistory.filter(h => h.toLowerCase() !== clean.toLowerCase())].slice(0, 6)
    setSearchHistory(updated)
    try {
      localStorage.setItem('techstore_search_history', JSON.stringify(updated))
    } catch {}
  }

  const clearHistory = () => {
    setSearchHistory([])
    try {
      localStorage.removeItem('techstore_search_history')
    } catch {}
  }

  // Fuzzy & Vietnamese diacritic-insensitive search
  const normQuery = normalizeVN(searchQuery)
  const fuzzyResults = searchQuery.trim()
    ? products.filter(p => {
        const hay = normalizeVN(`${p.name} ${p.brand} ${p.category} ${p.specs}`)
        const words = normQuery.split(' ').filter(Boolean)
        return words.every(w => hay.includes(w))
      }).slice(0, 6)
    : []

  // Highlight matched keyword helper
  const highlightText = (text: string, query: string) => {
    const cleanQ = query.trim()
    if (!cleanQ) return text
    try {
      const escaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
      return parts.map((part, i) =>
        part.toLowerCase() === cleanQ.toLowerCase() ? (
          <mark key={i} className="search-highlight-mark">{part}</mark>
        ) : (
          part
        )
      )
    } catch {
      return text
    }
  }

  const activeMegaCat = MEGA_CATEGORIES.find(c => c.id === hoveredCatId) || MEGA_CATEGORIES[0]
  const activeMegaProducts = products.filter(p => p.category === activeMegaCat.id).slice(0, 3)

  return (
    <>
      {/* TOP UTILITY & GAMIFICATION BAR */}
      <div className="top-promo-bar">
        <div className="top-promo-inner">
          <div className="top-promo-left">
            <span className="promo-pill">🚀 Giao Hỏa Tốc 2H</span>
            <span className="promo-divider">•</span>
            <span>🛡️ Bảo hành Chính hãng 24 Tháng</span>
            <span className="promo-divider hide-mobile">•</span>
            <span className="hide-mobile">💳 Trả góp 0% Lãi suất</span>
          </div>

          <div className="top-promo-right">
            <button
              className="top-action-link gamification-trigger"
              onClick={() => onOpenVouchers('gamification')}
            >
              🎁 Săn Xu & Vòng Quay ({userCoins.toLocaleString('vi-VN')} Xu)
            </button>
            <button
              className="top-action-link"
              onClick={() => onOpenVouchers('vouchers')}
            >
              🎟️ Kho Voucher ({savedVouchersCount})
            </button>
            <button
              className="top-action-link"
              onClick={onOpenOrders}
            >
              📦 Đơn mua ({ordersCount})
            </button>
            <button
              className="top-action-link admin-portal-btn"
              onClick={onOpenAdmin}
            >
              ⚡ Kênh Người Bán / Admin
            </button>
            <button
              className="theme-toggle-pill"
              onClick={onToggleTheme}
              title="Chuyển đổi giao diện Sáng / Tối"
            >
              {theme === 'dark' ? '☀️ Sáng (Apple Light)' : '🌙 Tối (Obsidian)'}
            </button>
          </div>
        </div>
      </div>

      {/* STICKY GLASS HEADER */}
      <header className={`sticky-glass-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-main-row">
          {/* LOGO & MEGA MENU BUTTON */}
          <div className="brand-and-mega" ref={megaRef}>
            <div
              className="brand-logo-wrap"
              onClick={() => {
                onSelectCategory('Tất cả')
                onSearchChange('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <div className="brand-orb-icon">⚡</div>
              <div>
                <h1 className="brand-title">STOREZ<span className="brand-pro-badge">PRO</span></h1>
                <p className="brand-tagline">FUTURISTIC TECH LUXURY</p>
              </div>
            </div>

            <button
              className={`mega-menu-btn ${megaMenuOpen ? 'active' : ''}`}
              onClick={() => setMegaMenuOpen(prev => !prev)}
            >
              <span className="mega-grid-icon">❖</span>
              <span>Danh mục</span>
              <span className="mega-caret">{megaMenuOpen ? '▲' : '▼'}</span>
            </button>

            {/* INTERACTIVE MEGA MENU */}
            {megaMenuOpen && (
              <div className="mega-menu-dropdown">
                <div className="mega-sidebar-cats">
                  <div
                    className={`mega-cat-item ${selectedCategory === 'Tất cả' ? 'selected' : ''}`}
                    onClick={() => {
                      onSelectCategory('Tất cả')
                      setMegaMenuOpen(false)
                    }}
                  >
                    <span className="mega-cat-icon">🔥</span>
                    <div className="mega-cat-text">
                      <strong>Tất cả Siêu Phẩm</strong>
                      <span>{products.length} sản phẩm sẵn kho</span>
                    </div>
                  </div>
                  {MEGA_CATEGORIES.map(cat => {
                    const count = products.filter(p => p.category === cat.id).length
                    return (
                      <div
                        key={cat.id}
                        className={`mega-cat-item ${hoveredCatId === cat.id ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredCatId(cat.id)}
                        onClick={() => {
                          onSelectCategory(cat.id)
                          setMegaMenuOpen(false)
                        }}
                      >
                        <span className="mega-cat-icon">{cat.icon}</span>
                        <div className="mega-cat-text">
                          <strong>{cat.name}</strong>
                          <span>{cat.subtitle}</span>
                        </div>
                        <span className="mega-cat-count">{count}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="mega-content-showcase">
                  <div className="mega-showcase-header">
                    <div>
                      <span className="mega-badge-pill">{activeMegaCat.badge}</span>
                      <h4>{activeMegaCat.icon} Chuyên trang {activeMegaCat.name}</h4>
                    </div>
                    <button
                      className="mega-view-all-btn"
                      onClick={() => {
                        onSelectCategory(activeMegaCat.id)
                        setMegaMenuOpen(false)
                      }}
                    >
                      Xem tất cả {activeMegaCat.name} →
                    </button>
                  </div>

                  <div className="mega-subtags-row">
                    {activeMegaCat.subTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="mega-subtag-chip"
                        onClick={() => {
                          onSelectCategory(activeMegaCat.id)
                          setMegaMenuOpen(false)
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mega-featured-products-grid">
                    {activeMegaProducts.map(prod => (
                      <div
                        key={prod.id}
                        className="mega-mini-card"
                        onClick={() => {
                          onQuickViewProduct(prod)
                          setMegaMenuOpen(false)
                        }}
                      >
                        <img src={prod.image} alt={prod.name} />
                        <div className="mega-mini-info">
                          <span className="mega-mini-brand">{prod.brand}</span>
                          <h5>{prod.name}</h5>
                          <strong>{vnd(prod.price)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INSTANT SMART SEARCH BAR */}
          <div className="smart-search-wrapper" ref={searchRef}>
            <div className={`smart-search-box ${searchFocused ? 'focused' : ''}`}>
              <span className="search-lens-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={e => {
                  onSearchChange(e.target.value)
                  setSearchFocused(true)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    saveSearchTerm(searchQuery)
                    setSearchFocused(false)
                  }
                }}
                placeholder="Tìm nhanh: MacBook M3, iPhone 15 Titan, Chuột 8KHz, Laptop IT..."
              />
              {searchQuery && (
                <button
                  className="search-clear-x"
                  onClick={() => onSearchChange('')}
                >
                  ✕
                </button>
              )}
              <button
                className="search-submit-pill"
                onClick={() => {
                  if (searchQuery.trim()) saveSearchTerm(searchQuery)
                  setSearchFocused(false)
                }}
              >
                Tìm kiếm
              </button>
            </div>

            {/* SMART SEARCH DROPDOWN */}
            {searchFocused && (
              <div className="smart-search-dropdown">
                {searchQuery.trim().length === 0 ? (
                  <div className="search-discovery-pane">
                    {searchHistory.length > 0 && (
                      <div className="search-block">
                        <div className="search-block-head">
                          <span>🕒 Lịch sử tìm kiếm</span>
                          <button onClick={clearHistory}>Xóa tất cả</button>
                        </div>
                        <div className="search-chips-wrap">
                          {searchHistory.map((item, idx) => (
                            <button
                              key={idx}
                              className="history-chip"
                              onClick={() => {
                                onSearchChange(item)
                                setSearchFocused(false)
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="search-block">
                      <div className="search-block-head">
                        <span>🔥 Từ khóa xu hướng hôm nay</span>
                      </div>
                      <div className="search-chips-wrap">
                        {HOT_SEARCH_KEYWORDS.map((kw, idx) => {
                          const cleanKw = kw.replace(/^[^\wÀ-ỹ]+\s*/, '')
                          return (
                            <button
                              key={idx}
                              className="hot-kw-chip"
                              onClick={() => {
                                saveSearchTerm(cleanKw)
                                onSearchChange(cleanKw)
                                setSearchFocused(false)
                              }}
                            >
                              {kw}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="search-live-results">
                    <div className="search-block-head">
                      <span>⚡ Gợi ý tức thì cho "{searchQuery}" ({fuzzyResults.length} kết quả)</span>
                    </div>
                    {fuzzyResults.length === 0 ? (
                      <div className="search-empty-state">
                        Không tìm thấy sản phẩm khớp với "<strong>{searchQuery}</strong>". Hãy thử từ khóa như "MacBook", "iPhone", "ASUS", "Chuột"...
                      </div>
                    ) : (
                      fuzzyResults.map(p => (
                        <div key={p.id} className="search-result-row">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="search-result-thumb"
                            onClick={() => {
                              saveSearchTerm(searchQuery)
                              onQuickViewProduct(p)
                              setSearchFocused(false)
                            }}
                          />
                          <div
                            className="search-result-meta"
                            onClick={() => {
                              saveSearchTerm(searchQuery)
                              onQuickViewProduct(p)
                              setSearchFocused(false)
                            }}
                          >
                            <div className="search-result-title">
                              {highlightText(p.name, searchQuery)}
                            </div>
                            <div className="search-result-sub">
                              <span className="search-cat-tag">{p.category}</span>
                              <span>•</span>
                              <span>{p.brand}</span>
                              <span>•</span>
                              <span>⭐ {p.rating || 4.9}</span>
                            </div>
                            <div className="search-result-price">
                              <strong>{vnd(p.price)}</strong>
                              {p.oldPrice && <del>{vnd(p.oldPrice)}</del>}
                            </div>
                          </div>
                          <button
                            className="search-quick-add-btn"
                            onClick={(e) => {
                              saveSearchTerm(searchQuery)
                              onAddToCart(p, e.currentTarget)
                            }}
                          >
                            + Giỏ
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="header-actions-group">
            <button
              className={`header-icon-btn ${compareIds.length > 0 ? 'has-badge' : ''}`}
              onClick={onOpenCompare}
              title="So sánh thông số kỹ thuật"
            >
              <span className="btn-emoji">⚖️</span>
              <span className="btn-label hide-tablet">So sánh</span>
              {compareIds.length > 0 && (
                <span className="badge-counter compare-badge">{compareIds.length}/3</span>
              )}
            </button>

            {user ? (
              <button className="header-icon-btn user-logged-pill" onClick={onOpenOrders}>
                <span className="btn-emoji">👨‍🚀</span>
                <span className="btn-label hide-tablet">{user.name}</span>
              </button>
            ) : (
              <button className="header-icon-btn" onClick={onOpenAuth}>
                <span className="btn-emoji">👤</span>
                <span className="btn-label hide-tablet">Tài khoản</span>
              </button>
            )}

            <button
              id="header-cart-btn"
              className="header-cart-luxury-btn"
              onClick={onOpenCart}
            >
              <span className="cart-icon-wrap">🛒</span>
              <div className="cart-btn-text">
                <span className="cart-label">Giỏ hàng</span>
                <span className="cart-count-pill">{cartCount}</span>
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
