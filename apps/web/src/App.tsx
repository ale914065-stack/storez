import React, { useState, useEffect, useMemo } from 'react'
import { api, type Product, type Cart, type OrderRecord } from './api'
import type { FilterState, ReviewItem, Voucher } from './types'
import { FALLBACK_PRODUCTS, DEFAULT_VOUCHERS, INITIAL_REVIEWS } from './data/catalog'
import { normalizeVN } from './utils/aiEngine'
import { triggerFlyToCart } from './utils/flyToCart'
import { Header } from './components/Header'
import { HeroBanner3D } from './components/HeroBanner3D'
import { TechMarquee } from './components/TechMarquee'
import { FlashSaleSection } from './components/FlashSaleSection'
import { FilterSidebar } from './components/FilterSidebar'
import { ProductCard } from './components/ProductCard'
import { ProductDetailModal } from './components/ProductDetailModal'
import { CompareModal } from './components/CompareModal'
import { CartDrawerAndCheckout } from './components/CartDrawerAndCheckout'
import { VoucherAndGamificationModal } from './components/VoucherAndGamificationModal'
import { AIConcierge } from './components/AIConcierge'
import { AdminDashboard } from './components/AdminDashboard'
import { MobileBottomNav } from './components/MobileBottomNav'

const INITIAL_FILTERS: FilterState = {
  category: 'Tất cả',
  minPrice: 0,
  maxPrice: 70000000,
  brands: [],
  minRating: 0,
  onlyInStock: false,
  onlyFreeship: false,
  onlyInstallment0: false,
  onlyFlashSale: false,
  sortBy: 'popular'
}

