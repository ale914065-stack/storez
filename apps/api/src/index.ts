import { Hono } from 'hono'
import type { Context } from 'hono'

type Env = { 
  Bindings: { 
    DB: D1Database; 
    CART: KVNamespace; 
    AI: any; 
    VECTORIZE: VectorizeIndex 
  } 
}
type Line = { productId: number; qty: number }
type Product = { 
  id: number; 
  name: string; 
  description: string; 
  price: number; 
  image: string;
  category: string;
  brand: string;
  specs: string;
  colors?: string;
}

const app = new Hono<Env>().basePath('/api')

const CART_TTL = 60 * 60 * 24 * 30 

const cartKey = (c: Context<Env>) => {
  const id = c.req.header('x-cart-id')
  return id && /^[\w-]{8,64}$/.test(id) ? `cart:${id}` : null
}

const readLines = async (c: Context<Env>, key: string) =>
  (await c.env.CART.get<Line[]>(key, 'json')) ?? []

const writeLines = (c: Context<Env>, key: string, lines: Line[]) =>
  c.env.CART.put(key, JSON.stringify(lines), { expirationTtl: CART_TTL })

const hydrate = async (c: Context<Env>, lines: Line[]) => {
  if (!lines.length) return { items: [], total: 0, count: 0 }
  const marks = lines.map(() => '?').join(',')
  const { results } = await c.env.DB.prepare(`SELECT * FROM products WHERE id IN (${marks})`)
    .bind(...lines.map((l) => l.productId))
    .all<Product>()
  const byId = new Map(results.map((p) => [p.id, p]))
  const items = lines.flatMap((l) => {
    const product = byId.get(l.productId)
    return product ? [{ product, qty: l.qty }] : []
  })
  return {
    items,
    total: items.reduce((s, i) => s + i.product.price * i.qty, 0),
    count: items.reduce((s, i) => s + i.qty, 0),
  }
}

app.get('/products', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY id').all<Product>()
  return c.json(results)
})

app.get('/cart', async (c) => {
  const key = cartKey(c)
  if (!key) return c.json({ error: 'missing x-cart-id' }, 400)
  return c.json(await hydrate(c, await readLines(c, key)))
})

app.post('/cart/items', async (c) => {
  const key = cartKey(c)
  if (!key) return c.json({ error: 'missing x-cart-id' }, 400)
  const { productId } = await c.req.json<{ productId: number }>()
  const exists = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(productId).first()
  if (!exists) return c.json({ error: 'product not found' }, 404)

  const lines = await readLines(c, key)
  const line = lines.find((l) => l.productId === productId)
  if (line) line.qty += 1
  else lines.push({ productId, qty: 1 })
  await writeLines(c, key, lines)
  return c.json(await hydrate(c, lines))
})

app.put('/cart/items/:id', async (c) => {
  const key = cartKey(c)
  if (!key) return c.json({ error: 'missing x-cart-id' }, 400)
  const productId = Number(c.req.param('id'))
  const { qty } = await c.req.json<{ qty: number }>()

  let lines = await readLines(c, key)
  lines = qty > 0
    ? lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, 99) } : l))
    : lines.filter((l) => l.productId !== productId)
  await writeLines(c, key, lines)
  return c.json(await hydrate(c, lines))
})

app.delete('/cart', async (c) => {
  const key = cartKey(c)
  if (!key) return c.json({ error: 'missing x-cart-id' }, 400)
  await c.env.CART.delete(key)
  return c.json({ items: [], total: 0, count: 0 })
})


