import React, { useState } from 'react'
import type { Product, OrderRecord } from '../types'
import { vnd } from '../api'

interface AdminDashboardProps {
  isOpen: boolean;
  products: Product[];
  orders: OrderRecord[];
  onClose: () => void;
  onAddProduct: (prod: Partial<Product>) => void;
  onUpdateProduct: (id: number, prod: Partial<Product>) => void;
  onDeleteProduct: (id: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
}

const REVENUE_DAYS = [
  { day: 'Thứ 2', amount: 142000000, pct: 58 },
  { day: 'Thứ 3', amount: 189000000, pct: 74 },
  { day: 'Thứ 4', amount: 164000000, pct: 65 },
  { day: 'Thứ 5', amount: 215000000, pct: 84 },
  { day: 'Thứ 6', amount: 238000000, pct: 92 },
  { day: 'Thứ 7', amount: 268000000, pct: 100 },
  { day: 'Hôm nay', amount: 245000000, pct: 95 }
]

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  products,
  orders,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics')

  // Product Form State
  const [editingId, setEditingId] = useState<number | null>(null)
  const [prodName, setProdName] = useState('')
  const [prodCategory, setProdCategory] = useState('Laptop')
  const [prodBrand, setProdBrand] = useState('Apple')
  const [prodPrice, setProdPrice] = useState(25990000)
  const [prodStock, setProdStock] = useState(25)
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85')
  const [prodSpecs, setProdSpecs] = useState('Chip: Thế hệ mới|RAM: 16GB|SSD: 512GB NVMe')
  const [prodDesc, setProdDesc] = useState('Siêu phẩm công nghệ chính hãng bảo hành 24 tháng tại Storez Pro.')
  const [prodFlash, setProdFlash] = useState(true)

