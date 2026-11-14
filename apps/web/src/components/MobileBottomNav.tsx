import React from 'react'

interface MobileBottomNavProps {
  cartCount: number;
  onHome: () => void;
  onFlashSale: () => void;
  onVouchers: () => void;
  onOpenAI: () => void;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  onHome,
  onFlashSale,
  onVouchers,
  onOpenAI,
  onOpenCart
}) => {
  return (
    <nav className="mobile-bottom-nav">
      <button className="mob-nav-item" onClick={onHome}>
        <span className="mob-icon">🏠</span>
        <span>Trang chủ</span>
      </button>
      <button className="mob-nav-item" onClick={onFlashSale}>
        <span className="mob-icon">⚡</span>
        <span>Flash Sale</span>
      </button>
      <button className="mob-nav-item ai-center-item" onClick={onOpenAI}>
        <div className="mob-ai-orb">✦</div>
        <span>Trợ lý AI</span>
      </button>
      <button className="mob-nav-item" onClick={onVouchers}>
        <span className="mob-icon">🎁</span>
        <span>Săn Xu</span>
      </button>
      <button className="mob-nav-item" onClick={onOpenCart}>
        <span className="mob-icon">🛒</span>
        <span>Giỏ ({cartCount})</span>
      </button>
    </nav>
  )
}
