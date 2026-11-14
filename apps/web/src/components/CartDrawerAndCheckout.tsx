import React, { useState } from 'react'
import type { Cart, Voucher, OrderRecord, OrderItemSummary } from '../types'
import { VN_LOCATIONS } from '../data/catalog'
import { vnd } from '../api'

interface CartDrawerAndCheckoutProps {
  cart: Cart;
  isOpen: boolean;
  checkoutOpen: boolean;
  ordersOpen: boolean;
  vouchers: Voucher[];
  savedVoucherCodes: string[];
  selectedVoucherCode: string;
  userCoins: number;
  useCoinsInCart: boolean;
  orders: OrderRecord[];
  onCloseCart: () => void;
  onOpenCheckout: () => void;
  onCloseCheckout: () => void;
  onOpenOrders: () => void;
  onCloseOrders: () => void;
  onSelectVoucher: (code: string) => void;
  onToggleUseCoins: (val: boolean) => void;
  onUpdateQty: (productId: number, qty: number) => void;
  onClearCart: () => void;
  onPlaceOrder: (orderData: Partial<OrderRecord>, coinsUsed: number) => void;
}

const FREESHIP_THRESHOLD = 500000

export const CartDrawerAndCheckout: React.FC<CartDrawerAndCheckoutProps> = ({
  cart,
  isOpen,
  checkoutOpen,
  ordersOpen,
  vouchers,
  selectedVoucherCode,
  userCoins,
  useCoinsInCart,
  orders,
  onCloseCart,
  onOpenCheckout,
  onCloseCheckout,
  onOpenOrders,
  onCloseOrders,
  onSelectVoucher,
  onToggleUseCoins,
  onUpdateQty,
  onClearCart,
  onPlaceOrder
}) => {
  // Checkout form state
  const [customerName, setCustomerName] = useState('Nguyễn Minh Quân')
  const [phone, setPhone] = useState('0909888999')
  const [province, setProvince] = useState('TP. Hồ Chí Minh')
  const [district, setDistrict] = useState('Quận 1')
  const [address, setAddress] = useState('Số 68 Nguyễn Huệ, Phường Bến Nghé')
  const [shippingMethod, setShippingMethod] = useState<'express' | 'standard'>('express')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr' | 'card' | 'installment'>('vietqr')
  const [createdInvoice, setCreatedInvoice] = useState<OrderRecord | null>(null)

  const subtotal = cart.total
  const freeshipProgress = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100))
  const remainingForFreeship = Math.max(0, FREESHIP_THRESHOLD - subtotal)

  // Calculate active voucher discount
  const activeVoucher = vouchers.find(v => v.code === selectedVoucherCode)
  let voucherDiscount = 0
  if (activeVoucher && subtotal >= activeVoucher.minOrder) {
    if (activeVoucher.type === 'percent') {
      const raw = Math.round((subtotal * activeVoucher.value) / 100)
      voucherDiscount = activeVoucher.maxDiscount ? Math.min(raw, activeVoucher.maxDiscount) : raw
    } else if (activeVoucher.type === 'fixed') {
      voucherDiscount = activeVoucher.value
    }
  }

  const baseShippingFee =
    subtotal === 0
      ? 0
      : shippingMethod === 'express'
      ? subtotal >= FREESHIP_THRESHOLD && activeVoucher?.type === 'freeship'
        ? 0
        : 45000
      : subtotal >= FREESHIP_THRESHOLD
      ? 0
      : 30000

  const coinsDiscount = useCoinsInCart && subtotal > 0 ? Math.min(userCoins, 200000) : 0
  const totalDiscount = voucherDiscount + coinsDiscount
  const finalTotal = Math.max(0, subtotal + baseShippingFee - totalDiscount)

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv)
    const districts = VN_LOCATIONS[newProv] || ['Quận Trung Tâm']
    setDistrict(districts[0])
  }

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.items.length === 0) return

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
    const summaryItems: OrderItemSummary[] = cart.items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      qty: item.qty,
      image: item.product.image,
      variant: [item.selectedColor, item.selectedStorage].filter(Boolean).join(' • ') || 'Bản Chính hãng VN/A'
    }))

    const newOrder: OrderRecord = {
      id: orderId,
      customerName,
      phone,
      province,
      district,
      address,
      shippingMethod,
      paymentMethod,
      items: JSON.stringify(summaryItems),
      subtotal,
      shippingFee: baseShippingFee,
      discount: totalDiscount,
      total: finalTotal,
      voucherCode: selectedVoucherCode || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    onPlaceOrder(newOrder, coinsDiscount)
    setCreatedInvoice(newOrder)
  }

  const STATUS_STEPS: Array<{ key: OrderRecord['status']; label: string; icon: string }> = [
    { key: 'pending', label: 'Chờ xác nhận', icon: '📝' },
    { key: 'packing', label: 'Đang đóng gói', icon: '📦' },
    { key: 'shipping', label: 'Đang giao hàng', icon: '🚚' },
    { key: 'delivered', label: 'Đã giao thành công', icon: '✅' }
  ]

  return (
    <>
      {/* 1. SLIDE-OVER CART DRAWER */}
      {isOpen && <div className="drawer-backdrop" onClick={onCloseCart} />}
      <aside className={`luxury-cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <span>🛒</span>
            <h3>GIỎ HÀNG THÔNG MINH ({cart.count})</h3>
          </div>
          <div className="cart-header-actions">
            {cart.count > 0 && (
              <button className="cart-clear-link" onClick={onClearCart}>
                Xóa tất cả
              </button>
            )}
            <button className="pdp-close-btn" onClick={onCloseCart}>✕</button>
          </div>
        </div>

        {/* FREESHIP EXTRA PROGRESS BAR */}
        <div className="freeship-progress-banner">
          <div className="freeship-banner-text">
            {remainingForFreeship > 0 ? (
              <span>
                🚚 Mua thêm <strong>{vnd(remainingForFreeship)}</strong> để được{' '}
                <strong>Freeship Extra 100%</strong>!
              </span>
            ) : (
              <span>
                🎉 Chúc mừng! Đơn hàng của bạn đã đủ điều kiện <strong>Freeship Extra</strong>!
              </span>
            )}
          </div>
          <div className="freeship-bar-track">
            <div
              className="freeship-bar-fill"
              style={{ width: `${freeshipProgress}%` }}
            />
          </div>
        </div>

        {/* CART ITEMS SCROLL BODY */}
        <div className="cart-drawer-body">
          {cart.items.length === 0 ? (
            <div className="cart-empty-view">
              <div className="cart-empty-orb">🛍️</div>
              <h4>Giỏ hàng của bạn đang trống</h4>
              <p>Khám phá ngay các siêu phẩm công nghệ đang Flash Sale giảm tới 25% hôm nay!</p>
            </div>
          ) : (
            cart.items.map(({ product: p, qty, selectedColor, selectedStorage }) => (
              <div className="luxury-cart-item" key={p.id}>
                <img src={p.image} alt={p.name} className="cart-item-thumb" />
                <div className="cart-item-details">
                  <h4>{p.name}</h4>
                  {(selectedColor || selectedStorage) && (
                    <span className="cart-item-variant-tag">
                      {[selectedColor, selectedStorage].filter(Boolean).join(' • ')}
                    </span>
                  )}
                  <div className="cart-item-price-qty">
                    <strong className="cart-item-unit-price">{vnd(p.price)}</strong>
                    <div className="cart-qty-stepper">
                      <button onClick={() => onUpdateQty(p.id, qty - 1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => onUpdateQty(p.id, qty + 1)}>+</button>
                    </div>
                  </div>
                </div>
                <button
                  className="cart-item-delete"
                  onClick={() => onUpdateQty(p.id, 0)}
                  title="Xóa khỏi giỏ"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* VOUCHER & COINS + FOOTER TOTAL */}
        {cart.items.length > 0 && (
          <div className="cart-drawer-footer">
            {/* VOUCHER PICKER */}
            <div className="cart-voucher-strip">
              <label>🎟️ Chọn Voucher Giảm Giá:</label>
              <select
                value={selectedVoucherCode}
                onChange={e => onSelectVoucher(e.target.value)}
                className="cart-voucher-select"
              >
                <option value="">-- Chọn mã giảm giá trong Ví --</option>
                {vouchers.map(v => {
                  const eligible = subtotal >= v.minOrder
                  return (
                    <option key={v.code} value={v.code} disabled={!eligible}>
                      [{v.code}] {v.title} {eligible ? '✓' : `(Đơn từ ${vnd(v.minOrder)})`}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* COINS REDEMPTION TOGGLE */}
            {userCoins > 0 && (
              <label className="cart-coins-toggle">
                <input
                  type="checkbox"
                  checked={useCoinsInCart}
                  onChange={e => onToggleUseCoins(e.target.checked)}
                />
                <span>
                  🪙 Dùng <strong>{Math.min(userCoins, 200000).toLocaleString('vi-VN')} Xu</strong> giảm trực tiếp{' '}
                  <strong>{vnd(Math.min(userCoins, 200000))}</strong>
                </span>
              </label>
            )}

            <div className="cart-calc-breakdown">
              <div className="calc-row">
                <span>Tạm tính ({cart.count} sản phẩm):</span>
                <span>{vnd(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="calc-row discount-row">
                  <span>Tiết kiệm Voucher & Xu:</span>
                  <span>−{vnd(totalDiscount)}</span>
                </div>
              )}
              <div className="calc-row total-final-row">
                <span>Tổng thanh toán:</span>
                <strong>{vnd(Math.max(0, subtotal - totalDiscount))}</strong>
              </div>
            </div>

            <button
              className="cart-proceed-checkout-btn"
              onClick={() => {
                setCreatedInvoice(null)
                onCloseCart()
                onOpenCheckout()
              }}
            >
              ⚡ TIẾN HÀNH THANH TOÁN AN TOÀN →
            </button>
          </div>
        )}
      </aside>

      {/* 2. MULTI-STEP CHECKOUT & ELECTRONIC INVOICE MODAL */}
      {checkoutOpen && (
        <div className="modal-backdrop-glass" onClick={onCloseCheckout}>
          <div className="checkout-modal-container" onClick={e => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h2>
                {createdInvoice
                  ? '🎉 ĐẶT HÀNG THÀNH CÔNG & HÓA ĐƠN ĐIỆN TỬ'
                  : '🛡️ THANH TOÁN ĐƠN HÀNG ĐA BƯỚC'}
              </h2>
              <button className="pdp-close-btn" onClick={onCloseCheckout}>✕</button>
            </div>

            {createdInvoice ? (
              /* ELECTRONIC INVOICE VIEW */
              <div className="electronic-invoice-view">
                <div className="invoice-success-banner">
                  <div className="invoice-check-orb">✅</div>
                  <div>
                    <h3>Cảm ơn {createdInvoice.customerName}! Đơn hàng {createdInvoice.id} đã được xác nhận</h3>
                    <p>Hệ thống kho tự động đang đóng gói siêu phẩm của bạn. Hóa đơn điện tử GTGT đã được khởi tạo.</p>
                  </div>
                </div>

                <div className="invoice-paper-card">
                  <div className="invoice-paper-head">
                    <div>
                      <h4>HÓA ĐƠN GIÁ TRỊ GIA TĂNG (E-INVOICE)</h4>
                      <span>Đơn vị bán: STOREZ PRO VIETNAM TECH CORP</span>
                    </div>
                    <div className="invoice-meta-right">
                      <strong>Mã đơn: {createdInvoice.id}</strong>
                      <span>Ngày lập: {new Date(createdInvoice.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="invoice-customer-grid">
                    <div>
                      <span>Khách hàng:</span> <strong>{createdInvoice.customerName}</strong>
                    </div>
                    <div>
                      <span>Số điện thoại:</span> <strong>{createdInvoice.phone}</strong>
                    </div>
                    <div>
                      <span>Địa chỉ giao:</span>{' '}
                      <strong>
                        {createdInvoice.address}, {createdInvoice.district}, {createdInvoice.province}
                      </strong>
                    </div>
                    <div>
                      <span>Thanh toán & Vận chuyển:</span>{' '}
                      <strong>
                        {createdInvoice.paymentMethod.toUpperCase()} •{' '}
                        {createdInvoice.shippingMethod === 'express' ? 'Hỏa tốc 2H' : 'Tiêu chuẩn'}
                      </strong>
                    </div>
                  </div>

                  <table className="invoice-items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(JSON.parse(createdInvoice.items || '[]') as OrderItemSummary[]).map((it, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{it.name}</strong>
                            {it.variant && <div className="inv-sub-variant">{it.variant}</div>}
                          </td>
                          <td>{it.qty}</td>
                          <td>{vnd(it.price)}</td>
                          <td>{vnd(it.price * it.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="invoice-totals-box">
                    <div><span>Tạm tính:</span> <span>{vnd(createdInvoice.subtotal)}</span></div>
                    <div><span>Phí vận chuyển:</span> <span>{vnd(createdInvoice.shippingFee)}</span></div>
                    <div><span>Giảm giá Voucher/Xu:</span> <span>−{vnd(createdInvoice.discount)}</span></div>
                    <div className="inv-grand-total">
                      <span>TỔNG THANH TOÁN (ĐÃ GỒM VAT):</span>
                      <strong>{vnd(createdInvoice.total)}</strong>
                    </div>
                  </div>
                </div>

                <div className="invoice-footer-btns">
                  <button
                    className="btn-track-my-order"
                    onClick={() => {
                      onCloseCheckout()
                      onOpenOrders()
                    }}
                  >
                    📦 Theo Dõi Tiến Độ Đơn Hàng ({createdInvoice.id})
                  </button>
                  <button className="btn-continue-shopping" onClick={onCloseCheckout}>
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            ) : (
              /* CHECKOUT MULTI-STEP FORM */
              <form className="checkout-grid-form" onSubmit={handleConfirmOrder}>
                <div className="checkout-left-steps">
                  {/* STEP 1: ADDRESS */}
                  <div className="checkout-step-card">
                    <h4>📍 1. Địa chỉ nhận hàng tại Việt Nam</h4>
                    <div className="checkout-fields-grid">
                      <div className="field-col">
                        <label>Họ và tên người nhận *</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="field-col">
                        <label>Số điện thoại liên hệ *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="field-col">
                        <label>Tỉnh / Thành phố *</label>
                        <select
                          value={province}
                          onChange={e => handleProvinceChange(e.target.value)}
                        >
                          {Object.keys(VN_LOCATIONS).map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field-col">
                        <label>Quận / Huyện *</label>
                        <select
                          value={district}
                          onChange={e => setDistrict(e.target.value)}
                        >
                          {(VN_LOCATIONS[province] || ['Quận 1']).map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field-col full-width">
                        <label>Số nhà, Tên đường, Tòa nhà *</label>
                        <input
                          type="text"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: SHIPPING METHOD */}
                  <div className="checkout-step-card">
                    <h4>🚚 2. Phương thức vận chuyển</h4>
                    <div className="shipping-options-grid">
                      <div
                        className={`ship-method-card ${shippingMethod === 'express' ? 'active' : ''}`}
                        onClick={() => setShippingMethod('express')}
                      >
                        <div className="ship-head">
                          <strong>🚀 Hỏa tốc 2 Giờ Nội Thành</strong>
                          <span className="ship-fee-badge">
                            {baseShippingFee === 0 && shippingMethod === 'express' ? 'MIỄN PHÍ' : vnd(45000)}
                          </span>
                        </div>
                        <p>Nhận hàng ngay trong 120 phút kèm kỹ thuật viên hỗ trợ cài đặt tận nơi.</p>
                      </div>

                      <div
                        className={`ship-method-card ${shippingMethod === 'standard' ? 'active' : ''}`}
                        onClick={() => setShippingMethod('standard')}
                      >
                        <div className="ship-head">
                          <strong>📦 Tiêu chuẩn Freeship Extra</strong>
                          <span className="ship-fee-badge">MIỄN PHÍ</span>
                        </div>
                        <p>Giao hàng toàn quốc bảo hiểm 100% giá trị thiết bị điện tử.</p>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: PAYMENT METHOD + DYNAMIC VIETQR */}
                  <div className="checkout-step-card">
                    <h4>💳 3. Phương thức thanh toán</h4>
                    <div className="payment-methods-grid">
                      <button
                        type="button"
                        className={`pay-method-pill ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('vietqr')}
                      >
                        🏦 Chuyển khoản VietQR 24/7
                      </button>
                      <button
                        type="button"
                        className={`pay-method-pill ${paymentMethod === 'cod' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        💵 Thanh toán khi nhận hàng (COD)
                      </button>
                      <button
                        type="button"
                        className={`pay-method-pill ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        💳 Thẻ Quốc tế Visa / Master / Apple Pay
                      </button>
                      <button
                        type="button"
                        className={`pay-method-pill ${paymentMethod === 'installment' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('installment')}
                      >
                        ⚡ Trả góp 0% Lãi suất (6 - 12 Tháng)
                      </button>
                    </div>

                    {/* VIETQR DYNAMIC GENERATOR BOX */}
                    {paymentMethod === 'vietqr' && (
                      <div className="vietqr-showcase-box">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                            `VIETQR|STOREZ_PRO_VN|AMOUNT:${finalTotal}|MSG:THANH TOAN DON HANG CONG NGHE`
                          )}`}
                          alt="VietQR Code"
                          className="vietqr-img"
                        />
                        <div className="vietqr-bank-details">
                          <span className="vietqr-badge">⚡ Quét mã VietQR Napas 247 Tự Động</span>
                          <p>Ngân hàng: <strong>Techcombank - CN Sài Gòn</strong></p>
                          <p>Chủ TK: <strong>CONG TY CP CONG NGHE STOREZ PRO</strong></p>
                          <p>Số tiền tự động: <strong className="qr-amount">{vnd(finalTotal)}</strong></p>
                          <p>Nội dung CK: <code>STOREZ {phone}</code></p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'installment' && (
                      <div className="installment-preview-box">
                        <span>✨ Kỳ hạn 12 tháng 0% lãi suất:</span>
                        <strong>Chỉ trả {vnd(finalTotal / 12)} / tháng (Phê duyệt tự động trong 30 giây)</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: ORDER SUMMARY */}
                <div className="checkout-right-summary">
                  <h4>📋 Tóm tắt đơn hàng ({cart.count} sản phẩm)</h4>
                  <div className="checkout-mini-items">
                    {cart.items.map(it => (
                      <div key={it.product.id} className="checkout-mini-row">
                        <img src={it.product.image} alt="" />
                        <div className="mini-row-info">
                          <strong>{it.product.name}</strong>
                          <span>SL: {it.qty} × {vnd(it.product.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-Voucher-box">
                    <label>Mã giảm giá áp dụng:</label>
                    <select
                      value={selectedVoucherCode}
                      onChange={e => onSelectVoucher(e.target.value)}
                    >
                      <option value="">-- Không dùng Voucher --</option>
                      {vouchers.map(v => (
                        <option key={v.code} value={v.code} disabled={subtotal < v.minOrder}>
                          {v.code} - {v.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="checkout-price-lines">
                    <div><span>Tạm tính:</span> <span>{vnd(subtotal)}</span></div>
                    <div><span>Phí vận chuyển:</span> <span>{baseShippingFee === 0 ? 'Miễn phí' : vnd(baseShippingFee)}</span></div>
                    <div><span>Giảm giá Voucher & Xu:</span> <span className="text-green">−{vnd(totalDiscount)}</span></div>
                    <div className="checkout-final-total">
                      <span>Tổng thanh toán:</span>
                      <strong>{vnd(finalTotal)}</strong>
                    </div>
                  </div>

                  <button type="submit" className="checkout-confirm-submit-btn">
                    ✅ XÁC NHẬN ĐẶT HÀNG & XUẤT HÓA ĐƠN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. MY ORDERS & TRACKING MODAL */}
      {ordersOpen && (
        <div className="modal-backdrop-glass" onClick={onCloseOrders}>
          <div className="orders-modal-window" onClick={e => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h2>📦 ĐƠN MUA CỦA TÔI & THEO DÕI HÀNH TRÌNH GIAO HÀNG ({orders.length})</h2>
              <button className="pdp-close-btn" onClick={onCloseOrders}>✕</button>
            </div>

            <div className="orders-list-scroll">
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem' }}>Bạn chưa có đơn hàng nào.</p>
              ) : (
                orders.map(ord => {
                  let parsedItems: OrderItemSummary[] = []
                  try { parsedItems = JSON.parse(ord.items || '[]') } catch {}
                  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === ord.status)

                  return (
                    <div className="order-tracking-card" key={ord.id}>
                      <div className="order-card-head">
                        <div>
                          <strong className="order-id-tag">Mã đơn: {ord.id}</strong>
                          <span className="order-date-text">
                            • Đặt lúc: {new Date(ord.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <span className={`order-status-pill status-${ord.status}`}>
                          {STATUS_STEPS[currentStepIdx]?.icon} {STATUS_STEPS[currentStepIdx]?.label}
                        </span>
                      </div>

                      {/* 4-STEP ORDER TRACKING STEPPER */}
                      <div className="order-stepper-track">
                        {STATUS_STEPS.map((st, idx) => {
                          const completed = idx <= currentStepIdx
                          const current = idx === currentStepIdx
                          return (
                            <div
                              key={st.key}
                              className={`order-step-node ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
                            >
                              <div className="step-circle">{st.icon}</div>
                              <span>{st.label}</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="order-items-preview">
                        {parsedItems.map((it, i) => (
                          <div className="order-item-line" key={i}>
                            <img src={it.image} alt={it.name} />
                            <div className="order-item-meta">
                              <h5>{it.name}</h5>
                              <span>{it.variant} • SL: {it.qty}</span>
                            </div>
                            <strong>{vnd(it.price * it.qty)}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-foot">
                        <span>
                          📍 Giao tới: <strong>{ord.customerName}</strong> ({ord.phone}) — {ord.address}, {ord.district}, {ord.province}
                        </span>
                        <div className="order-total-sum">
                          Tổng thanh toán: <strong>{vnd(ord.total)}</strong>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