  if (!isOpen) return null

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0) + 1461000000
  const totalInventory = products.reduce((s, p) => s + (p.stock ?? 20), 0)

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setProdName(p.name)
    setProdCategory(p.category || 'Laptop')
    setProdBrand(p.brand || 'Apple')
    setProdPrice(p.price)
    setProdStock(p.stock ?? 20)
    setProdImage(p.image)
    setProdSpecs(p.specs || '')
    setProdDesc(p.description || '')
    setProdFlash(p.isFlashSale === 1)
    setActiveTab('products')
  }

  const resetForm = () => {
    setEditingId(null)
    setProdName('')
    setProdPrice(25990000)
    setProdStock(25)
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName.trim()) return

    const payload: Partial<Product> = {
      name: prodName.trim(),
      category: prodCategory,
      brand: prodBrand,
      price: Number(prodPrice),
      oldPrice: Math.round(Number(prodPrice) * 1.18),
      stock: Number(prodStock),
      image: prodImage,
      specs: prodSpecs,
      description: prodDesc,
      isFlashSale: prodFlash ? 1 : 0,
      flashSalePrice: Math.round(Number(prodPrice) * 0.92)
    }

    if (editingId) {
      onUpdateProduct(editingId, payload)
    } else {
      onAddProduct(payload)
    }
    resetForm()
  }

  return (
    <div className="modal-backdrop-glass" onClick={onClose}>
      <div className="admin-dashboard-window" onClick={e => e.stopPropagation()}>
        {/* ADMIN TOPBAR */}
        <div className="admin-topbar">
          <div className="admin-brand">
            <span className="admin-shield-icon">⚡</span>
            <div>
              <h2>STOREZ PRO • KÊNH NGƯỜI BÁN & ADMIN PORTAL</h2>
              <span>Đồng bộ thời gian thực với Cửa hàng & Cloudflare D1/KV</span>
            </div>
          </div>

          <div className="admin-nav-tabs">
            <button
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Biểu Đồ Doanh Thu
            </button>
            <button
              className={activeTab === 'products' ? 'active' : ''}
              onClick={() => setActiveTab('products')}
            >
              💻 Quản Lý Sản Phẩm ({products.length})
            </button>
            <button
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              📦 Duyệt Đơn Hàng ({orders.length})
            </button>
          </div>

          <button className="admin-exit-btn" onClick={onClose}>
            ← Về Trang Bán Hàng
          </button>
        </div>

        <div className="admin-body-scroll">
          {activeTab === 'analytics' && (
            <div className="admin-analytics-pane">
              {/* KPI CARDS */}
              <div className="admin-kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Tổng Doanh Thu Hệ Thống</span>
                  <strong className="kpi-value">{vnd(totalRevenue)}</strong>
                  <span className="kpi-trend up">▲ +28.4% so với tuần trước</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Tổng Đơn Hàng Hoàn Tất</span>
                  <strong className="kpi-value">{124 + orders.length} đơn</strong>
                  <span className="kpi-trend up">▲ Tỷ lệ giao đúng hẹn 99.4%</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Sản Phẩm Đang Kinh Doanh</span>
                  <strong className="kpi-value">{products.length} mã SKU</strong>
                  <span className="kpi-trend">Tồn kho khả dụng: {totalInventory} máy</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Tỷ Lệ Chuyển Đổi AI Concierge</span>
                  <strong className="kpi-value">18.7%</strong>
                  <span className="kpi-trend up">▲ Phản hồi trung bình 0.18 giây</span>
                </div>
              </div>

              {/* CHARTS SPLIT */}
              <div className="admin-charts-row">
                <div className="admin-chart-box">
                  <div className="chart-box-head">
                    <h3>📈 Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
                    <span>Đơn vị: VNĐ</span>
                  </div>
                  <div className="bar-chart-stage">
                    {REVENUE_DAYS.map((d, i) => (
                      <div className="bar-col-item" key={i}>
                        <span className="bar-val-tooltip">
                          {Math.round(d.amount / 1000000)}M
                        </span>
                        <div className="bar-track-vert">
                          <div
                            className="bar-fill-vert"
                            style={{ height: `${d.pct}%` }}
                          />
                        </div>
                        <span className="bar-day-label">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-chart-box">
                  <div className="chart-box-head">
                    <h3>🏆 Tỷ Trọng Doanh Thu Theo Danh Mục</h3>
                  </div>
                  <div className="cat-Share-list">
                    {[
                      { name: 'Laptop & Workstation', pct: 38, color: '#3b82f6' },
                      { name: 'Điện thoại Flagship', pct: 32, color: '#8b5cf6' },
                      { name: 'PC & Linh kiện Hi-End', pct: 14, color: '#10b981' },
                      { name: 'Gaming Gear & Phụ kiện', pct: 10, color: '#f59e0b' },
                      { name: 'Âm thanh & Smart Home', pct: 6, color: '#ec4899' }
                    ].map((c, idx) => (
                      <div className="cat-share-row" key={idx}>
                        <div className="cat-share-top">
                          <span>{c.name}</span>
                          <strong>{c.pct}%</strong>
                        </div>
                        <div className="cat-share-track">
                          <div
                            className="cat-share-fill"
                            style={{ width: `${c.pct}%`, background: c.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="admin-products-split">
              {/* LEFT: ADD / EDIT PRODUCT FORM */}
              <form className="admin-prod-form" onSubmit={handleSaveProduct}>
                <h3>{editingId ? `✏️ Sửa Sản Phẩm #${editingId}` : '➕ Thêm Sản Phẩm Mới'}</h3>

                <label>Tên sản phẩm công nghệ *</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="VD: MacBook Pro M4 Max 16 inch..."
                  required
                />

                <div className="form-2col">
                  <div>
                    <label>Danh mục</label>
                    <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}>
                      <option value="Laptop">Laptop</option>
                      <option value="Điện thoại">Điện thoại</option>
                      <option value="Gaming Gear">Gaming Gear</option>
                      <option value="Âm thanh">Âm thanh</option>
                      <option value="PC & Linh kiện">PC & Linh kiện</option>
                      <option value="Tablet & Smart Home">Tablet & Smart Home</option>
                    </select>
                  </div>
                  <div>
                    <label>Thương hiệu</label>
                    <input
                      type="text"
                      value={prodBrand}
                      onChange={e => setProdBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-2col">
                  <div>
                    <label>Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={e => setProdPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label>Tồn kho</label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={e => setProdStock(Number(e.target.value))}
                    />
                  </div>
                </div>

                <label>URL Hình ảnh</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={e => setProdImage(e.target.value)}
                />

                <label>Thông số tóm tắt (Cách nhau bởi dấu |)</label>
                <input
                  type="text"
                  value={prodSpecs}
                  onChange={e => setProdSpecs(e.target.value)}
                />

                <label>Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                />

                <label className="status-checkbox-row" style={{ margin: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    checked={prodFlash}
                    onChange={e => setProdFlash(e.target.checked)}
                  />
                  <span>⚡ Đưa vào khung giờ Flash Sale Giờ Vàng</span>
                </label>

                <div className="admin-form-btns">
                  {editingId && (
                    <button type="button" className="btn-cancel-edit" onClick={resetForm}>
                      Hủy sửa
                    </button>
                  )}
                  <button type="submit" className="btn-save-prod">
                    {editingId ? '💾 Lưu Cập Nhật' : '🚀 Đăng Bán Ngay'}
                  </button>
                </div>
              </form>

              {/* RIGHT: PRODUCT TABLE */}
              <div className="admin-prod-table-box">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Giá bán</th>
                      <th>Kho</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>
                          <div className="admin-td-prod">
                            <img src={p.image} alt="" />
                            <div>
                              <strong>{p.name}</strong>
                              <span>{p.brand} {p.isFlashSale ? '• ⚡ Flash Sale' : ''}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td><strong className="text-red">{vnd(p.price)}</strong></td>
                        <td>{p.stock ?? 20}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="admin-edit-btn"
                              onClick={() => startEdit(p)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="admin-del-btn"
                              onClick={() => onDeleteProduct(p.id)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-orders-pane">
              <div className="admin-orders-head">
                <h3>📦 Quản Lý & Duyệt Trạng Thái Đơn Hàng (Đồng bộ trực tiếp với Khách hàng)</h3>
              </div>

              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Địa chỉ nhận</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái hiện tại</th>
                    <th>Cập nhật trạng thái giao hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong></td>
                      <td>
                        <strong>{o.customerName}</strong>
                        <div>{o.phone}</div>
                      </td>
                      <td>{o.address}, {o.district}, {o.province}</td>
                      <td><strong className="text-red">{vnd(o.total)}</strong></td>
                      <td>
                        <span className={`order-status-pill status-${o.status}`}>
                          {o.status === 'pending' && '📝 Chờ xác nhận'}
                          {o.status === 'packing' && '📦 Đang đóng gói'}
                          {o.status === 'shipping' && '🚚 Đang giao'}
                          {o.status === 'delivered' && '✅ Đã giao'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-status-select"
                          value={o.status}
                          onChange={e =>
                            onUpdateOrderStatus(o.id, e.target.value as OrderRecord['status'])
                          }
                        >
                          <option value="pending">1. Chờ xác nhận</option>
                          <option value="packing">2. Đang đóng gói</option>
                          <option value="shipping">3. Đang giao hàng</option>
                          <option value="delivered">4. Đã giao thành công</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