export default function App() {
  // 1. Theme State (Obsidian Dark vs Clean Apple Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('storez_theme') as 'dark' | 'light') || 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('storez_theme', theme)
    } catch {}
  }, [theme])

  // 2. Catalog, Cart, Orders, Reviews, Vouchers & Gamification State
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS)
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, count: 0 })
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS)
  const [vouchers, setVouchers] = useState<Voucher[]>(DEFAULT_VOUCHERS)
  const [savedVoucherCodes, setSavedVoucherCodes] = useState<string[]>(['FREESHIPMAX', 'TECH10'])
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>('TECH10')
  const [userCoins, setUserCoins] = useState<number>(80000)
  const [useCoinsInCart, setUseCoinsInCart] = useState<boolean>(true)
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false)
  const [spinsLeft, setSpinsLeft] = useState<number>(2)

  // 3. Filter, Search, Skeleton & Compare State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(false)
  const [compareIds, setCompareIds] = useState<number[]>([1, 2])

  // 4. Modals & Drawers State
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [voucherModalOpen, setVoucherModalOpen] = useState(false)
  const [voucherModalTab, setVoucherModalTab] = useState<'vouchers' | 'gamification'>('vouchers')
  const [adminOpen, setAdminOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiExternalPrompt, setAiExternalPrompt] = useState<string | undefined>(undefined)

  // 5. Auth & Toast State
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => {
      setToastMsg(prev => (prev === msg ? null : prev))
    }, 3200)
  }

  // Initial Data Load from Cloudflare Worker API
  useEffect(() => {
    Promise.all([api.products(), api.cart(), api.orders()]).then(([pList, cData, oList]) => {
      if (Array.isArray(pList) && pList.length > 0) setProducts(pList)
      if (cData) setCart(cData)
      if (Array.isArray(oList) && oList.length > 0) setOrders(oList)
    })
  }, [])

  const triggerSkeletonEffect = () => {
    setIsSkeletonLoading(true)
    setTimeout(() => setIsSkeletonLoading(false), 220)
  }

  // Add to cart with Parabolic Fly-to-Cart animation + Confetti + Resilient Local/API sync
  const handleAddToCart = (
    product: Product,
    sourceEl: HTMLElement | null,
    selectedColor?: string,
    selectedStorage?: string,
    unitPrice?: number
  ) => {
    const effectivePrice = unitPrice ?? product.price

    triggerFlyToCart(sourceEl, product.image, () => {
      showToast(`🛒 Đã thêm "${product.name}" vào giỏ hàng!`)
    })

    // Optimistic instant cart update
    setCart(prev => {
      const existing = prev.items.find(i => i.product.id === product.id)
      const nextItems = existing
        ? prev.items.map(i =>
            i.product.id === product.id
              ? {
                  ...i,
                  qty: i.qty + 1,
                  selectedColor: selectedColor || i.selectedColor,
                  selectedStorage: selectedStorage || i.selectedStorage,
                  product: { ...i.product, price: effectivePrice }
                }
              : i
          )
        : [
            ...prev.items,
            {
              product: { ...product, price: effectivePrice },
              qty: 1,
              selectedColor,
              selectedStorage
            }
          ]
      return {
        items: nextItems,
        total: nextItems.reduce((s, i) => s + i.product.price * i.qty, 0),
        count: nextItems.reduce((s, i) => s + i.qty, 0)
      }
    })

    // Sync with Cloudflare KV via API
    api
      .add(product.id, 1, selectedColor, selectedStorage, effectivePrice)
      .then(serverCart => {
        if (serverCart && serverCart.items) setCart(serverCart)
      })
      .catch(() => {})
  }

  const handleUpdateCartQty = (productId: number, qty: number) => {
    setCart(prev => {
      const nextItems =
        qty > 0
          ? prev.items.map(i => (i.product.id === productId ? { ...i, qty } : i))
          : prev.items.filter(i => i.product.id !== productId)
      return {
        items: nextItems,
        total: nextItems.reduce((s, i) => s + i.product.price * i.qty, 0),
        count: nextItems.reduce((s, i) => s + i.qty, 0)
      }
    })
    api.setQty(productId, qty).then(c => c && setCart(c)).catch(() => {})
  }

  const handleClearCart = () => {
    setCart({ items: [], total: 0, count: 0 })
    api.clear().catch(() => {})
  }

  // Toggle Product Comparison (Max 3)
  const handleToggleCompare = (product: Product) => {
    setCompareIds(prev => {
      if (prev.includes(product.id)) {
        showToast(`Đã bỏ "${product.name}" khỏi bảng so sánh`)
        return prev.filter(id => id !== product.id)
      }
      if (prev.length >= 3) {
        showToast('⚠️ Tối đa 3 sản phẩm so sánh cùng lúc! Đã thay thế sản phẩm cuối.')
        return [...prev.slice(0, 2), product.id]
      }
      showToast(`⚖️ Đã thêm "${product.name}" vào bảng So sánh (${prev.length + 1}/3)`)
      return [...prev, product.id]
    })
  }

  // Place Order
  const handlePlaceOrder = (orderData: Partial<OrderRecord>, coinsUsed: number) => {
    const fullOrder = orderData as OrderRecord
    setOrders(prev => [fullOrder, ...prev])
    if (coinsUsed > 0) {
      setUserCoins(prev => Math.max(0, prev - coinsUsed))
    }
    handleClearCart()
    api.createOrder(fullOrder).catch(() => {})
    showToast(`🎉 Đặt hàng thành công! Mã đơn: ${fullOrder.id}`)
  }

  // Admin CRUD handlers
  const handleAdminAddProduct = (prod: Partial<Product>) => {
    const newId = products.reduce((m, p) => Math.max(m, p.id), 900) + 1
    const created: Product = {
      id: newId,
      name: prod.name || 'Sản phẩm mới',
      description: prod.description || '',
      price: prod.price || 15000000,
      oldPrice: prod.oldPrice || 18000000,
      image: prod.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
      category: prod.category || 'Laptop',
      brand: prod.brand || 'Apple',
      specs: prod.specs || 'Cấu hình: Cao cấp|Bảo hành: 24 tháng',
      rating: 5.0,
      reviewCount: 15,
      soldCount: 40,
      stock: prod.stock ?? 20,
      freeship: 1,
      installment0: 1,
      isFlashSale: prod.isFlashSale ?? 1,
      flashSalePrice: prod.flashSalePrice || prod.price || 14000000
    }
    setProducts(prev => [created, ...prev])
    api.createProduct(created).catch(() => {})
    showToast(`✅ Admin: Đã thêm "${created.name}" lên sàn!`)
  }

  const handleAdminUpdateProduct = (id: number, prod: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prod, id } : p)))
    api.updateProduct(id, prod).catch(() => {})
    showToast(`💾 Admin: Đã cập nhật sản phẩm #${id}!`)
  }

  const handleAdminDeleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    api.deleteProduct(id).catch(() => {})
    showToast(`🗑️ Admin: Đã xóa sản phẩm #${id}`)
  }

  const handleAdminUpdateOrderStatus = (orderId: string, status: OrderRecord['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
    api.updateOrderStatus(orderId, status).catch(() => {})
    showToast(`📦 Admin: Đã cập nhật trạng thái đơn ${orderId}!`)
  }

  // Available categories & brands for filter
  const availableCategories = useMemo(
    () => ['Tất cả', ...Array.from(new Set(products.map(p => p.category || 'Khác')))],
    [products]
  )
  const availableBrands = useMemo(
    () => Array.from(new Set(products.map(p => p.brand || 'Apple'))),
    [products]
  )

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const normSearch = normalizeVN(searchQuery)

    const list = products.filter(p => {
      if (filters.category !== 'Tất cả' && p.category !== filters.category) return false
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false
      if (filters.brands.length > 0 && (!p.brand || !filters.brands.includes(p.brand))) return false
      if (filters.minRating > 0 && (p.rating || 4.9) < filters.minRating) return false
      if (filters.onlyInStock && (p.stock ?? 20) <= 0) return false
      if (filters.onlyFreeship && p.freeship === 0) return false
      if (filters.onlyInstallment0 && p.installment0 === 0) return false
      if (filters.onlyFlashSale && p.isFlashSale !== 1) return false

      if (normSearch) {
        const hay = normalizeVN(`${p.name} ${p.brand} ${p.category} ${p.specs} ${p.description}`)
        const words = normSearch.split(' ').filter(Boolean)
        if (!words.every(w => hay.includes(w))) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price
      if (filters.sortBy === 'price-desc') return b.price - a.price
      if (filters.sortBy === 'rating') return (b.rating || 4.9) - (a.rating || 4.9)
      if (filters.sortBy === 'discount') {
        const discA = (a.oldPrice || a.price * 1.15) - a.price
        const discB = (b.oldPrice || b.price * 1.15) - b.price
        return discB - discA
      }
      return (b.soldCount || 200) - (a.soldCount || 200)
    })
  }, [products, filters, searchQuery])

  const compareProducts = useMemo(
    () => compareIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p)),
    [compareIds, products]
  )

  return (
    <div className="storez-app-shell">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="luxury-toast-banner">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* STICKY GLASS HEADER & MEGA MENU */}
      <Header
        products={products}
        cartCount={cart.count}
        cartTotal={cart.total}
        compareIds={compareIds}
        savedVouchersCount={savedVoucherCodes.length}
        userCoins={userCoins}
        ordersCount={orders.length}
        theme={theme}
        onToggleTheme={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
        selectedCategory={filters.category}
        onSelectCategory={cat => {
          triggerSkeletonEffect()
          setFilters(prev => ({ ...prev, category: cat }))
          const el = document.getElementById('catalog-anchor')
          if (cat !== 'Tất cả' && el) el.scrollIntoView({ behavior: 'smooth' })
        }}
        searchQuery={searchQuery}
        onSearchChange={q => setSearchQuery(q)}
        onOpenCart={() => setCartOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenVouchers={(tab = 'vouchers') => {
          setVoucherModalTab(tab)
          setVoucherModalOpen(true)
        }}
        onOpenOrders={() => setOrdersOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onQuickViewProduct={p => setQuickViewProduct(p)}
        onAddToCart={(p, el) => handleAddToCart(p, el)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="storez-main-container">
        {/* 1. 3D PARALLAX HERO SHOWCASE & BENTO */}
        <HeroBanner3D
          products={products}
          onQuickView={p => setQuickViewProduct(p)}
          onAddToCart={(p, el) => handleAddToCart(p, el)}
          onOpenAI={prompt => {
            setAiExternalPrompt(prompt)
            setAiOpen(true)
          }}
          onOpenVouchers={() => {
            setVoucherModalTab('vouchers')
            setVoucherModalOpen(true)
          }}
        />

        {/* 1.5 BĂNG CHUYỀN SẢN PHẨM HOT CHẠY VÔ TẬN */}
        <TechMarquee products={products} onQuickView={p => setQuickViewProduct(p)} />

        {/* 2. FLASH SALE GIỜ VÀNG (SHOPEE / LAZADA STYLE) */}
        <FlashSaleSection
          products={products}
          onQuickView={p => setQuickViewProduct(p)}
          onAddToCart={(p, el) => handleAddToCart(p, el)}
        />

        {/* 3. MULTI-LAYER FILTER & MAIN PRODUCT CATALOG (AMAZON STYLE) */}
        <section className="catalog-workspace-section" id="catalog-anchor">
          <FilterSidebar
            filters={filters}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            totalMatched={filteredProducts.length}
            onChange={next => {
              triggerSkeletonEffect()
              setFilters(next)
            }}
            onReset={() => {
              triggerSkeletonEffect()
              setFilters(INITIAL_FILTERS)
              setSearchQuery('')
            }}
          />

          <div className="catalog-main-column">
            {/* CATALOG TOOLBAR & SORT */}
            <div className="catalog-toolbar-bar">
              <div className="catalog-heading-info">
                <h2>
                  {searchQuery
                    ? `🔍 Kết quả cho "${searchQuery}"`
                    : filters.category === 'Tất cả'
                    ? '❖ TẤT CẢ SIÊU PHẨM ĐỒ CÔNG NGHỆ & ĐIỆN TỬ'
                    : `❖ CHUYÊN TRANG: ${filters.category.toUpperCase()}`}
                </h2>
                <span className="catalog-count-tag">{filteredProducts.length} sản phẩm</span>
              </div>

              <div className="catalog-sort-controls">
                <span>Sắp xếp theo:</span>
                {[
                  { key: 'popular', label: '🔥 Bán chạy' },
                  { key: 'price-asc', label: '↑ Giá thấp - cao' },
                  { key: 'price-desc', label: '↓ Giá cao - thấp' },
                  { key: 'discount', label: '⚡ Giảm giá sâu' },
                  { key: 'rating', label: '⭐ Đánh giá cao' }
                ].map(st => (
                  <button
                    key={st.key}
                    className={`sort-pill-btn ${filters.sortBy === st.key ? 'active' : ''}`}
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        sortBy: st.key as FilterState['sortBy']
                      }))
                    }
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SKELETON LOADING OR PRODUCT GRID */}
            {isSkeletonLoading ? (
              <div className="luxury-product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className="skeleton-product-card" key={i}>
                    <div className="skeleton-shimmer skel-img" />
                    <div className="skeleton-shimmer skel-line short" />
                    <div className="skeleton-shimmer skel-line" />
                    <div className="skeleton-shimmer skel-line" />
                    <div className="skeleton-shimmer skel-btn" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="catalog-empty-state">
                <div className="empty-orb">🔍</div>
                <h3>Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại</h3>
                <p>Hãy thử nới rộng khoảng giá hoặc đặt lại bộ lọc để xem toàn bộ 24 siêu phẩm công nghệ.</p>
                <button
                  className="btn-reset-filters-big"
                  onClick={() => {
                    setFilters(INITIAL_FILTERS)
                    setSearchQuery('')
                  }}
                >
                  ↺ Đặt Lại Toàn Bộ Bộ Lọc
                </button>
              </div>
            ) : (
              <div className="luxury-product-grid">
                {filteredProducts.map(prod => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isCompared={compareIds.includes(prod.id)}
                    onToggleCompare={handleToggleCompare}
                    onQuickView={p => setQuickViewProduct(p)}
                    onAddToCart={(p, el, col) => handleAddToCart(p, el, col)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* LUXURY FOOTER */}
      <footer className="storez-luxury-footer">
        <div className="footer-inner-grid">
          <div className="footer-col-brand">
            <div className="brand-logo-wrap">
              <div className="brand-orb-icon">⚡</div>
              <div>
                <h2 className="brand-title">STOREZ<span className="brand-pro-badge">PRO</span></h2>
                <p className="brand-tagline">SIÊU SÀN CÔNG NGHỆ SỐ 1 VIỆT NAM</p>
              </div>
            </div>
            <p className="footer-desc">
              Hệ sinh thái bán lẻ Laptop, Smartphone, PC Hi-End & Gaming Gear chính hãng vận hành trên nền tảng đám mây biên Cloudflare Workers tốc độ ánh sáng.
            </p>
            <div className="footer-trust-badges">
              <span>🛡️ Ủy Quyền Apple VN/A</span>
              <span>⚡ Giao Hỏa Tốc 2H</span>
              <span>💳 VietQR Napas 247</span>
            </div>
          </div>

          <div className="footer-col-links">
            <h4>Danh Mục Trọng Điểm</h4>
            <ul>
              <li onClick={() => setFilters({ ...INITIAL_FILTERS, category: 'Laptop' })}>Laptop Gaming & MacBook M3</li>
              <li onClick={() => setFilters({ ...INITIAL_FILTERS, category: 'Điện thoại' })}>iPhone 15 Pro Max & Galaxy AI</li>
              <li onClick={() => setFilters({ ...INITIAL_FILTERS, category: 'Gaming Gear' })}>Bàn Phím Cơ Custom & Chuột 8KHz</li>
              <li onClick={() => setFilters({ ...INITIAL_FILTERS, category: 'PC & Linh kiện' })}>PC RTX 4090 & Màn hình 2K 180Hz</li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h4>Đặc Quyền Khách Hàng VIP</h4>
            <ul>
              <li onClick={() => setAiOpen(true)}>🤖 Trợ lý AI Tư vấn Cấu hình 24/7</li>
              <li onClick={() => setCompareOpen(true)}>⚖️ So sánh Thông số Kỹ thuật Trực tiếp</li>
              <li onClick={() => { setVoucherModalTab('gamification'); setVoucherModalOpen(true) }}>🎁 Điểm danh nhận Xu & Vòng quay</li>
              <li onClick={() => setOrdersOpen(true)}>📦 Tra cứu Hành trình Đơn hàng</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <span>© 2026 STOREZ PRO TECH LUXURY • Powered by Cloudflare Workers, D1, KV & Edge AI</span>
          <span>Thiết kế chuẩn Apple Store • Amazon • Shopee</span>
        </div>
      </footer>

      {/* MODALS & OVERLAYS */}
      <ProductDetailModal
        product={quickViewProduct}
        allProducts={products}
        reviews={reviews}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, el, col, st, price) => handleAddToCart(p, el, col, st, price)}
        onAddReview={rev => {
          setReviews(prev => [rev, ...prev])
          showToast('⭐ Cảm ơn bạn đã gửi đánh giá sản phẩm!')
        }}
        onToggleCompare={handleToggleCompare}
        onSelectOtherProduct={p => setQuickViewProduct(p)}
      />

      <CompareModal
        compareProducts={compareProducts}
        allProducts={products}
        isOpen={compareOpen}
        onOpen={() => setCompareOpen(true)}
        onClose={() => setCompareOpen(false)}
        onRemoveProduct={id => setCompareIds(prev => prev.filter(x => x !== id))}
        onAddProduct={p => handleToggleCompare(p)}
        onClearAll={() => setCompareIds([])}
        onAddToCart={(p, el) => handleAddToCart(p, el)}
      />

      <CartDrawerAndCheckout
        cart={cart}
        isOpen={cartOpen}
        checkoutOpen={checkoutOpen}
        ordersOpen={ordersOpen}
        vouchers={vouchers}
        savedVoucherCodes={savedVoucherCodes}
        selectedVoucherCode={selectedVoucherCode}
        userCoins={userCoins}
        useCoinsInCart={useCoinsInCart}
        orders={orders}
        onCloseCart={() => setCartOpen(false)}
        onOpenCheckout={() => setCheckoutOpen(true)}
        onCloseCheckout={() => setCheckoutOpen(false)}
        onOpenOrders={() => setOrdersOpen(true)}
        onCloseOrders={() => setOrdersOpen(false)}
        onSelectVoucher={code => {
          setSelectedVoucherCode(code)
          if (code) showToast(`🎟️ Đã áp dụng mã giảm giá ${code}!`)
        }}
        onToggleUseCoins={val => setUseCoinsInCart(val)}
        onUpdateQty={handleUpdateCartQty}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
      />

      <VoucherAndGamificationModal
        isOpen={voucherModalOpen}
        initialTab={voucherModalTab}
        vouchers={vouchers}
        savedVoucherCodes={savedVoucherCodes}
        selectedVoucherCode={selectedVoucherCode}
        userCoins={userCoins}
        checkedInToday={checkedInToday}
        spinsLeft={spinsLeft}
        onClose={() => setVoucherModalOpen(false)}
        onSaveVoucher={code => {
          setSavedVoucherCodes(prev => (prev.includes(code) ? prev : [...prev, code]))
          showToast(`🎟️ Đã lưu mã ${code} vào Ví Voucher!`)
        }}
        onApplyVoucher={code => {
          setSelectedVoucherCode(code)
          showToast(`✅ Đã kích hoạt mã ${code} cho giỏ hàng của bạn!`)
        }}
        onDailyCheckIn={() => {
          if (!checkedInToday) {
            setCheckedInToday(true)
            setUserCoins(prev => prev + 50000)
            showToast('🎁 Điểm danh thành công! Bạn nhận được +50.000 Xu')
          }
        }}
        onWinSpinPrize={(type, payload, msg) => {
          setSpinsLeft(prev => Math.max(0, prev - 1))
          if (type === 'coins' && typeof payload === 'number') {
            setUserCoins(prev => prev + payload)
          } else if (type === 'voucher' && typeof payload === 'object') {
            setVouchers(prev => (prev.some(v => v.code === payload.code) ? prev : [payload, ...prev]))
            setSavedVoucherCodes(prev => (prev.includes(payload.code) ? prev : [...prev, payload.code]))
            setSelectedVoucherCode(payload.code)
          }
          showToast(msg)
        }}
      />

      <AIConcierge
        products={products}
        isOpen={aiOpen}
        externalPrompt={aiExternalPrompt}
        onOpen={() => setAiOpen(true)}
        onClose={() => setAiOpen(false)}
        onClearExternalPrompt={() => setAiExternalPrompt(undefined)}
        onQuickViewProduct={p => setQuickViewProduct(p)}
        onAddToCart={(p, el) => handleAddToCart(p, el)}
      />

      <AdminDashboard
        isOpen={adminOpen}
        products={products}
        orders={orders}
        onClose={() => setAdminOpen(false)}
        onAddProduct={handleAdminAddProduct}
        onUpdateProduct={handleAdminUpdateProduct}
        onDeleteProduct={handleAdminDeleteProduct}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
      />

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="modal-backdrop-glass" onClick={() => setAuthModalOpen(false)}>
          <div className="luxury-auth-modal" onClick={e => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h2>👤 ĐĂNG NHẬP THÀNH VIÊN VIP STOREZ PRO</h2>
              <button className="pdp-close-btn" onClick={() => setAuthModalOpen(false)}>✕</button>
            </div>
            <form
              className="luxury-auth-form"
              onSubmit={e => {
                e.preventDefault()
                const name = authEmail.split('@')[0] || 'Minh Quân VIP'
                setUser({ name, email: authEmail })
                setAuthModalOpen(false)
                showToast(`👋 Chào mừng ${name} quay trở lại Storez Pro!`)
              }}
            >
              <label>Email hoặc Số điện thoại</label>
              <input
                type="email"
                placeholder="vip@storez.vn"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required
              />
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPass}
                onChange={e => setAuthPass(e.target.value)}
                required
              />
              <button type="submit" className="btn-auth-submit">
                🚀 ĐĂNG NHẬP & ĐỒNG BỘ ĐẶC QUYỀN VIP
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        cartCount={cart.count}
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onFlashSale={() => {
          const el = document.getElementById('flash-sale-section')
          el?.scrollIntoView({ behavior: 'smooth' })
        }}
        onVouchers={() => {
          setVoucherModalTab('gamification')
          setVoucherModalOpen(true)
        }}
        onOpenAI={() => setAiOpen(true)}
        onOpenCart={() => setCartOpen(true)}
      />
    </div>
  )
}
