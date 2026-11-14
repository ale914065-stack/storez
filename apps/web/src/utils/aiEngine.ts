import type { Product, ComparisonRow, ChatComparisonData } from '../types'

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

export function parseBudgetVN(raw: string): { max?: number; min?: number; target?: number } {
  const norm = normalizeVN(raw);
  const result: { max?: number; min?: number; target?: number } = {};

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

export function buildClientComparison(pA: Product, pB: Product): ChatComparisonData {
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
      valA: specsA.cpu || (pA.specs || '').split('|')[0] || 'Flagship',
      valB: specsB.cpu || (pB.specs || '').split('|')[0] || 'Flagship',
      winner: pA.price > pB.price ? 'A' : pB.price > pA.price ? 'B' : 'tie'
    },
    {
      label: 'RAM / Hiệu suất',
      valA: specsA.ram || 'Cao cấp',
      valB: specsB.ram || 'Cao cấp',
      winner: extractNum(specsA.ram) > extractNum(specsB.ram) ? 'A' : extractNum(specsB.ram) > extractNum(specsA.ram) ? 'B' : 'tie'
    },
    {
      label: 'Màn hình / Thiết kế',
      valA: specsA.display || 'Chuẩn Flagship',
      valB: specsB.display || 'Chuẩn Flagship',
      winner: (specsA.display || '').includes('XDR') || (specsA.display || '').includes('Mini-LED') ? 'A' : (specsB.display || '').includes('AMOLED') || (specsB.display || '').includes('OLED') ? 'B' : 'tie'
    },
    {
      label: 'Thời lượng Pin',
      valA: specsA.battery || 'Cả ngày',
      valB: specsB.battery || 'Cả ngày',
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
      valA: `⭐ ${pA.rating || 4.9} (${pA.soldCount || 200} đã bán)`,
      valB: `⭐ ${pB.rating || 4.9} (${pB.soldCount || 200} đã bán)`,
      winner: (pA.soldCount || 0) >= (pB.soldCount || 0) ? 'A' : 'B'
    }
  ];

  const diffPrice = Math.abs(pA.price - pB.price);
  const cheaper = pA.price <= pB.price ? pA : pB;
  const stronger = pA.price > pB.price ? pA : pB;

  const verdict = `💡 **Nhận định từ Chuyên gia AI:** Chọn **${cheaper.name}** nếu bạn muốn tối ưu ngân sách (tiết kiệm **${fmtVND(diffPrice)}**) và hiệu suất/giá thành cao. Chọn **${stronger.name}** nếu bạn ưu tiên cấu hình đỉnh cao nhất phân khúc và trải nghiệm lâu dài.`;

  return { productA: pA, productB: pB, rows, verdict };
}

