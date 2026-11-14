import React, { useState } from 'react'
import type { Voucher } from '../types'
import { vnd } from '../api'
import { spawnConfettiBurst } from '../utils/flyToCart'

interface VoucherAndGamificationModalProps {
  isOpen: boolean;
  initialTab: 'vouchers' | 'gamification';
  vouchers: Voucher[];
  savedVoucherCodes: string[];
  selectedVoucherCode: string;
  userCoins: number;
  checkedInToday: boolean;
  spinsLeft: number;
  onClose: () => void;
  onSaveVoucher: (code: string) => void;
  onApplyVoucher: (code: string) => void;
  onDailyCheckIn: () => void;
  onWinSpinPrize: (prizeType: 'coins' | 'voucher', amountOrVoucher: number | Voucher, message: string) => void;
}

const WHEEL_SEGMENTS = [
  { label: '+100.000 Xu', type: 'coins' as const, val: 100000, color: '#3b82f6' },
  { label: 'Mã LUCKY300K', type: 'voucher' as const, val: 300000, color: '#8b5cf6' },
  { label: '+50.000 Xu', type: 'coins' as const, val: 50000, color: '#10b981' },
  { label: 'Mã MEGA15 (-15%)', type: 'voucher' as const, val: 15, color: '#f59e0b' },
  { label: '+80.000 Xu', type: 'coins' as const, val: 80000, color: '#ec4899' },
  { label: 'Freeship VIP', type: 'coins' as const, val: 60000, color: '#06b6d4' }
]

