import type { BackendProduct } from './catalogData'

export interface ChatTurnRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string; productIds?: number[] }>;
  lastProductIds?: number[];
  mode?: 'advisor' | 'compare' | 'deal';
}

export interface ComparisonRow {
  label: string;
  valA: string;
  valB: string;
  winner: 'A' | 'B' | 'tie';
}

export interface ChatTurnResponse {
  ok: boolean;
  response: string;
  products: BackendProduct[];
  product: BackendProduct | null;
  comparison?: {
    productA: BackendProduct;
    productB: BackendProduct;
    rows: ComparisonRow[];
    verdict: string;
  } | null;
  actionAddProduct?: BackendProduct | null;
  thinkingSteps: string[];
  latencyMs: number;
}

// Strip Vietnamese accents for fuzzy & no-diacritic matching
export function normalizeVN(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s.+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫';

// Parse Vietnamese budget expressions: "20tr", "15 củ", "dưới 25 triệu", "tầm 2tr", "500k"
export function parseBudget(raw: string): { max?: number; min?: number; target?: number } {
  const norm = normalizeVN(raw);
  const result: { max?: number; min?: number; target?: number } = {};

  // Match e.g. "duoi 20tr", "duoi 20 trieu", "< 20 cu"
  const underMatch = norm.match(/(?:duoi|nho hon|toi da|max|khoang|tam|gia)\s*(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|m|k|nghin|ngan)?/);
  const generalMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|m|k|nghin|ngan)/);
  const overMatch = norm.match(/(?:tren|hon|tu)\s*(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|m|k|nghin|ngan)/);

  const toVnd = (numStr: string, unit?: string) => {
    const val = parseFloat(numStr.replace(',', '.'));
    if (!unit || ['tr', 'trieu', 'cu', 'm'].includes(unit)) {
      return val < 200 ? val * 1_000_000 : val;
    }
    if (['k', 'nghin', 'ngan'].includes(unit)) {
      return val * 1_000;
    }
    return val;
  };

  if (overMatch) {
    result.min = toVnd(overMatch[1], overMatch[2]);
  }
  if (underMatch && underMatch[2]) {
    const amount = toVnd(underMatch[1], underMatch[2]);
    if (norm.includes('duoi') || norm.includes('toi da') || norm.includes('nho hon')) {
      result.max = amount;
    } else {
      result.target = amount;
      result.max = amount * 1.2;
    }
  } else if (generalMatch) {
    const amount = toVnd(generalMatch[1], generalMatch[2]);
    if (norm.includes('duoi') || norm.includes('khong qua')) {
      result.max = amount;
    } else {
      result.target = amount;
      result.max = amount * 1.25;
    }
  }

  return result;
}