export function runLocalConciergeEngine(
  message: string,
  catalog: Product[],
  lastProductIds: number[],
  mode: 'advisor' | 'compare' | 'deal' = 'advisor'
): {
  response: string;
  products: Product[];
  comparison?: ChatComparisonData | null;
  actionAddProduct?: Product | null;
} {
  const norm = normalizeVN(message);
  const lastProducts = lastProductIds
    .map(id => catalog.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  // 1. Multi-turn Add to Cart Intent
  const isAddToCart =
    (norm.includes('them') && (norm.includes('gio') || norm.includes('cart'))) ||
    norm.includes('mua con') ||
    norm.includes('mua may') ||
    norm.includes('lay con') ||
    norm.includes('chot con') ||
    norm.includes('them may dau');

  if (isAddToCart) {
    let targetProd: Product | undefined;
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
      } else if (norm.includes('re hon') || norm.includes('re nhat')) {
        targetProd = [...lastProducts].sort((a, b) => a.price - b.price)[0];
      } else {
        targetProd = lastProducts[0];
      }
    }
    if (!targetProd) targetProd = catalog[0];

    return {
      response:
        `✅ **Đã thêm tự động vào giỏ hàng giúp bạn!**\n\n` +
        `• Sản phẩm: **${targetProd.name}**\n` +
        `• Giá ưu đãi: **${fmtVND(targetProd.price)}** *(Tiết kiệm ${fmtVND((targetProd.oldPrice || targetProd.price * 1.15) - targetProd.price)})*\n` +
        `• Đặc quyền: **Freeship Extra Hỏa tốc 2h** + Áp dụng ngay mã **TECH10** hoặc **CYBER500K** trong giỏ hàng.\n\n` +
        `Bạn có thể bấm vào biểu tượng **Giỏ hàng** góc phải để hoàn tất đặt hàng hoặc hỏi thêm phụ kiện mua kèm nhé!`,
      products: [targetProd],
      actionAddProduct: targetProd
    };
  }

  // 2. Multi-turn Color / Stock question
  if (
    norm.includes('mau') &&
    (norm.includes('khong') || norm.includes('gi') || norm.includes('nao') || norm.includes('den') || norm.includes('trang') || norm.includes('titan'))
  ) {
    let targetProd: Product | undefined;
    if (norm.includes('thu 2') || norm.includes('so 2') || norm.includes('hai')) {
      targetProd = lastProducts[1] || lastProducts[0];
    } else if (lastProducts.length > 0) {
      targetProd = lastProducts[0];
    }
    if (!targetProd) targetProd = catalog[0];

    let colors: Array<{ name: string; hex: string }> = [];
    try { colors = JSON.parse(targetProd.colors || '[]'); } catch {}
    const colorNames = colors.map(c => `**${c.name}**`).join(', ');
    const askedBlack = norm.includes('den') || norm.includes('black');
    const hasBlack = colors.some(c => {
      const cn = normalizeVN(c.name);
      return cn.includes('den') || cn.includes('black') || cn.includes('graphite') || cn.includes('midnight');
    });

    const prefix = askedBlack
      ? hasBlack
        ? `🎯 **Có sẵn hàng nhé!** Mẫu **${targetProd.name}** hiện đang có phiên bản màu Đen/Tối cực kỳ sang trọng tại kho.`
        : `ℹ️ Mẫu **${targetProd.name}** hiện có các phối màu đặc biệt tương đương cực đẹp:`
      : `🎨 Mẫu **${targetProd.name}** hiện đang sẵn kho với **${colors.length || 1} phiên bản màu sắc**:`;

    return {
      response:
        `${prefix}\n\n` +
        `• Phối màu chính hãng: ${colorNames || '**Bản Tiêu Chuẩn**'}\n` +
        `• Giá ưu đãi: **${fmtVND(targetProd.price)}** (Sẵn kho **${targetProd.stock || 20}** sản phẩm)\n\n` +
        `Bạn muốn mình **thêm mẫu này vào giỏ hàng** giúp bạn luôn không?`,
      products: [targetProd]
    };
  }

  // 3. Multi-turn "Con nào rẻ hơn?" / "Nên mua con nào?"
  if (
    lastProducts.length >= 2 &&
    (norm.includes('re hon') || norm.includes('manh hon') || norm.includes('tot hon') || norm.includes('nen mua') || norm.includes('nen chon'))
  ) {
    const pA = lastProducts[0];
    const pB = lastProducts[1];
    const cheaper = pA.price <= pB.price ? pA : pB;
    const pricier = pA.price <= pB.price ? pB : pA;
    const diff = pricier.price - cheaper.price;
    const comp = buildClientComparison(pA, pB);

    return {
      response:
        `📊 **Phân tích trực tiếp từ 2 sản phẩm bạn đang quan tâm:**\n\n` +
        `• **${cheaper.name}** có mức giá **rẻ hơn ${fmtVND(diff)}** (chỉ **${fmtVND(cheaper.price)}** so với **${fmtVND(pricier.price)}**).\n` +
        `• **Nên chọn ${cheaper.name}** nếu bạn ưu tiên hiệu năng/giá thành tốt nhất và tiết kiệm chi phí.\n` +
        `• **Nên chọn ${pricier.name}** nếu bạn cần cấu hình cao cấp hơn (${(pricier.specs || '').split('|').slice(0, 2).join(' • ')}) phục vụ công việc chuyên sâu.\n\n` +
        `Xem ngay **Bảng đối chiếu thông số** bên dưới nhé!`,
      products: [cheaper, pricier],
      comparison: comp
    };
  }

  // 4. Explicit Comparison Intent
  if (norm.includes('so sanh') || norm.includes(' vs ') || norm.includes('doi chieu') || mode === 'compare') {
    const mentioned: Product[] = [];
    for (const p of catalog) {
      const pNorm = normalizeVN(p.name);
      const keywords = pNorm.split(' ').filter(w => w.length > 2);
      const matchCount = keywords.filter(k => norm.includes(k)).length;
      if (matchCount >= 2 || (norm.includes('iphone') && p.id === 7) || (norm.includes('s24') && p.id === 8) || (norm.includes('macbook air') && p.id === 3) || (norm.includes('macbook pro') && p.id === 1) || (norm.includes('rog') && p.id === 2)) {
        if (!mentioned.some(m => m.id === p.id)) mentioned.push(p);
      }
    }

    let pA: Product;
    let pB: Product;
    if (mentioned.length >= 2) {
      pA = mentioned[0];
      pB = mentioned[1];
    } else if (lastProducts.length >= 2 && !norm.includes('ban chay')) {
      pA = lastProducts[0];
      pB = lastProducts[1];
    } else {
      pA = catalog.find(p => p.id === 7) || catalog[0];
      pB = catalog.find(p => p.id === 8) || catalog[1];
    }

    const comp = buildClientComparison(pA, pB);
    return {
      response:
        `⚖️ **SO SÁNH TRỰC TIẾP: ${pA.name} vs ${pB.name}**\n\n` +
        `• **${pA.name}** (${fmtVND(pA.price)}): ${(pA.specs || '').split('|').slice(0, 2).join(' • ')}\n` +
        `• **${pB.name}** (${fmtVND(pB.price)}): ${(pB.specs || '').split('|').slice(0, 2).join(' • ')}\n\n` +
        `Mình đã **tô xanh (✓)** các điểm mạnh vượt trội của từng máy trong bảng dưới đây:`,
      products: [pA, pB],
      comparison: comp
    };
  }

  // 5. Semantic Catalog RAG
  const budget = parseBudgetVN(message);
  const targetCategories: string[] = [];

  if (norm.includes('lap') || norm.includes('macbook') || norm.includes('it') || norm.includes('code') || norm.includes('sinh vien') || norm.includes('van phong')) {
    targetCategories.push('Laptop');
  }
  if (norm.includes('dt') || norm.includes('dien thoai') || norm.includes('iphone') || norm.includes('samsung') || norm.includes('xiaomi') || norm.includes('pin trau') || norm.includes('chup dep')) {
    targetCategories.push('Điện thoại');
  }
  if (norm.includes('tai nghe') || norm.includes('airpods') || norm.includes('sony') || norm.includes('loa') || norm.includes('marshall') || norm.includes('chong on') || norm.includes('anc')) {
    targetCategories.push('Âm thanh');
  }
  if (norm.includes('ban phim') || norm.includes('phim co') || norm.includes('nuphy') || norm.includes('chuot') || norm.includes('logitech') || norm.includes('atk') || norm.includes('tay cam') || norm.includes('sac') || norm.includes('gear') || norm.includes('goc gaming')) {
    targetCategories.push('Gaming Gear');
  }
  if (norm.includes('build pc') || norm.includes('pc') || norm.includes('man hinh') || norm.includes('ssd') || norm.includes('rtx 4090')) {
    targetCategories.push('PC & Linh kiện');
  }
  if (norm.includes('ipad') || norm.includes('tablet') || norm.includes('watch') || norm.includes('dong ho') || norm.includes('flycam') || norm.includes('dji')) {
    targetCategories.push('Tablet & Smart Home');
  }

  const scored = catalog.map(p => {
    let score = 0;
    const pNorm = normalizeVN(`${p.name} ${p.brand} ${p.category} ${p.description} ${p.specs}`);

    if (targetCategories.length > 0 && p.category && targetCategories.includes(p.category)) {
      score += 40;
    }
    if ((norm.includes('it') || norm.includes('code') || norm.includes('sinh vien') || norm.includes('mong nhe')) && (p.id === 6 || p.id === 3 || p.id === 4)) {
      score += 35;
    }
    if ((norm.includes('gaming') || norm.includes('do hoa')) && (p.id === 2 || p.id === 4 || p.id === 10 || p.id === 24 || p.id === 21)) {
      score += 30;
    }
    if ((norm.includes('pin trau') || norm.includes('chup dep')) && (p.id === 7 || p.id === 8 || p.id === 9 || p.id === 10)) {
      score += 35;
    }
    if ((norm.includes('chong on') || norm.includes('anc')) && (p.id === 12 || p.id === 11)) {
      score += 45;
    }

    const tokens = norm.split(' ').filter(t => t.length >= 2);
    for (const token of tokens) {
      if (pNorm.includes(token)) score += 8;
    }

    if (budget.max) {
      if (p.price <= budget.max) {
        score += 30;
      } else {
        score -= 35;
      }
    }
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  let topMatches = scored.filter(s => s.score > 15).map(s => s.product).slice(0, 3);
  let isFallbackAlternative = false;

  if (budget.max && targetCategories.length > 0) {
    const exactInBudget = catalog.filter(p => p.category && targetCategories.includes(p.category) && p.price <= budget.max!);
    if (exactInBudget.length > 0) {
      topMatches = exactInBudget.sort((a, b) => b.price - a.price).slice(0, 3);
    } else {
      isFallbackAlternative = true;
      topMatches = catalog
        .filter(p => p.category && targetCategories.includes(p.category))
        .sort((a, b) => Math.abs(a.price - budget.max!) - Math.abs(b.price - budget.max!))
        .slice(0, 3);
    }
  }

  if (topMatches.length === 0) {
    topMatches = catalog.filter(p => p.isFlashSale === 1).slice(0, 3);
  }

  const header = isFallbackAlternative && budget.max
    ? `💡 **Tư vấn thực tế từ Kho hàng:** Trong danh mục **${targetCategories.join('/')}**, hiện shop không có mẫu dưới **${fmtVND(budget.max)}**. Mình gợi ý ngay **${topMatches.length} mẫu sát ngân sách nhất** đang được trợ giá Flash Sale cực sâu:\n\n`
    : budget.max
    ? `🎯 **Top sản phẩm đáng mua nhất tầm giá dưới ${fmtVND(budget.max)}:**\n\n`
    : targetCategories.length > 0
    ? `✨ **Top đề xuất hàng đầu danh mục ${targetCategories.join(' & ')}:**\n\n`
    : `🚀 **Đề xuất Flagship & Deal Công Nghệ Hot nhất hôm nay:**\n\n`;

  const body = topMatches
    .map((p, i) => {
      const specs = (p.specs || '').split('|').slice(0, 3).join(' • ');
      return (
        `${i + 1}. **${p.name}** — **${fmtVND(p.price)}** *(Giá gốc: ${fmtVND(p.oldPrice || p.price * 1.15)})*\n` +
        `   • **Thông số:** ${specs}\n` +
        `   • **Điểm ăn tiền:** ${p.description.split('.')[0]}. *(Còn ${p.stock || 20} máy • ⭐ ${p.rating || 4.9}/5)*`
      );
    })
    .join('\n\n');

  const tip = `\n\n💬 *Gợi ý hỏi tiếp: **"Con nào rẻ hơn?"**, **"Máy thứ 2 có màu đen không?"**, **"So sánh 2 máy đầu"** hoặc **"Thêm con đầu tiên vào giỏ giúp tôi"**!*`;

  return {
    response: header + body + tip,
    products: topMatches
  };
}
