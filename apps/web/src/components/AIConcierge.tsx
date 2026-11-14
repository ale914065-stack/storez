import React, { useState, useEffect, useRef } from 'react'
import type { Product, ChatMessage, ChatComparisonData } from '../types'
import { vnd } from '../api'
import { runLocalConciergeEngine } from '../utils/aiEngine'

interface AIConciergeProps {
  products: Product[];
  isOpen: boolean;
  externalPrompt?: string;
  onOpen: () => void;
  onClose: () => void;
  onClearExternalPrompt: () => void;
  onQuickViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, sourceEl: HTMLElement | null) => void;
}

const SMART_PROMPT_CHIPS = [
  '💻 Laptop IT dưới 20 triệu',
  '📱 Điện thoại pin trâu chụp đẹp',
  '🎧 Tai nghe chống ồn tốt nhất',
  '⚖️ So sánh 2 máy bán chạy nhất',
  '🤔 Con nào rẻ hơn?',
  '🎨 Máy thứ 2 có màu đen không?',
  '🛒 Thêm con đầu tiên vào giỏ giúp tôi'
]

export const AIConcierge: React.FC<AIConciergeProps> = ({
  products,
  isOpen,
  externalPrompt,
  onOpen,
  onClose,
  onClearExternalPrompt,
  onQuickViewProduct,
  onAddToCart
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [consultMode, setConsultMode] = useState<'advisor' | 'compare' | 'deal'>('advisor')
  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingStage, setThinkingStage] = useState('')
  const [lastRecommendedIds, setLastRecommendedIds] = useState<number[]>([7, 8, 1])

  // Streaming typewriter state for latest assistant message
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [streamedChars, setStreamedChars] = useState(0)

  const initialWelcomeMsg: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    text:
      `👋 Xin chào! Tôi là **AI Tech Concierge** — Chuyên gia Tư vấn Phần cứng & Săn Deal của **STOREZ PRO**.\n\n` +
      `Tôi kết nối trực tiếp với kho hàng **${products.length} siêu phẩm chính hãng** và hiểu mọi nhu cầu bằng tiếng Việt tự nhiên (kể cả viết tắt như *"lap IT dưới 20tr"*, *"đt pin trâu"*, *"build pc gaming"*).\n\n` +
      `• **Tư vấn chuẩn xác theo ngân sách & nhu cầu** (Gaming, Đồ họa, Sinh viên IT)\n` +
      `• **Vẽ bảng so sánh thông số trực tiếp** & tô xanh điểm mạnh\n` +
      `• **Ghi nhớ hội thoại đa lượt** (*"Con nào rẻ hơn?"*, *"Thêm con đầu tiên vào giỏ"*)\n\n` +
      `Bạn đang tìm thiết bị nào hôm nay? Hãy bấm nhanh các gợi ý bên dưới hoặc nhập câu hỏi nhé!`,
    timestamp: 'Trực tuyến',
    products: products.filter(p => [1, 7, 14].includes(p.id))
  }

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMsg])
  const scrollEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking, streamedChars])

  // Handle external prompt trigger (e.g. from Hero Bento card)
  useEffect(() => {
    if (isOpen && externalPrompt) {
      handleSendPrompt(externalPrompt)
      onClearExternalPrompt()
    }
  }, [isOpen, externalPrompt])

  // Typewriter streaming effect
  useEffect(() => {
    if (!streamingMsgId) return
    const targetMsg = messages.find(m => m.id === streamingMsgId)
    if (!targetMsg) {
      setStreamingMsgId(null)
      return
    }
    const fullLen = targetMsg.text.length
    if (streamedChars >= fullLen) {
      setStreamingMsgId(null)
      return
    }

    const timer = setTimeout(() => {
      // Advance 14 chars per frame for ultra-snappy 60fps typewriter feel
      setStreamedChars(prev => Math.min(fullLen, prev + 16))
    }, 16)

    return () => clearTimeout(timer)
  }, [streamingMsgId, streamedChars, messages])

  const handleClearHistory = () => {
    setMessages([initialWelcomeMsg])
    setStreamingMsgId(null)
  }

  const handleSendPrompt = async (customText?: string) => {
    const raw = (customText ?? inputText).trim()
    if (!raw || isThinking) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: raw,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (!customText) setInputText('')
    setIsThinking(true)
    setThinkingStage('🧠 Đang phân tích nhu cầu & ngữ cảnh...')

    // Stage transition < 0.35s total
    const stageTimer = setTimeout(() => {
      setThinkingStage(`🔍 Đang quét kho hàng ${products.length} sản phẩm...`)
    }, 130)

    try {
      let responseText = ''
      let recProducts: Product[] = []
      let comparisonData: ChatComparisonData | null = null
      let actionAddProd: Product | null = null

      // Try Edge Worker API with fast timeout (280ms) and merge with live client catalog
      try {
        const ctrl = new AbortController()
        const tId = setTimeout(() => ctrl.abort(), 320)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: raw,
            lastProductIds: lastRecommendedIds,
            mode: consultMode
          }),
          signal: ctrl.signal
        })
        clearTimeout(tId)
        if (res.ok) {
          const data = await res.json()
          if (data.ok && data.response) {
            responseText = data.response
            recProducts = Array.isArray(data.products) ? data.products : data.product ? [data.product] : []
            comparisonData = data.comparison || null
            actionAddProd = data.actionAddProduct || null
          }
        }
      } catch {
        // Zero-latency local inference engine takes over seamlessly
      }

      if (!responseText) {
        const localResult = runLocalConciergeEngine(raw, products, lastRecommendedIds, consultMode)
        responseText = localResult.response
        recProducts = localResult.products
        comparisonData = localResult.comparison || null
        actionAddProd = localResult.actionAddProduct || null
      }

      // Brief pause so user sees the 2-stage smart indicator (~240ms total, well under 0.5s!)
      await new Promise(r => setTimeout(r, 220))
      clearTimeout(stageTimer)

      if (recProducts.length > 0) {
        setLastRecommendedIds(recProducts.map(p => p.id))
      }

      const aiMsgId = `ai-${Date.now()}`
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        products: recProducts,
        comparison: comparisonData,
        actionAddProduct: actionAddProd
      }

      setIsThinking(false)
      setMessages(prev => [...prev, aiMsg])
      setStreamedChars(18)
      setStreamingMsgId(aiMsgId)

      // If multi-turn action requested adding a product to cart, execute it automatically!
      if (actionAddProd) {
        setTimeout(() => {
          const orbEl = document.getElementById('ai-header-avatar')
          onAddToCart(actionAddProd!, orbEl)
        }, 180)
      }
    } catch {
      clearTimeout(stageTimer)
      setIsThinking(false)
    }
  }

  // Rich Markdown & Price Highlighter renderer for AI bubble
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n')
    return lines.map((line, lineIdx) => {
      if (!line.trim()) return <div key={lineIdx} className="ai-line-spacer" />

      const isBullet = line.trim().startsWith('•') || /^\d+\./.test(line.trim())
      // Parse **bold**, *italic*, and highlight VND prices
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\d{1,3}(?:\.\d{3})+₫)/g)

      return (
        <div key={lineIdx} className={isBullet ? 'ai-formatted-bullet' : 'ai-formatted-line'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const inner = part.slice(2, -2)
              if (/\d{1,3}(?:\.\d{3})+₫/.test(inner)) {
                return <strong key={pIdx} className="ai-price-highlight">{inner}</strong>
              }
              return <strong key={pIdx} className="ai-bold-spec">{inner}</strong>
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="ai-italic-hint">{part.slice(1, -1)}</em>
            }
            if (/^\d{1,3}(?:\.\d{3})+₫$/.test(part)) {
              return <strong key={pIdx} className="ai-price-highlight">{part}</strong>
            }
            return <span key={pIdx}>{part}</span>
          })}
        </div>
      )
    })
  }

  return (
    <>
      {/* 1. FLOATING AI ORB (APPLE INTELLIGENCE / MESH GRADIENT AURA GLOW) */}
      {!isOpen && (
        <button
          className="floating-ai-orb-btn"
          onClick={onOpen}
          title="Mở Trợ lý AI Tư vấn Cấu hình & Săn Deal"
        >
          <span className="ai-orb-aura-ring" />
          <span className="ai-orb-core">
            <span className="orb-sparkle-icon">✦</span>
          </span>
          <div className="ai-orb-label-wrap">
            <strong className="ai-orb-title">Trợ lý AI Tư vấn</strong>
            <span className="ai-orb-sub">Apple Intelligence • &lt;0.2s</span>
          </div>
        </button>
      )}

      {/* 2. GLASSMORPHISM AI CONCIERGE DRAWER / EXPANDABLE MODAL */}
      {isOpen && (
        <div className="ai-concierge-backdrop" onClick={onClose}>
          <div
            className={`ai-concierge-glass-window ${isExpanded ? 'expanded-fullscreen' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            {/* PROFESSIONAL AI HEADER */}
            <div className="ai-concierge-header">
              <div className="ai-header-left">
                <div
                  id="ai-header-avatar"
                  className={`ai-dynamic-avatar ${isThinking || streamingMsgId ? 'speaking' : ''}`}
                >
                  <span className="avatar-bot-icon">🤖</span>
                  <div className="soundwave-bars">
                    <span /><span /><span /><span />
                  </div>
                </div>
                <div className="ai-header-meta">
                  <div className="ai-header-title-row">
                    <h3>AI Tech Concierge 4o</h3>
                    <span className="ai-engine-tag">Catalog RAG • Zero-Latency</span>
                  </div>
                  <div className="ai-online-status">
                    <span className="online-pulse-dot" />
                    <span>Trực tuyến • Sẵn sàng tư vấn ({products.length} sản phẩm)</span>
                  </div>
                </div>
              </div>

              {/* MODE SWITCHER & WINDOW CONTROLS */}
              <div className="ai-header-controls">
                <div className="ai-mode-pills">
                  <button
                    className={consultMode === 'advisor' ? 'active' : ''}
                    onClick={() => setConsultMode('advisor')}
                  >
                    🎯 Tư vấn Cấu hình
                  </button>
                  <button
                    className={consultMode === 'compare' ? 'active' : ''}
                    onClick={() => {
                      setConsultMode('compare')
                      handleSendPrompt('So sánh 2 máy bán chạy nhất')
                    }}
                  >
                    ⚖️ Chuyên gia So sánh
                  </button>
                  <button
                    className={consultMode === 'deal' ? 'active' : ''}
                    onClick={() => {
                      setConsultMode('deal')
                      handleSendPrompt('Gợi ý các deal Flash Sale giảm sâu nhất hôm nay')
                    }}
                  >
                    🔥 Săn Deal
                  </button>
                </div>

                <button
                  className="ai-ctrl-icon-btn"
                  title="Xóa lịch sử trò chuyện"
                  onClick={handleClearHistory}
                >
                  🗑️ Xóa lịch sử
                </button>
                <button
                  className="ai-ctrl-icon-btn"
                  title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Mở rộng toàn màn hình'}
                  onClick={() => setIsExpanded(prev => !prev)}
                >
                  {isExpanded ? '🗗 Thu nhỏ' : '⛶ Mở rộng'}
                </button>
                <button className="ai-ctrl-close-btn" onClick={onClose}>
                  ✕
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES STREAM AREA */}
            <div className="ai-messages-viewport">
              {messages.map(msg => {
                const isStreamingThis = streamingMsgId === msg.id
                const visibleText = isStreamingThis
                  ? msg.text.slice(0, streamedChars)
                  : msg.text

                return (
                  <div
                    key={msg.id}
                    className={`ai-chat-turn ${msg.role === 'user' ? 'turn-user' : 'turn-assistant'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="turn-avatar-mini">✦</div>
                    )}

                    <div className="turn-content-stack">
                      <div className="turn-bubble">
                        {renderFormattedText(visibleText)}
                        {isStreamingThis && <span className="typewriter-cursor">▋</span>}
                      </div>

                      {/* INLINE MINI COMPARISON TABLE (WHEN AI COMPARES 2 PRODUCTS) */}
                      {!isStreamingThis && msg.comparison && (
                        <div className="ai-inline-compare-box">
                          <div className="ai-compare-head">
                            <span>⚖️ BẢNG ĐỐI CHIẾU THÔNG SỐ TRỰC TIẾP</span>
                            <span className="ai-compare-badge">Tự động tô xanh ưu thế</span>
                          </div>
                          <div className="ai-compare-table-scroll">
                            <table className="ai-mini-compare-table">
                              <thead>
                                <tr>
                                  <th>Thông số</th>
                                  <th>
                                    <div className="ai-comp-th-prod">
                                      <img src={msg.comparison.productA.image} alt="" />
                                      <span>{msg.comparison.productA.name}</span>
                                    </div>
                                  </th>
                                  <th>
                                    <div className="ai-comp-th-prod">
                                      <img src={msg.comparison.productB.image} alt="" />
                                      <span>{msg.comparison.productB.name}</span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {msg.comparison.rows.map((r, rIdx) => (
                                  <tr key={rIdx}>
                                    <td className="ai-comp-label">{r.label}</td>
                                    <td className={r.winner === 'A' ? 'ai-comp-win' : ''}>
                                      {r.valA} {r.winner === 'A' && <strong>✓</strong>}
                                    </td>
                                    <td className={r.winner === 'B' ? 'ai-comp-win' : ''}>
                                      {r.valB} {r.winner === 'B' && <strong>✓</strong>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="ai-compare-verdict">
                            {renderFormattedText(msg.comparison.verdict)}
                          </div>
                        </div>
                      )}

                      {/* HORIZONTAL PRODUCT CAROUSEL RIGHT IN CHAT */}
                      {!isStreamingThis && msg.products && msg.products.length > 0 && (
                        <div className="ai-product-carousel">
                          {msg.products.map((prod, idx) => {
                            const specChips = (prod.specs || '').split('|').slice(0, 2)
                            return (
                              <div className="ai-carousel-card" key={prod.id}>
                                <div className="ai-card-rank">#{idx + 1} Đề xuất</div>
                                <div className="ai-card-top">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    onClick={() => onQuickViewProduct(prod)}
                                  />
                                  <div className="ai-card-meta">
                                    <span className="ai-card-brand">{prod.brand}</span>
                                    <h5 onClick={() => onQuickViewProduct(prod)}>{prod.name}</h5>
                                    <strong className="ai-card-price">{vnd(prod.price)}</strong>
                                  </div>
                                </div>

                                <div className="ai-card-specs">
                                  {specChips.map((sc, sIdx) => (
                                    <span key={sIdx} className="ai-spec-pill">{sc}</span>
                                  ))}
                                </div>

                                <div className="ai-card-actions">
                                  <button
                                    className="ai-btn-detail"
                                    onClick={() => onQuickViewProduct(prod)}
                                  >
                                    👁️ Xem chi tiết
                                  </button>
                                  <button
                                    className="ai-btn-addcart"
                                    onClick={e => onAddToCart(prod, e.currentTarget)}
                                  >
                                    + Thêm vào giỏ
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* SMART THINKING INDICATOR */}
              {isThinking && (
                <div className="ai-chat-turn turn-assistant">
                  <div className="turn-avatar-mini thinking-pulse">✦</div>
                  <div className="ai-thinking-indicator">
                    <div className="thinking-dots">
                      <span /><span /><span />
                    </div>
                    <span className="thinking-stage-text">{thinkingStage}</span>
                  </div>
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>

            {/* SMART PROMPT CHIPS (1-TAP QUICK QUESTIONS) */}
            <div className="ai-smart-chips-bar">
              {SMART_PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  className="smart-prompt-chip"
                  onClick={() => handleSendPrompt(chip.replace(/^[^\wÀ-ỹ]+\s*/, ''))}
                  disabled={isThinking}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* INPUT BAR */}
            <div className="ai-input-dock">
              <input
                type="text"
                className="ai-concierge-input"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
                placeholder="Nhập câu hỏi tự nhiên (VD: 'lap IT dưới 20tr', 'con nào rẻ hơn?', 'thêm con đầu vào giỏ')..."
                disabled={isThinking}
              />
              <button
                className="ai-concierge-send-btn"
                onClick={() => handleSendPrompt()}
                disabled={isThinking || !inputText.trim()}
              >
                <span>Gửi tư vấn</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