export const VoucherAndGamificationModal: React.FC<VoucherAndGamificationModalProps> = ({
  isOpen,
  initialTab,
  vouchers,
  savedVoucherCodes,
  selectedVoucherCode,
  userCoins,
  checkedInToday,
  spinsLeft,
  onClose,
  onSaveVoucher,
  onApplyVoucher,
  onDailyCheckIn,
  onWinSpinPrize
}) => {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'gamification'>(initialTab)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinResultMsg, setSpinResultMsg] = useState('')

  React.useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab, isOpen])

  if (!isOpen) return null

  const handleSpinWheel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isSpinning || spinsLeft <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    setIsSpinning(true)
    setSpinResultMsg('')

    // Pick a winning segment (preferring LUCKY300K or +100.000 Xu for great demo experience)
    const winIdx = Math.random() > 0.45 ? 1 : 0
    const extraTurns = 5 * 360
    const targetAngle = extraTurns + (360 - winIdx * 60)
    const nextRot = wheelRotation + targetAngle
    setWheelRotation(nextRot)

    setTimeout(() => {
      setIsSpinning(false)
      spawnConfettiBurst(rect.left + rect.width / 2, rect.top)
      const winner = WHEEL_SEGMENTS[winIdx]
      if (winner.type === 'voucher') {
        const newVoucher: Voucher = {
          code: 'LUCKY300K',
          title: 'Voucher Vòng Quay Giảm 300.000₫',
          description: 'Thưởng Vòng Quay May Mắn: Giảm thẳng 300.000₫ cho đơn từ 1.000.000₫',
          type: 'fixed',
          value: 300000,
          minOrder: 1000000,
          tag: 'Quà Vòng Quay',
          expiry: '31/12/2026'
        }
        const msg = '🎉 Chúc mừng! Bạn quay trúng Mã giảm giá độc quyền LUCKY300K (-300.000₫)!'
        setSpinResultMsg(msg)
        onWinSpinPrize('voucher', newVoucher, msg)
      } else {
        const msg = `🎉 Chúc mừng! Bạn quay trúng +${winner.val.toLocaleString('vi-VN')} Xu thưởng vào tài khoản!`
        setSpinResultMsg(msg)
        onWinSpinPrize('coins', winner.val, msg)
      }
    }, 3200)
  }

  return (
    <div className="modal-backdrop-glass" onClick={onClose}>
      <div className="voucher-gamification-modal" onClick={e => e.stopPropagation()}>
        <div className="vg-modal-header">
          <div className="vg-tabs">
            <button
              className={`vg-tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
              onClick={() => setActiveTab('vouchers')}
            >
              🎟️ Kho Voucher Siêu Cấp ({vouchers.length})
            </button>
            <button
              className={`vg-tab-btn ${activeTab === 'gamification' ? 'active' : ''}`}
              onClick={() => setActiveTab('gamification')}
            >
              🎁 Điểm Danh Nhận Xu & Vòng Quay May Mắn
            </button>
          </div>
          <button className="pdp-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="vg-modal-body">
          {activeTab === 'vouchers' ? (
            /* VOUCHER WALLET VIEW */
            <div className="vouchers-wallet-pane">
              <div className="wallet-banner-summary">
                <div>
                  <h3>Ví Voucher & Ưu Đãi Độc Quyền Storez Pro</h3>
                  <p>Lưu mã giảm giá và áp dụng trực tiếp trong Giỏ hàng — Tự động khấu trừ tiền tức thì.</p>
                </div>
                <div className="wallet-coin-pill">
                  🪙 Số dư của bạn: <strong>{userCoins.toLocaleString('vi-VN')} Xu</strong>
                </div>
              </div>

              <div className="voucher-tickets-grid">
                {vouchers.map(v => {
                  const isSaved = savedVoucherCodes.includes(v.code)
                  const isApplied = selectedVoucherCode === v.code

                  return (
                    <div className={`voucher-ticket-card ${isApplied ? 'applied' : ''}`} key={v.code}>
                      <div className="voucher-left-stub">
                        <span className="stub-tag">{v.tag}</span>
                        <strong className="stub-code">{v.code}</strong>
                        <small>HSD: {v.expiry}</small>
                      </div>

                      <div className="voucher-right-content">
                        <h4>{v.title}</h4>
                        <p>{v.description}</p>
                        <div className="voucher-foot-row">
                          <span className="voucher-min-order">
                            Đơn tối thiểu: {vnd(v.minOrder)}
                          </span>

                          <div className="voucher-btn-pair">
                            {!isSaved ? (
                              <button
                                className="btn-save-voucher"
                                onClick={e => {
                                  const r = e.currentTarget.getBoundingClientRect()
                                  spawnConfettiBurst(r.left + r.width / 2, r.top)
                                  onSaveVoucher(v.code)
                                }}
                              >
                                + Lưu mã
                              </button>
                            ) : (
                              <button
                                className={`btn-apply-voucher ${isApplied ? 'active' : ''}`}
                                onClick={() => {
                                  onApplyVoucher(v.code)
                                  onClose()
                                }}
                              >
                                {isApplied ? '✓ Đang áp dụng' : 'Dùng ngay'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* GAMIFICATION: DAILY CHECK-IN & LUCKY SPIN WHEEL */
            <div className="gamification-split-pane">
              {/* LEFT: 7-DAY DAILY CHECK-IN */}
              <div className="daily-checkin-card">
                <div className="checkin-header">
                  <span className="checkin-badge">🔥 CHUỖI ĐIỂM DANH 7 NGÀY</span>
                  <h3>Điểm Danh Mỗi Ngày Nhận Xu Mua Sắm</h3>
                  <p>1 Xu = 1₫ trừ trực tiếp vào mọi đơn hàng Laptop, Điện thoại, Gear.</p>
                </div>

                <div className="checkin-days-grid">
                  {[
                    { day: 'Ngày 1', reward: '+20K Xu', done: true },
                    { day: 'Ngày 2', reward: '+30K Xu', done: true },
                    { day: 'Ngày 3', reward: '+40K Xu', done: true },
                    { day: 'Hôm nay', reward: '+50K Xu', done: checkedInToday, today: true },
                    { day: 'Ngày 5', reward: '+60K Xu', done: false },
                    { day: 'Ngày 6', reward: '+80K Xu', done: false },
                    { day: 'Ngày 7', reward: '🎁 +150K Xu', done: false }
                  ].map((d, i) => (
                    <div
                      key={i}
                      className={`checkin-day-box ${d.done ? 'done' : ''} ${d.today ? 'today' : ''}`}
                    >
                      <span className="day-title">{d.day}</span>
                      <div className="day-coin-icon">{d.done ? '✅' : '🪙'}</div>
                      <strong className="day-reward">{d.reward}</strong>
                    </div>
                  ))}
                </div>

                <div className="checkin-balance-strip">
                  <span>Số dư Xu hiện tại:</span>
                  <strong>🪙 {userCoins.toLocaleString('vi-VN')} Xu (= {vnd(userCoins)})</strong>
                </div>

                <button
                  className={`btn-daily-checkin ${checkedInToday ? 'claimed' : ''}`}
                  disabled={checkedInToday}
                  onClick={e => {
                    const r = e.currentTarget.getBoundingClientRect()
                    spawnConfettiBurst(r.left + r.width / 2, r.top)
                    onDailyCheckIn()
                  }}
                >
                  {checkedInToday
                    ? '✓ Đã Điểm Danh Hôm Nay (+50.000 Xu)'
                    : '🎁 BẤM ĐIỂM DANH NHẬN NGAY +50.000 XU'}
                </button>
              </div>

              {/* RIGHT: LUCKY SPIN WHEEL */}
              <div className="lucky-wheel-card">
                <div className="wheel-header">
                  <span className="checkin-badge">🎡 VÒNG QUAY SĂN VOUCHER</span>
                  <h3>Vòng Quay Công Nghệ 100% Trúng Quà</h3>
                  <p>Lượt quay miễn phí hôm nay: <strong>{spinsLeft} lượt</strong></p>
                </div>

                <div className="wheel-stage-container">
                  <div className="wheel-pointer-arrow">▼</div>
                  <div
                    className="lucky-wheel-disc"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.85, 0.25, 1)' : 'none'
                    }}
                  >
                    {WHEEL_SEGMENTS.map((seg, idx) => (
                      <div
                        key={idx}
                        className="wheel-slice-label"
                        style={{
                          transform: `rotate(${idx * 60}deg)`
                        }}
                      >
                        <span>{seg.label}</span>
                      </div>
                    ))}
                    <div className="wheel-center-cap">⚡</div>
                  </div>
                </div>

                {spinResultMsg && (
                  <div className="spin-win-alert">{spinResultMsg}</div>
                )}

                <button
                  className="btn-spin-now"
                  disabled={isSpinning || spinsLeft <= 0}
                  onClick={handleSpinWheel}
                >
                  {isSpinning
                    ? '🎡 Đang quay thưởng...'
                    : spinsLeft > 0
                    ? `🎯 QUAY NGAY (${spinsLeft} lượt miễn phí)`
                    : '✓ Bạn đã dùng hết lượt quay hôm nay'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