// =====================================================================
// KHỞI TẠO SẢN PHẨM (CHUẨN GAMING GEAR & TECH)
// =====================================================================
app.post('/seed-products', async (c) => {
  try {
    await c.env.DB.prepare('DROP TABLE IF EXISTS products').run()
    
    await c.env.DB.prepare(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        price INTEGER,
        image TEXT,
        category TEXT,
        brand TEXT,
        specs TEXT,
        colors TEXT
      )
    `).run()

    const realProducts = [
      // ĐIỆN THOẠI
      { id: 1, name: "iPhone 15 Pro Max 256GB", category: "Điện thoại", brand: "Apple", price: 29990000, 
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80", 
        description: "Khung viền Titanium chuẩn hàng không vũ trụ, chip A17 Pro chơi game console mượt mà.", 
        specs: "Màn hình: 6.7 inch 120Hz|Chip: Apple A17 Pro|RAM: 8GB|Camera: 48MP zoom 5x" },
      { id: 2, name: "Samsung Galaxy S24 Ultra", category: "Điện thoại", brand: "Samsung", price: 33990000, 
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80", 
        description: "Quyền năng Galaxy AI, thiết kế phẳng viền Titanium và bút S Pen thần thánh.", 
        specs: "Màn hình: 6.8 inch 120Hz|Chip: Snapdragon 8 Gen 3|RAM: 12GB|Camera: 200MP" },
      { id: 3, name: "Xiaomi 14 Pro 5G", category: "Điện thoại", brand: "Xiaomi", price: 22990000, 
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80", 
        description: "Camera Leica Summilux đỉnh cao nhiếp ảnh, HyperOS siêu mượt.", 
        specs: "Màn hình: 6.73 inch 2K|Chip: Snapdragon 8 Gen 3|RAM: 12GB|Sạc nhanh: 120W" },
      
      // LAPTOP
      { id: 4, name: "MacBook Air M2 13.6 inch", category: "Laptop", brand: "Apple", price: 24500000, 
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", 
        description: "Laptop quốc dân siêu mỏng nhẹ, pin 18 tiếng liên tục, không quạt tản nhiệt.", 
        specs: "Màn hình: 13.6 inch Liquid Retina|Chip: Apple M2|RAM: 8GB|SSD: 256GB" },
      { id: 5, name: "MacBook Pro M3 14 inch", category: "Laptop", brand: "Apple", price: 39990000, 
        image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&q=80", 
        description: "Sức mạnh khủng khiếp từ chip M3, màn hình mini-LED ProMotion siêu nét.", 
        specs: "Màn hình: 14.2 inch 120Hz|Chip: Apple M3|RAM: 8GB|SSD: 512GB" },
      { id: 6, name: "ASUS ROG Strix G15", category: "Laptop", brand: "ASUS", price: 27990000, 
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80", 
        description: "Cỗ máy chiến game eSports đích thực, tản nhiệt kim loại lỏng bọc RGB cực ngầu.", 
        specs: "Màn hình: 15.6 inch 144Hz|CPU: Ryzen 7 6800H|VGA: RTX 3050|RAM: 16GB" },
      { id: 7, name: "Dell XPS 15 9520", category: "Laptop", brand: "Dell", price: 42900000, 
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80", 
        description: "Đỉnh cao laptop doanh nhân, viền màn hình siêu mỏng InfinityEdge 4K.", 
        specs: "Màn hình: 15.6 inch 4K OLED|CPU: Core i7 12700H|VGA: RTX 3050Ti|RAM: 16GB" },

      // TABLET
      { id: 8, name: "iPad Pro M2 11 inch", category: "Tablet", brand: "Apple", price: 21490000, 
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80", 
        description: "Máy tính bảng mạnh nhất thế giới, hỗ trợ Apple Pencil 2 tính năng lướt (Hover).", 
        specs: "Màn hình: 11 inch 120Hz|Chip: Apple M2|RAM: 8GB|Lưu trữ: 128GB" },
      { id: 9, name: "Galaxy Tab S9 Ultra", category: "Tablet", brand: "Samsung", price: 29990000, 
        image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=600&q=80", 
        description: "Màn hình khổng lồ 14.6 inch, chống nước IP68 đầu tiên trên tablet cao cấp.", 
        specs: "Màn hình: 14.6 inch Dynamic AMOLED|Chip: Snapdragon 8 Gen 2|RAM: 12GB|Kèm S-Pen" },

      // ÂM THANH
      { id: 10, name: "Tai nghe Sony WH-1000XM5", category: "Âm thanh", brand: "Sony", price: 7990000, 
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", 
        description: "Chống ồn chủ động tốt nhất thế giới, thiết kế mới thanh lịch và đàm thoại rõ nét.", 
        specs: "Kết nối: Bluetooth 5.2|Pin: 30 giờ|Chống ồn: Có (ANC)|Micro: 8 mic" },
      { id: 11, name: "Apple AirPods Pro 2", category: "Âm thanh", brand: "Apple", price: 6190000, 
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80", 
        description: "Chip H2 nâng cấp âm thanh vòm, chống ồn gấp đôi và xuyên âm tự động điều chỉnh.", 
        specs: "Kết nối: Bluetooth 5.3|Pin: 30 giờ (kèm hộp)|Tính năng: Xuyên âm tự động, ANC" },
      { id: 12, name: "Loa Marshall Stanmore III", category: "Âm thanh", brand: "Marshall", price: 8990000, 
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80", 
        description: "Loa bluetooth để bàn phong cách Vintage, âm trầm sâu lực đặc trưng của Marshall.", 
        specs: "Kết nối: Bluetooth 5.2, AUX|Công suất: 80W|Trọng lượng: 4.25kg|Nguồn cắm điện" },
      { id: 13, name: "Loa JBL Flip 6", category: "Âm thanh", brand: "JBL", price: 2490000, 
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80", 
        description: "Loa di động chống nước IP67, âm thanh 2 chiều chi tiết, dã ngoại cực cháy.", 
        specs: "Kết nối: Bluetooth 5.1|Pin: 12 giờ|Công suất: 30W|Chống nước: IP67" },

      // PHỤ KIỆN & GEAR (CHUẨN PHONG CÁCH QM TECH)
      { id: 14, name: "Bàn Phím Cơ NuPhy Air75 V2", category: "Phụ kiện", brand: "NuPhy", price: 2890000, 
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", 
        description: "Low-profile siêu mỏng cho Coder và Dân văn phòng, gõ êm ái, kết nối 3 mode.", 
        specs: "Switch: Gateron Red|Layout: 75%|Kết nối: Bluetooth, 2.4G|Pin: 4000mAh" },
      { id: 15, name: "Chuột Logitech MX Master 3S", category: "Phụ kiện", brand: "Logitech", price: 2290000, 
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80", 
        description: "Chuột công thái học tốt nhất, click siêu êm (Quiet Clicks), cuộn từ tính vô cực.", 
        specs: "DPI: 8000|Form: Công thái học|Kết nối: Bluetooth, Logi Bolt|Pin: 70 ngày" },
      { id: 16, name: "Sạc nhanh Anker Prime 67W", category: "Phụ kiện", brand: "Anker", price: 1190000, 
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80", 
        description: "Củ sạc GaN siêu nhỏ gọn, sạc cùng lúc MacBook, iPhone và Tai nghe.", 
        specs: "Công suất: 67W|Cổng sạc: 2x USB-C, 1x USB-A|Công nghệ: GaNPrime|Chân gập" },
      { id: 17, name: "Tay cầm Xbox Wireless", category: "Phụ kiện", brand: "Microsoft", price: 1390000, 
        image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&q=80", 
        description: "Tay cầm chơi game PC quốc dân, phản hồi rung chân thực, phím bấm nảy êm.", 
        specs: "Kết nối: Bluetooth, Wireless|Tương thích: Windows, iOS, Android|Pin: AA" },
      
      // SẢN PHẨM MỚI BỔ SUNG GIỐNG QM TECH (CÓ TÍNH NĂNG CHỌN MÀU SẮC)
      { id: 21, name: "Chuột ATK A9 Air Ultimate+ Wireless", category: "Phụ kiện", brand: "ATK", price: 1609000, 
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80", 
        description: "Chuột gaming flagship cảm biến PAW3950 Ultra, trọng lượng siêu nhẹ 54g.", 
        specs: "DPI: 42000|Polling Rate: 8000Hz|Trọng lượng: 54g",
        colors: JSON.stringify([
          { name: "Đen", hex: "#111111", img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80" },
          { name: "Cam", hex: "#f97316", img: "https://images.unsplash.com/photo-1586159752670-d282a514d4ef?w=600&q=80" },
          { name: "Trắng", hex: "#f8fafc", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80" }
        ])
      },
      { 
        id: 22, name: "Tai nghe ATK Horizon IEM", category: "Âm thanh", brand: "ATK", price: 999000, 
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", 
        description: "Tai nghe có dây chuyên game và nghe nhạc âm trường rộng, chống ồn tốt.", 
        specs: "Jack: 3.5mm/Type-C|Driver: Dynamic|Mic: Có đàm thoại",
        colors: JSON.stringify([
          { name: "Xám Titan", hex: "#4b5563", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80" },
          { name: "Bạc", hex: "#e2e8f0", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" }
        ])
      },
      { 
        id: 23, name: "Túi thấm hút mồ hôi tay Pygora", category: "Phụ kiện", brand: "Pygora", price: 45000, 
        image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80", 
        description: "Túi vải hút ẩm tay cầm chơi game, chống trơn trượt khi combat căng thẳng.", 
        specs: "Chất liệu: Vải kháng khuẩn|Trọng lượng: 50g",
        colors: JSON.stringify([
          { name: "Đen", hex: "#000000", img: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80" }
        ])
      },

      // SMARTWATCH & THIẾT BỊ KHÁC
      { id: 18, name: "Đồng hồ Apple Watch Series 9", category: "Smartwatch", brand: "Apple", price: 9490000, 
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80", 
        description: "Chip S9 mạnh mẽ, thao tác chạm hai lần (Double Tap) vi diệu không cần chạm màn hình.", 
        specs: "Màn hình: Always-On 2000nits|Tính năng: ECG, SpO2|Chống nước: 50m|Pin: 18 giờ" },
      { id: 19, name: "Màn hình LG UltraGear 27'' 2K", category: "Màn hình", brand: "LG", price: 6890000, 
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80", 
        description: "Màn hình chuẩn eSports, tấm nền Nano IPS màu rực rỡ, góc nhìn rộng.", 
        specs: "Độ phân giải: 2K (2560x1440)|Tần số: 180Hz|Tấm nền: Nano IPS|Phản hồi: 1ms" },
      { id: 20, name: "Flycam DJI Mini 4 Pro", category: "Camera", brand: "DJI", price: 18990000, 
        image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&q=80", 
        description: "Drone mini quay dọc 4K/60fps sắc nét, cảm biến vật cản đa hướng an toàn tuyệt đối.", 
        specs: "Trọng lượng: <249g|Camera: 4K HDR|Thời gian bay: 34 phút|Cảm biến: Đa hướng" }
    ]

    const stmt = c.env.DB.prepare('INSERT INTO products (id, name, description, price, image, category, brand, specs, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    for (const p of realProducts) {
      await stmt.bind(p.id, p.name, p.description, p.price, p.image, p.category, p.brand, p.specs, p.colors || null).run()
    }

    return c.json({ ok: true, message: "Đã tạo bảng và nạp sản phẩm gear thành công!" })
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

// =====================================================================
// TÍNH NĂNG AI CHATBOT & VECTOR SEARCH (RAG)
// =====================================================================

app.post('/sync-vectors', async (c) => {
  try {
    const { results: products } = await c.env.DB.prepare('SELECT * FROM products').all<Product>()
    
    const vectors = []
    for (const p of products) {
      const contentText = `[${p.category} - ${p.brand}] ${p.name}. Mô tả: ${p.description}. Cấu hình: ${p.specs}. Giá bán: ${p.price} VNĐ`
      
      const embeddingResponse = await c.env.AI.run('@cf/baai/bge-m3', {
        text: [contentText]
      })
      
      const values = embeddingResponse.data[0]
      vectors.push({
        id: `product_${p.id}`,
        values: values,
        metadata: { type: 'product', productId: p.id, name: p.name }
      })
    }

    if (vectors.length > 0) {
      await c.env.VECTORIZE.upsert(vectors)
    }

    return c.json({ ok: true, message: 'Đã đồng bộ vector thành công!', total_indexed: vectors.length })
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

app.post('/chat', async (c) => {
  try {
    const { message } = await c.req.json<{ message: string }>()
    if (!message) return c.json({ error: 'Missing message' }, 400)

    let contextText = ""
    let matchedProductId: number | null = null

    try {
      const queryEmbedding = await c.env.AI.run('@cf/baai/bge-m3', { text: [message] })
      const vector = queryEmbedding?.data?.[0] || queryEmbedding?.[0]

      if (vector && c.env.VECTORIZE) {
        const vectorizeResult = await c.env.VECTORIZE.query(vector, { topK: 3 })
        const matches = vectorizeResult?.matches || []

        for (const match of matches) {
          if (match?.metadata?.productId) {
            const p = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
              .bind(match.metadata.productId)
              .first<Product>()
            if (p) {
              if (!matchedProductId) matchedProductId = p.id;
              contextText += `- ID: ${p.id} | ${p.name} (Hãng ${p.brand}). Cấu hình: ${p.specs}. Giá: ${p.price} VNĐ.\n`
            }
          }
        }
      }
    } catch (vectorErr) {
      console.log('Vector search fallback')
    }

    if (!contextText) {
      const { results } = await c.env.DB.prepare('SELECT * FROM products LIMIT 5').all<Product>()
      for (const p of results) {
        contextText += `- ID: ${p.id} | ${p.name} (Hãng ${p.brand}). Giá: ${p.price} VNĐ.\n`
      }
      if (results.length > 0) matchedProductId = results[0].id;
    }

    const aiResponse = await c.env.AI.run('@cf/google/gemma-4-26b-a4b-it', {
      messages: [
        { 
          role: "system", 
          content: `Bạn là trợ lý tư vấn chuyên nghiệp của TechStore Pro. Hãy dùng thông tin phần cứng dưới đây để trả lời câu hỏi của khách thật tự nhiên, chính xác, lịch sự bằng tiếng Việt:\n${contextText}` 
        },
        { role: "user", content: message }
      ]
    })

    let replyText = ""
    if (typeof aiResponse === 'string') {
      replyText = aiResponse
    } else if (aiResponse?.response) {
      replyText = typeof aiResponse.response === 'string' ? aiResponse.response : JSON.stringify(aiResponse.response)
    } else if (aiResponse?.choices?.[0]?.message?.content) {
      replyText = aiResponse.choices[0].message.content
    } else {
      replyText = "Cảm ơn bạn đã quan tâm đến TechStore Pro! Bạn cần tư vấn thêm về sản phẩm nào?"
    }

    let matchedProduct: Product | null = null;
    const lowerMsg = message.toLowerCase();
    
    const allProds = await c.env.DB.prepare('SELECT * FROM products').all<Product>();
    for (const p of allProds.results) {
      if (lowerMsg.includes(p.name.toLowerCase()) || lowerMsg.includes(p.brand.toLowerCase()) || lowerMsg.includes(p.category.toLowerCase())) {
        matchedProduct = p;
        break;
      }
    }

    if (!matchedProduct && matchedProductId) {
      matchedProduct = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(matchedProductId).first<Product>() || null;
    }

    return c.json({ ok: true, response: replyText, product: matchedProduct })
  } catch (err: any) {
    return c.json({ ok: false, error: err.message || 'Server error' }, 500)
  }
})

export default app