export function buildMiniComparison(pA: BackendProduct, pB: BackendProduct) {
  let specsA: Record<string, string> = {};
  let specsB: Record<string, string> = {};
  try { specsA = JSON.parse(pA.structuredSpecs || '{}'); } catch {}
  try { specsB = JSON.parse(pB.structuredSpecs || '{}'); } catch {}

  const extractNum = (s: string) => {
    const m = (s || '').match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  };

  const rows: ComparisonRow[] = [
    {
      label: 'Giá ưu đãi',
      valA: fmtVND(pA.price),
      valB: fmtVND(pB.price),
      winner: pA.price < pB.price ? 'A' : pB.price < pA.price ? 'B' : 'tie'
    },
    {
      label: 'Vi xử lý / Chip',
      valA: specsA.cpu || pA.specs.split('|')[0] || 'Cao cấp',
      valB: specsB.cpu || pB.specs.split('|')[0] || 'Cao cấp',
      winner: pA.price > pB.price ? 'A' : pB.price > pA.price ? 'B' : 'tie'
    },
    {
      label: 'RAM / Phản hồi',
      valA: specsA.ram || 'Tiêu chuẩn',
      valB: specsB.ram || 'Tiêu chuẩn',
      winner: extractNum(specsA.ram) > extractNum(specsB.ram) ? 'A' : extractNum(specsB.ram) > extractNum(specsA.ram) ? 'B' : 'tie'
    },
    {
      label: 'Màn hình / Thiết kế',
      valA: specsA.display || 'Cao cấp',
      valB: specsB.display || 'Cao cấp',
      winner: (specsA.display || '').includes('OLED') || (specsA.display || '').includes('Mini-LED') ? 'A' : (specsB.display || '').includes('OLED') ? 'B' : 'tie'
    },
    {
      label: 'Thời lượng Pin',
      valA: specsA.battery || 'Bền bỉ',
      valB: specsB.battery || 'Bền bỉ',
      winner: extractNum(specsA.battery) > extractNum(specsB.battery) ? 'A' : extractNum(specsB.battery) > extractNum(specsA.battery) ? 'B' : 'tie'
    },
    {
      label: 'Trọng lượng',
      valA: specsA.weight || 'Gọn nhẹ',
      valB: specsB.weight || 'Gọn nhẹ',
      winner: extractNum(specsA.weight) > 0 && extractNum(specsB.weight) > 0
        ? (extractNum(specsA.weight) < extractNum(specsB.weight) ? 'A' : extractNum(specsB.weight) < extractNum(specsA.weight) ? 'B' : 'tie')
        : 'tie'
    },
    {
      label: 'Đánh giá & Đã bán',
      valA: `⭐ ${pA.rating} (${pA.soldCount} đã bán)`,
      valB: `⭐ ${pB.rating} (${pB.soldCount} đã bán)`,
      winner: pA.soldCount >= pB.soldCount ? 'A' : 'B'
    }
  ];

  const diffPrice = Math.abs(pA.price - pB.price);
  const cheaper = pA.price <= pB.price ? pA : pB;
  const stronger = pA.price > pB.price ? pA : pB;

  const verdict = `💡 **Kết luận từ Chuyên gia AI:** Chọn **${cheaper.name}** nếu bạn muốn tối ưu ngân sách (tiết kiệm **${fmtVND(diffPrice)}**) và tính thực dụng cao. Chọn **${stronger.name}** nếu bạn ưu tiên hiệu năng đỉnh cao nhất phân khúc và trải nghiệm Flagship lâu dài.`;

  return { productA: pA, productB: pB, rows, verdict };
}

