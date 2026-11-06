import { useEffect, useState, useRef } from 'react'
import { api, vnd, type Cart, type Product } from './api'

const emptyCart: Cart = { items: [], total: 0, count: 0 }
type ChatMessage = { role: 'user' | 'assistant'; text: string; product?: Product | null }
type User = { name: string; email: string } | null
type AppProduct = Product & { 
  category?: string; 
  brand?: string; 
  specs?: string;
  colors?: string; // Chuỗi JSON chứa danh sách màu sắc của sản phẩm
};

export default function App() {
  const [products, setProducts] = useState<AppProduct[]>([])
  const [cart, setCart] = useState<Cart>(emptyCart)
  const [openCart, setOpenCart] = useState(false)
  const [error, setError] = useState('')

  const [currentPage, setCurrentPage] = useState<'shop' | 'login'>('shop')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<User>(null)
  const [inputEmail, setInputEmail] = useState('')
  const [inputPassword, setInputPassword] = useState('')

  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: '👋 Xin chào! Tôi là Trợ lý AI cao cấp của TechStore Pro. Tôi có thể giúp gì cho bạn hôm nay?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quản lý trạng thái ảnh hiển thị theo từng sản phẩm khi chọn màu (productId -> activeImgUrl)
  const [productImages, setProductImages] = useState<Record<number, string>>({})

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, chatLoading])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  useEffect(() => {
    Promise.all([api.products(), api.cart()])
      .then(([p, c]) => {
        setProducts(p as AppProduct[])
        setCart(c)
      })
      .catch((e) => setError(e.message))
  }, [])

  const run = (p: Promise<Cart>) => p.then(setCart).catch((e) => setError(e.message))

  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    
    setChatMessages(prev => [...prev, { role: 'user', text }])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ message: text }) 
      })
      const data = await res.json()
      let aiText = "Dạ, hệ thống đang xử lý yêu cầu của bạn!"
      let matchedProd: Product | null = null

      if (data.ok) {
        aiText = typeof data.response === 'string' ? data.response : JSON.stringify(data.response)
        matchedProd = data.product || null
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: aiText, product: matchedProd }])
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Kết nối gián đoạn, vui lòng thử lại!" }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUser({ name: inputEmail.split('@')[0] || 'Thành viên', email: inputEmail })
    setCurrentPage('shop')
  }

  const suggestedProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const displayProducts = searchQuery.length > 0 && !isSearching 
    ? suggestedProducts 
    : products.filter(p => selectedCategory === 'Tất cả' || p.category === selectedCategory)

  const categories = ['Tất cả', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  const getOldPrice = (price: number, id: number) => {
    const multiplier = 1.15 + (id % 10) * 0.01;
    return price * multiplier;
  }

  return (
    <div className="ecommerce-layout">
      {currentPage === 'login' ? (
        <div className="full-auth-page">
          <div className="auth-card-container">
            <div className="auth-card-header">
              <h2>TECHSTORE</h2>
              <p>Hệ thống Đăng nhập / Đăng ký</p>
            </div>
            <div className="auth-tabs">
              <button className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Đăng nhập</button>
              <button className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Đăng ký</button>
            </div>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <div className="form-group">
                <label>Email đăng nhập</label>
                <input type="email" className="auth-input-field" value={inputEmail} onChange={e => setInputEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" className="auth-input-field" value={inputPassword} onChange={e => setInputPassword(e.target.value)} required />
              </div>
              <button type="submit" className="auth-submit-btn">ĐĂNG NHẬP HỆ THỐNG</button>
            </form>
            <button className="back-link" onClick={() => setCurrentPage('shop')}>← Quay lại cửa hàng</button>
          </div>
        </div>
      ) : (
        <>
          {(menuOpen || openCart) && <div className="overlay" onClick={() => { setMenuOpen(false); setOpenCart(false); }} />}

          <aside className={`left-drawer ${menuOpen ? 'open' : ''}`}>
            <div className="drawer-head">
              <h2>☰ DANH MỤC</h2>
              <button className="close-btn" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="drawer-body">
              <div className="menu-category-group">
                <div className="menu-category-title">Tất cả sản phẩm</div>
                {categories.map(cat => (
                  <div 
                    key={cat} 
                    className={`menu-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat as string); setMenuOpen(false); setSearchQuery(''); }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <aside className={`right-drawer ${openCart ? 'open' : ''}`}>
            <div className="drawer-head">
              <h2>GIỎ HÀNG ({cart.count})</h2>
              <button className="close-btn" onClick={() => setOpenCart(false)}>✕</button>
            </div>
            <div className="drawer-body">
              {cart.items.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem'}}>Giỏ hàng trống</p>}
              {cart.items.map(({ product: p, qty }) => (
                <div className="cart-item" key={p.id}>
                  <img src={p.image} alt="" className="cart-item-img" />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{p.name}</span>
                    <span className="cart-item-price">{vnd(p.price)}</span>
                    <div className="qty-control">
                      <button onClick={() => run(api.setQty(p.id, qty - 1))}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => run(api.setQty(p.id, qty + 1))}>+</button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => run(api.setQty(p.id, 0))}>✕</button>
                </div>
              ))}
            </div>
            {cart.count > 0 && (
              <div className="drawer-foot">
                <div className="total-summary"><span>Tổng thanh toán:</span><strong className="total-amount">{vnd(cart.total)}</strong></div>
                <button className="checkout-btn">TIẾN HÀNH ĐẶT HÀNG</button>
              </div>
            )}
          </aside>

          <header className="main-header">
            <div className="header-container">
              <div className="logo-section">
                <button className="cat-menu-btn" onClick={() => setMenuOpen(true)}>
                  <span className="hamburger-icon">☰</span> Danh mục
                </button>
                <div style={{ marginLeft: '1rem', cursor: 'pointer' }} onClick={() => { setCurrentPage('shop'); setSelectedCategory('Tất cả'); setSearchQuery(''); }}>
                  <h1 className="logo-text">TECHSTORE</h1>
                </div>
              </div>
              
              <div className="search-container" ref={searchRef}>
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Bạn tìm máy gì hôm nay? (VD: iPhone, MacBook, ATK...)" 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                  />
                  <span className="search-btn">🔍</span>
                </div>
                
                {/* AUTOCOMPLETE DROPDOWN */}
                {isSearching && searchQuery.length > 0 && (
                  <div className="search-suggestions">
                    {suggestedProducts.length > 0 ? (
                      suggestedProducts.slice(0, 5).map(p => (
                        <div key={p.id} className="suggestion-item" onClick={() => { setSearchQuery(p.name); setIsSearching(false); }}>
                          <img src={p.image} className="suggestion-img" alt="" />
                          <div className="suggestion-info">
                            <span className="suggestion-name">{p.name}</span>
                            <span className="suggestion-price">{vnd(p.price)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{padding: '1rem', color: 'var(--text-muted)', textAlign: 'center'}}>
                        Không tìm thấy "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <nav className="main-nav">
                {user ? (
                  <strong style={{color: 'var(--primary-accent)'}}>👋 Chào, {user.name}</strong>
                ) : (
                  <button className="login-btn-modern" onClick={() => setCurrentPage('login')}>Đăng nhập</button>
                )}
                <button className="cart-btn-modern" onClick={() => setOpenCart(true)}>
                  🛒 Giỏ hàng
                  {cart.count > 0 && ` (${cart.count})`}
                </button>
              </nav>
            </div>
          </header>

          <main className="main-content">
            {error && <div className="error-alert">⚠️ Lỗi: {error}</div>}
            
            <div className="section-title">
              <h3>
                {searchQuery.length > 0 && !isSearching 
                  ? `Kết quả tìm kiếm cho: "${searchQuery}"` 
                  : (selectedCategory === 'Tất cả' ? '🔥 DEAL SỐC CUỐI TUẦN & GAMING GEAR' : `DANH MỤC: ${selectedCategory.toUpperCase()}`)
                }
              </h3>
            </div>

            <div className="product-grid">
              {displayProducts.length === 0 && <p style={{color: 'var(--text-muted)'}}>Không có sản phẩm nào phù hợp.</p>}
              
              {displayProducts.map((p) => {
                const oldPrice = getOldPrice(p.price, p.id);
                const discountPercent = Math.round((1 - (p.price / oldPrice)) * 100);

                // Lấy ảnh hiện tại (hoặc ảnh mặc định của sản phẩm)
                const currentImg = productImages[p.id] || p.image;
                
                // Parse danh sách màu sắc nếu có
                let colorList: Array<{ name: string; hex: string; img: string }> = [];
                try {
                  colorList = p.colors ? JSON.parse(p.colors) : [];
                } catch (e) {}

                return (
                  <article className="product-card" key={p.id}>
                    <div className="discount-badge">Giảm {discountPercent}%</div>
                    <div className="installment-badge">Trả góp 0%</div>
                    
                    <div className="card-image-wrapper">
                      <img src={currentImg} alt={p.name} loading="lazy" className="product-image" />
                    </div>

                    <div className="card-body">
                      <h2 className="product-name">{p.name}</h2>
                      
                      {/* HIỂN THỊ CÁC CHẤM MÀU SẮC ĐỔI ẢNH GIỐNG QM TECH */}
                      {colorList.length > 0 && (
                        <div className="product-color-selector">
                          {colorList.map((col, idx) => (
                            <span 
                              key={idx} 
                              className={`color-dot ${currentImg === col.img ? 'active' : ''}`}
                              style={{ backgroundColor: col.hex }}
                              title={col.name}
                              onMouseEnter={() => setProductImages(prev => ({ ...prev, [p.id]: col.img }))}
                              onClick={() => setProductImages(prev => ({ ...prev, [p.id]: col.img }))}
                            />
                          ))}
                        </div>
                      )}

                      {p.specs && (
                        <ul className="product-specs">
                          {p.specs.split('|').slice(0, 3).map((spec, i) => (
                            <li key={i}>{spec}</li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="card-foot">
                        <div className="price-row">
                          <strong className="product-price">{vnd(p.price)}</strong>
                          <del className="old-price">{vnd(oldPrice)}</del>
                        </div>
                        <button className="add-to-cart-btn" onClick={() => run(api.add(p.id))}>THÊM VÀO GIỎ</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </main>

          <div className="ai-widget-container">
            {!chatOpen && (
              <button className="ai-fab-btn" onClick={() => setChatOpen(true)}>
                <span className="ai-fab-text">🤖 Trợ lý AI Thông Minh</span>
              </button>
            )}
          </div>

          {chatOpen && (
            <div className="ai-overlay-backdrop">
              <div className="ai-modern-modal">
                <div className="ai-modal-topbar">
                  <div className="ai-topbar-info">
                    <div className="ai-avatar-glow">🤖</div>
                    <div className="ai-topbar-title">
                      <h3>Trợ lý AI TechStore Pro</h3>
                      <span>Trực tuyến • Phản hồi tức thì</span>
                    </div>
                  </div>
                  <div className="ai-close-x" onClick={() => setChatOpen(false)}>✕</div>
                </div>

                <div className="ai-chat-scroll-area">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`ai-bubble-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                      <div className="ai-text-content">
                        {msg.text}

                        {msg.product && (
                          <div className="ai-product-recommend-card">
                            <img src={msg.product.image} className="ai-rec-img" alt="" />
                            <div className="ai-rec-details">
                              <span className="ai-rec-title">{msg.product.name}</span>
                              <span className="ai-rec-price">{vnd(msg.product.price)}</span>
                              <button className="ai-rec-order-btn" onClick={() => run(api.add(msg.product!.id))}>
                                🛒 Thêm vào giỏ hàng
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="ai-bubble-row assistant">
                      <div className="ai-text-content">Đang phân tích cấu hình...</div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="ai-bottom-input-bar">
                  <input 
                    type="text" 
                    className="ai-input-box" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleChatSend()} 
                    placeholder="Hỏi về sản phẩm, cấu hình, giá tiền..." 
                    disabled={chatLoading} 
                  />
                  <button className="ai-send-action-btn" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
                    Gửi ngay ➔
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}