export function processSmartConcierge(
  req: ChatTurnRequest,
  catalog: BackendProduct[]
): ChatTurnResponse {
  const startTime = Date.now();
  const rawMsg = req.message || '';
  const norm = normalizeVN(rawMsg);
  const lastIds = req.lastProductIds || [];
  const lastProducts = lastIds
    .map(id => catalog.find(p => p.id === id))
    .filter((p): p is BackendProduct => Boolean(p));

  const thinkingSteps = [
    'Đang phân tích nhu cầu & ngữ cảnh hội thoại...',
    `Đang quét kho hàng ${catalog.length} sản phẩm chính hãng...`,
    'Đang đối chiếu cấu hình & ưu đãi tốt nhất...'
  ];

  // =========================================================================
  // 1. MULTI-TURN ACTION: ADD TO CART ("thêm con đầu tiên vào giỏ", "mua máy thứ 2", "chốt con rẻ hơn")
  // =========================================================================
  const isAddToCartIntent =
    (norm.includes('them') && (norm.includes('gio') || norm.includes('cart'))) ||
    norm.includes('mua con') ||
    norm.includes('mua may') ||
    norm.includes('lay con') ||
    norm.includes('chot con') ||
    norm.includes('dat hang con');

  if (isAddToCartIntent) {
    let targetProd: BackendProduct | undefined;

    // Check if user named a specific product in the message
    for (const p of catalog) {
      const pNorm = normalizeVN(p.name);
      if (norm.includes(pNorm) || pNorm.split(' ').slice(0, 3).every(w => norm.includes(w))) {
        targetProd = p;
        break;
      }
    }

    if (!targetProd && lastProducts.length > 0) {
      if (norm.includes('thu 2') || norm.includes('so 2') || norm.includes('hai')) {
        targetProd = lastProducts[1] || lastProducts[0];
      } else if (norm.includes('thu 3') || norm.includes('so 3') || norm.includes('ba')) {
        targetProd = lastProducts[2] || lastProducts[0];
      } else if (norm.includes('re hon') || norm.includes('re nhat')) {
        targetProd = [...lastProducts].sort((a, b) => a.price - b.price)[0];
      } else if (norm.includes('dat hon') || norm.includes('manh hon')) {
        targetProd = [...lastProducts].sort((a, b) => b.price - a.price)[0];
      } else {
        // Default: first product ("con đầu tiên", "máy đầu", "con này")
        targetProd = lastProducts[0];
      }
    }

    if (!targetProd) {
      targetProd = catalog[0];
    }

    return {
      ok: true,
      response:
        `✅ **Đã thêm tự động vào giỏ hàng của bạn!**\n\n` +
        `• Sản phẩm: **${targetProd.name}**\n` +
        `• Giá ưu đãi: **${fmtVND(targetProd.price)}** *(Tiết kiệm ${fmtVND((targetProd.oldPrice || targetProd.price * 1.15) - targetProd.price)})*\n` +
        `• Quà tặng & Ưu đãi: **Freeship Extra Hỏa tốc 2h** + Áp dụng được mã **CYBER500K** hoặc **TECH10** trong Ví Voucher.\n\n` +
        `Bạn có thể mở **Giỏ hàng** ở góc trên bên phải để thanh toán ngay hoặc hỏi tôi thêm về phụ kiện đi kèm nhé!`,
      products: [targetProd],
      product: targetProd,
      actionAddProduct: targetProd,
      thinkingSteps,
      latencyMs: Math.max(12, Date.now() - startTime)
    };
  }

  // =========================================================================
  // 2. MULTI-TURN MEMORY: COLOR / VARIANT QUESTION ("máy thứ 2 có màu đen không?", "con đầu có màu gì?")
  // =========================================================================
  if (
    norm.includes('mau') &&
    (norm.includes('khong') || norm.includes('gi') || norm.includes('nao') || norm.includes('den') || norm.includes('trang') || norm.includes('titan') || norm.includes('xam'))
  ) {
    let targetProd: BackendProduct | undefined;
    if (norm.includes('thu 2') || norm.includes('so 2') || norm.includes('hai')) {
      targetProd = lastProducts[1] || lastProducts[0];
    } else if (norm.includes('thu 3') || norm.includes('so 3')) {
      targetProd = lastProducts[2] || lastProducts[0];
    } else if (lastProducts.length > 0) {
      targetProd = lastProducts[0];
    }

    // Or check explicit product mention
    for (const p of catalog) {
      const words = normalizeVN(p.name).split(' ').slice(0, 3);
      if (words.every(w => norm.includes(w))) {
        targetProd = p;
        break;
      }
    }

    if (targetProd) {
      let colors: Array<{ name: string; hex: string }> = [];
      try { colors = JSON.parse(targetProd.colors || '[]'); } catch {}
      const colorNames = colors.map(c => `**${c.name}**`).join(', ');
      const askedBlack = norm.includes('den') || norm.includes('black');
      const hasBlack = colors.some(c => normalizeVN(c.name).includes('den') || normalizeVN(c.name).includes('black') || normalizeVN(c.name).includes('graphite') || normalizeVN(c.name).includes('midnight'));

      let answerPrefix = '';
      if (askedBlack) {
        answerPrefix = hasBlack
          ? `🎯 **Có nhé!** Mẫu **${targetProd.name}** hiện đang sẵn hàng phiên bản tông màu tối/đen cực kỳ sang trọng.`
          : `ℹ️ Hiện tại **${targetProd.name}** không có bản tên "Đen" thuần nhưng có các tông màu tương đương rất đẹp.`;
      } else {
        answerPrefix = `🎨 Mẫu **${targetProd.name}** hiện đang phân phối chính hãng với **${colors.length} tùy chọn màu sắc**:`;
      }

      return {
        ok: true,
        response:
          `${answerPrefix}\n\n` +
          `• Các màu sẵn kho: ${colorNames || '**Bản Tiêu Chuẩn**'}\n` +
          `• Giá bán hiện tại: **${fmtVND(targetProd.price)}** (Còn **${targetProd.stock}** máy tại kho)\n\n` +
          `Bạn muốn mình **thêm ngay ${targetProd.name}** vào giỏ hàng hay xem chi tiết từng màu?`,
        products: [targetProd],
        product: targetProd,
        thinkingSteps,
        latencyMs: Math.max(15, Date.now() - startTime)
      };
    }
  }

  // =========================================================================
  // 3. MULTI-TURN MEMORY: CHEAPER / BETTER FOLLOW-UP ("con nào rẻ hơn?", "máy nào mạnh hơn?", "nên chọn con nào?")
  // =========================================================================
  if (
    lastProducts.length >= 2 &&
    (norm.includes('con nao re hon') ||
      norm.includes('may nao re hon') ||
      norm.includes('re hon') ||
      norm.includes('manh hon') ||
      norm.includes('tot hon') ||
      norm.includes('nen mua con nao') ||
      norm.includes('nen chon') ||
      norm.includes('dang mua hon'))
  ) {
    const pA = lastProducts[0];
    const pB = lastProducts[1];
    const cheaper = pA.price <= pB.price ? pA : pB;
    const pricier = pA.price <= pB.price ? pB : pA;
    const diff = pricier.price - cheaper.price;
    const comp = buildMiniComparison(pA, pB);

    return {
      ok: true,
      response:
        `📊 **Đối chiếu nhanh từ các sản phẩm bạn vừa xem:**\n\n` +
        `• **${cheaper.name}** có mức giá **rẻ hơn ${fmtVND(diff)}** (chỉ **${fmtVND(cheaper.price)}** so với **${fmtVND(pricier.price)}** của ${pricier.name}).\n` +
        `• **Khi nào chọn ${cheaper.name}?** Khi bạn cần hiệu năng/giá thành (P/P) tối ưu nhất, tiết kiệm ngân sách để mua thêm Gear/Phụ kiện.\n` +
        `• **Khi nào chọn ${pricier.name}?** Khi bạn muốn cấu hình cao cấp hơn (${pricier.specs.split('|').slice(0, 2).join(', ')}) phục vụ tác vụ nặng dài hạn.\n\n` +
        `Mình đã lập **Bảng so sánh thông số trực tiếp** bên dưới để bạn dễ quyết định! Bạn muốn lấy máy nào cứ nhắn *"Thêm con rẻ hơn vào giỏ"* nhé.`,
      products: [cheaper, pricier],
      product: cheaper,
      comparison: comp,
      thinkingSteps,
      latencyMs: Math.max(18, Date.now() - startTime)
    };
  }

  // =========================================================================
  // 4. EXPLICIT COMPARISON INTENT ("so sánh", "vs", "đối chiếu")
  // =========================================================================
  if (norm.includes('so sanh') || norm.includes(' vs ') || norm.includes('doi chieu') || req.mode === 'compare') {
    // Find mentioned products in message
    const mentioned: BackendProduct[] = [];
    for (const p of catalog) {
      const pNorm = normalizeVN(p.name);
      const keywords = pNorm.split(' ').filter(w => w.length > 2);
      const matchScore = keywords.filter(k => norm.includes(k)).length;
      if (matchScore >= 2 || (norm.includes('iphone') && p.id === 7) || (norm.includes('s24') && p.id === 8) || (norm.includes('macbook air') && p.id === 3) || (norm.includes('macbook pro') && p.id === 1) || (norm.includes('rog') && p.id === 2)) {
        if (!mentioned.some(m => m.id === p.id)) mentioned.push(p);
      }
    }

    let pA: BackendProduct;
    let pB: BackendProduct;

    if (mentioned.length >= 2) {
      pA = mentioned[0];
      pB = mentioned[1];
    } else if (norm.includes('ban chay') || norm.includes('flagship') || norm.includes('hot')) {
      // Top 2 best-selling flagship phones or laptops
      if (norm.includes('lap') || norm.includes('mac')) {
        pA = catalog.find(p => p.id === 1) || catalog[0];
        pB = catalog.find(p => p.id === 2) || catalog[1];
      } else {
        pA = catalog.find(p => p.id === 7) || catalog[0]; // iPhone 15 Pro Max
        pB = catalog.find(p => p.id === 8) || catalog[1]; // S24 Ultra
      }
    } else if (lastProducts.length >= 2) {
      pA = lastProducts[0];
      pB = lastProducts[1];
    } else {
      pA = catalog.find(p => p.id === 7) || catalog[0];
      pB = catalog.find(p => p.id === 8) || catalog[1];
    }

    const comp = buildMiniComparison(pA, pB);
    return {
      ok: true,
      response:
        `⚖️ **BẢNG ĐỐI CHIẾU CHUYÊN SÂU: ${pA.name} vs ${pB.name}**\n\n` +
        `• **${pA.name}** (${fmtVND(pA.price)}): Nổi bật với ${pA.specs.split('|').slice(0, 2).join(' • ')}.\n` +
        `• **${pB.name}** (${fmtVND(pB.price)}): Vượt trội ở ${pB.specs.split('|').slice(0, 2).join(' • ')}.\n\n` +
        `Các thông số **được tô xanh (✓)** trong bảng dưới đây là điểm mạnh vượt trội của từng máy:`,
      products: [pA, pB],
      product: pA,
      comparison: comp,
      thinkingSteps,
      latencyMs: Math.max(20, Date.now() - startTime)
    };
  }

  // =========================================================================
  // 5. SEMANTIC CATALOG RAG (CATEGORY + SLANG + BUDGET + USE-CASE FILTERING)
  // =========================================================================
  const budget = parseBudget(rawMsg);

  // Detect category intent from Vietnamese slang & keywords
  let targetCategories: string[] = [];
  if (
    norm.includes('lap') ||
    norm.includes('macbook') ||
    norm.includes('ultrabook') ||
    norm.includes('notebook') ||
    norm.includes('sinh vien it') ||
    norm.includes('code') ||
    norm.includes('lap trinh') ||
    norm.includes('van phong')
  ) {
    targetCategories.push('Laptop');
  }
  if (
    norm.includes('dt') ||
    norm.includes('dien thoai') ||
    norm.includes('phone') ||
    norm.includes('iphone') ||
    norm.includes('samsung') ||
    norm.includes('xiaomi') ||
    norm.includes('chup anh') ||
    norm.includes('chup dep') ||
    norm.includes('pin trau')
  ) {
    targetCategories.push('Điện thoại');
  }
  if (
    norm.includes('tai nghe') ||
    norm.includes('airpods') ||
    norm.includes('sony') ||
    norm.includes('loa') ||
    norm.includes('marshall') ||
    norm.includes('chong on') ||
    norm.includes('anc') ||
    norm.includes('am thanh') ||
    norm.includes('iem')
  ) {
    targetCategories.push('Âm thanh');
  }
  if (
    norm.includes('ban phim') ||
    norm.includes('phim co') ||
    norm.includes('nuphy') ||
    norm.includes('chuot') ||
    norm.includes('mouse') ||
    norm.includes('logitech') ||
    norm.includes('atk') ||
    norm.includes('tay cam') ||
    norm.includes('xbox') ||
    norm.includes('sac') ||
    norm.includes('anker') ||
    norm.includes('gear')
  ) {
    targetCategories.push('Gaming Gear');
  }
  if (
    norm.includes('build pc') ||
    norm.includes('pc') ||
    norm.includes('man hinh') ||
    norm.includes('monitor') ||
    norm.includes('ssd') ||
    norm.includes('o cung') ||
    norm.includes('rtx 4090')
  ) {
    targetCategories.push('PC & Linh kiện');
  }
  if (
    norm.includes('ipad') ||
    norm.includes('tablet') ||
    norm.includes('may tinh bang') ||
    norm.includes('watch') ||
    norm.includes('dong ho') ||
    norm.includes('flycam') ||
    norm.includes('dji') ||
    norm.includes('drone')
  ) {
    targetCategories.push('Tablet & Smart Home');
  }

  // Score every product in catalog
  const scored = catalog.map(p => {
    let score = 0;
    const pNorm = normalizeVN(`${p.name} ${p.brand} ${p.category} ${p.description} ${p.specs}`);

    // Category match
    if (targetCategories.length > 0 && targetCategories.includes(p.category)) {
      score += 40;
    }

    // Specific keyword / slang boosts
    if ((norm.includes('it') || norm.includes('code') || norm.includes('sinh vien') || norm.includes('mong nhe')) && (p.id === 6 || p.id === 3 || p.id === 4)) {
      score += 35;
    }
    if ((norm.includes('gaming') || norm.includes('game') || norm.includes('do hoa')) && (p.id === 2 || p.id === 4 || p.id === 10 || p.id === 24 || p.id === 21)) {
      score += 30;
    }
    if ((norm.includes('pin trau') || norm.includes('chup dep') || norm.includes('camera')) && (p.id === 7 || p.id === 8 || p.id === 9 || p.id === 10)) {
      score += 35;
    }
    if ((norm.includes('chong on') || norm.includes('anc')) && (p.id === 12 || p.id === 11)) {
      score += 45;
    }
    if (norm.includes('ban phim') && p.id === 14) score += 50;
    if (norm.includes('chuot') && (p.id === 15 || p.id === 21)) score += 50;
    if (norm.includes('man hinh') && p.id === 19) score += 50;

    // Direct token matches
    const tokens = norm.split(' ').filter(t => t.length >= 2);
    for (const token of tokens) {
      if (pNorm.includes(token)) score += 8;
    }

    // Budget filtering
    if (budget.max) {
      if (p.price <= budget.max) {
        score += 30;
        // Closer to budget ceiling gets higher score
        const ratio = p.price / budget.max;
        if (ratio >= 0.5 && ratio <= 1.0) score += 15;
      } else {
        score -= 35; // Over budget penalty
      }
    }

    if (budget.min && p.price >= budget.min) {
      score += 20;
    }

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let topMatches = scored.filter(s => s.score > 15).map(s => s.product).slice(0, 3);
  let isFallbackAlternative = false;

  // Check if budget was strict and no exact product in that category was under budget
  if (budget.max && targetCategories.length > 0) {
    const exactInBudget = catalog.filter(
      p => targetCategories.includes(p.category) && p.price <= budget.max!
    );
    if (exactInBudget.length > 0) {
      topMatches = exactInBudget.sort((a, b) => b.price - a.price).slice(0, 3);
    } else {
      // Closest alternatives in that category
      isFallbackAlternative = true;
      topMatches = catalog
        .filter(p => targetCategories.includes(p.category))
        .sort((a, b) => Math.abs(a.price - budget.max!) - Math.abs(b.price - budget.max!))
        .slice(0, 3);
    }
  }

  if (topMatches.length === 0) {
    // Recommend top flagship deals
    topMatches = catalog.filter(p => p.isFlashSale === 1).slice(0, 3);
  }

  // Construct persuasive, structured Vietnamese response
  let headerNote = '';
  if (isFallbackAlternative && budget.max) {
    headerNote =
      `💡 **Lưu ý từ Kho hàng thực tế:** Trong danh mục **${targetCategories.join('/')}**, hiện shop không có mẫu nào dưới **${fmtVND(budget.max)}**. Tuy nhiên, mình đề xuất ngay **${topMatches.length} mẫu sát tầm giá nhất** đang có **Flash Sale & Voucher giảm sâu** cực kỳ đáng tiền:\n\n`;
  } else if (budget.max) {
    headerNote =
      `🎯 **Phân tích theo ngân sách dưới ${fmtVND(budget.max)}:** Mình đã lọc trực tiếp từ kho hàng chính hãng và chọn ra **${topMatches.length} sản phẩm tối ưu nhất** cho bạn:\n\n`;
  } else if (targetCategories.length > 0) {
    headerNote =
      `✨ **Đề xuất hàng đầu danh mục ${targetCategories.join(' & ')}:** Dưới đây là **${topMatches.length} sản phẩm bán chạy & cấu hình vượt trội nhất** tại kho TechStore Pro:\n\n`;
  } else {
    headerNote =
      `🚀 **Tư vấn Chuyên gia AI TechStore Pro:** Dựa trên nhu cầu của bạn, mình gợi ý **${topMatches.length} siêu phẩm công nghệ** đang có mức giá Flash Sale tốt nhất hôm nay:\n\n`;
  }

  const bullets = topMatches
    .map((p, idx) => {
      const specParts = p.specs.split('|').slice(0, 3).join(' • ');
      return (
        `${idx + 1}. **${p.name}** — Giá ưu đãi: **${fmtVND(p.price)}** *(Giá gốc: ${fmtVND(p.oldPrice)})*\n` +
        `   • **Cấu hình nổi bật:** ${specParts}\n` +
        `   • **Lý do nên chọn:** ${p.description.split('.')[0]}. *(Còn ${p.stock} máy • ⭐ ${p.rating}/5)*`
      );
    })
    .join('\n\n');

  const followUpTip =
    `\n\n💬 *Mẹo hỏi nhanh: Bạn có thể nhắn **"Con nào rẻ hơn?"**, **"So sánh 2 máy đầu"**, **"Máy thứ 2 có màu đen không?"** hoặc **"Thêm con đầu tiên vào giỏ giúp tôi"**!*`;

  return {
    ok: true,
    response: headerNote + bullets + followUpTip,
    products: topMatches,
    product: topMatches[0] || null,
    comparison: null,
    actionAddProduct: null,
    thinkingSteps,
    latencyMs: Math.max(14, Date.now() - startTime)
  };
}
