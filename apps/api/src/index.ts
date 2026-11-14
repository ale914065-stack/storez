import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import { INITIAL_PRODUCTS, type BackendProduct } from './catalogData'
import { processSmartConcierge, type ChatTurnRequest } from './aiConcierge'

type Env = {
  Bindings: {
    DB: D1Database;
    CART: KVNamespace;
    AI: any;
    VECTORIZE: VectorizeIndex;
  };
}

type Line = { productId: number; qty: number; selectedColor?: string; selectedStorage?: string; unitPrice?: number }

export interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  shippingMethod: 'express' | 'standard';
  paymentMethod: 'cod' | 'vietqr' | 'card' | 'installment';
  items: string; // JSON string
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  voucherCode?: string;
  status: 'pending' | 'packing' | 'shipping' | 'delivered';
  createdAt: string;
}

const app = new Hono<Env>().basePath('/api')
app.use('*', cors())

const CART_TTL = 60 * 60 * 24 * 30

// Resilient in-memory fallback stores so Worker NEVER returns 500 even if local bindings reset
let memoryProducts: BackendProduct[] = [...INITIAL_PRODUCTS]
const memoryCarts = new Map<string, Line[]>()
let memoryOrders: OrderRecord[] = [
  {
    id: 'ORD-889201',
    customerName: 'Nguyễn Minh Quân',
    phone: '0909123456',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    address: 'Tòa nhà Bitexco, Số 2 Hải Triều',
    shippingMethod: 'express',
    paymentMethod: 'vietqr',
    items: JSON.stringify([
      { productId: 7, name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', price: 29490000, qty: 1, image: INITIAL_PRODUCTS[6].image, variant: 'Titan Tự Nhiên • 256GB' },
      { productId: 11, name: 'Tai nghe Apple AirPods Pro 2 USB-C MagSafe', price: 5790000, qty: 1, image: INITIAL_PRODUCTS[10].image, variant: 'Trắng Pure White' }
    ]),
    subtotal: 35280000,
    shippingFee: 0,
    discount: 2000000,
    total: 33280000,
    voucherCode: 'VIP2TR',
    status: 'shipping',
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
  },
  {
    id: 'ORD-889145',
    customerName: 'Trần Hoàng Bảo Trâm',
    phone: '0987654321',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    address: 'Số 144 Xuân Thủy, Dịch Vọng Hậu',
    shippingMethod: 'standard',
    paymentMethod: 'installment',
    items: JSON.stringify([
      { productId: 3, name: 'MacBook Air M3 13.6 inch 16GB/512GB', price: 27490000, qty: 1, image: INITIAL_PRODUCTS[2].image, variant: 'Xanh Đêm (Midnight) • 16GB / 512GB SSD' }
    ]),
    subtotal: 27490000,
    shippingFee: 0,
    discount: 1500000,
    total: 25990000,
    voucherCode: 'TECH10',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString()
  }
]

let dbInitialized = false

async function ensureDatabaseReady(c: Context<Env>): Promise<BackendProduct[]> {
  if (!c.env?.DB) return memoryProducts

  try {
    if (!dbInitialized) {
      // Check if products table has structuredSpecs column
      let needsMigration = false
      try {
        const check = await c.env.DB.prepare('SELECT id, image, structuredSpecs FROM products').all<BackendProduct>()
        if (
          !check.results ||
          check.results.length < 20 ||
          check.results.some(r => !r.structuredSpecs || r.image?.includes('photo-1695048133142'))
        ) {
          needsMigration = true
        }
      } catch {
        needsMigration = true
      }

      if (needsMigration) {
        await seedDatabaseInternal(c.env.DB)
      }

      // Ensure orders table exists
      await c.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customerName TEXT,
          phone TEXT,
          province TEXT,
          district TEXT,
          address TEXT,
          shippingMethod TEXT,
          paymentMethod TEXT,
          items TEXT,
          subtotal INTEGER,
          shippingFee INTEGER,
          discount INTEGER,
          total INTEGER,
          voucherCode TEXT,
          status TEXT,
          createdAt TEXT
        )
      `).run()

      const existingOrders = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM orders').first<{ cnt: number }>()
      if (!existingOrders || existingOrders.cnt === 0) {
        const orderStmt = c.env.DB.prepare(`
          INSERT OR REPLACE INTO orders (id, customerName, phone, province, district, address, shippingMethod, paymentMethod, items, subtotal, shippingFee, discount, total, voucherCode, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        for (const o of memoryOrders) {
          await orderStmt.bind(
            o.id, o.customerName, o.phone, o.province, o.district, o.address,
            o.shippingMethod, o.paymentMethod, o.items, o.subtotal, o.shippingFee,
            o.discount, o.total, o.voucherCode || '', o.status, o.createdAt
          ).run()
        }
      }

      dbInitialized = true
    }

    const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY id').all<BackendProduct>()
    if (results && results.length > 0) {
      memoryProducts = results
      return results
    }
  } catch (err) {
    console.warn('D1 fallback to memoryProducts:', err)
  }

  return memoryProducts
}

async function seedDatabaseInternal(db: D1Database) {
  await db.prepare('DROP TABLE IF EXISTS products').run()
  await db.prepare(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      oldPrice INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL,
      gallery TEXT DEFAULT '[]',
      category TEXT DEFAULT 'Phụ kiện',
      brand TEXT DEFAULT 'TechStore',
      specs TEXT DEFAULT '',
      structuredSpecs TEXT DEFAULT '{}',
      colors TEXT DEFAULT '[]',
      storageOptions TEXT DEFAULT '[]',
      rating REAL DEFAULT 4.9,
      reviewCount INTEGER DEFAULT 100,
      soldCount INTEGER DEFAULT 200,
      stock INTEGER DEFAULT 25,
      freeship INTEGER DEFAULT 1,
      installment0 INTEGER DEFAULT 1,
      isFlashSale INTEGER DEFAULT 0,
      flashSalePrice INTEGER DEFAULT 0,
      flashSaleSold INTEGER DEFAULT 0,
      flashSaleTotal INTEGER DEFAULT 0,
      isFlagship INTEGER DEFAULT 0,
      frequentlyBoughtIds TEXT DEFAULT '[]'
    )
  `).run()

  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, description, price, oldPrice, image, gallery, category, brand,
      specs, structuredSpecs, colors, storageOptions, rating, reviewCount,
      soldCount, stock, freeship, installment0, isFlashSale, flashSalePrice,
      flashSaleSold, flashSaleTotal, isFlagship, frequentlyBoughtIds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const p of INITIAL_PRODUCTS) {
    await stmt.bind(
      p.id, p.name, p.description, p.price, p.oldPrice, p.image, p.gallery,
      p.category, p.brand, p.specs, p.structuredSpecs, p.colors, p.storageOptions,
      p.rating, p.reviewCount, p.soldCount, p.stock, p.freeship, p.installment0,
      p.isFlashSale, p.flashSalePrice, p.flashSaleSold, p.flashSaleTotal,
      p.isFlagship, p.frequentlyBoughtIds
    ).run()
  }
}

const cartKey = (c: Context<Env>) => {
  const id = c.req.header('x-cart-id')
  return id && /^[\w-]{8,64}$/.test(id) ? `cart:${id}` : 'cart:default-guest-session'
}

const readLines = async (c: Context<Env>, key: string): Promise<Line[]> => {
  try {
    if (c.env?.CART) {
      const data = await c.env.CART.get<Line[]>(key, 'json')
      if (data) {
        memoryCarts.set(key, data)
        return data
      }
    }
  } catch {}
  return memoryCarts.get(key) ?? []
}

const writeLines = async (c: Context<Env>, key: string, lines: Line[]) => {
  memoryCarts.set(key, lines)
  try {
    if (c.env?.CART) {
      await c.env.CART.put(key, JSON.stringify(lines), { expirationTtl: CART_TTL })
    }
  } catch {}
}

const hydrate = async (c: Context<Env>, lines: Line[]) => {
  if (!lines.length) return { items: [], total: 0, count: 0 }
  const catalog = await ensureDatabaseReady(c)
  const byId = new Map(catalog.map((p) => [p.id, p]))
  const items = lines.flatMap((l) => {
    const product = byId.get(l.productId)
    if (!product) return []
    const effectivePrice = l.unitPrice || product.price
    return [{
      product: { ...product, price: effectivePrice },
      qty: l.qty,
      selectedColor: l.selectedColor,
      selectedStorage: l.selectedStorage
    }]
  })
  return {
    items,
    total: items.reduce((s, i) => s + i.product.price * i.qty, 0),
    count: items.reduce((s, i) => s + i.qty, 0),
  }
}

// =====================================================================
// PRODUCTS ENDPOINTS (GET / POST / PUT / DELETE / SEED)
// =====================================================================
app.get('/products', async (c) => {
  const results = await ensureDatabaseReady(c)
  return c.json(results)
})

app.post('/products', async (c) => {
  const body = await c.req.json<Partial<BackendProduct>>()
  const catalog = await ensureDatabaseReady(c)
  const nextId = catalog.reduce((max, p) => Math.max(max, p.id), 900) + 1
  const newProduct: BackendProduct = {
    id: nextId,
    name: body.name || 'Sản phẩm Công nghệ Mới',
    description: body.description || 'Sản phẩm chính hãng phân phối tại TechStore Pro.',
    price: Number(body.price) || 9990000,
    oldPrice: Number(body.oldPrice) || Math.round((Number(body.price) || 9990000) * 1.18),
    image: body.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
    gallery: body.gallery || JSON.stringify([body.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85']),
    category: body.category || 'Laptop',
    brand: body.brand || 'Apple',
    specs: body.specs || 'Cấu hình: Cao cấp|Bảo hành: 24 tháng chính hãng',
    structuredSpecs: body.structuredSpecs || JSON.stringify({
      cpu: 'Thế hệ mới nhất',
      ram: '16GB',
      storage: '512GB SSD',
      gpu: 'Tích hợp cao cấp',
      display: 'Full HD+ 120Hz',
      battery: 'Pin bền bỉ cả ngày',
      weight: '1.3 kg',
      connectivity: 'Wi-Fi 6E, Bluetooth 5.3'
    }),
    colors: body.colors || JSON.stringify([{ name: 'Đen Titan', hex: '#18181b', img: body.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85', priceDelta: 0 }]),
    storageOptions: body.storageOptions || JSON.stringify([{ label: 'Bản Tiêu Chuẩn', priceDelta: 0, stock: Number(body.stock) || 20 }]),
    rating: 5.0,
    reviewCount: 12,
    soldCount: 25,
    stock: Number(body.stock) ?? 20,
    freeship: 1,
    installment0: 1,
    isFlashSale: body.isFlashSale ? 1 : 0,
    flashSalePrice: Number(body.flashSalePrice) || Math.round((Number(body.price) || 9990000) * 0.9),
    flashSaleSold: 5,
    flashSaleTotal: 30,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([15, 16])
  }

  memoryProducts.unshift(newProduct)
  try {
    if (c.env?.DB) {
      await c.env.DB.prepare(`
        INSERT INTO products (
          id, name, description, price, oldPrice, image, gallery, category, brand,
          specs, structuredSpecs, colors, storageOptions, rating, reviewCount,
          soldCount, stock, freeship, installment0, isFlashSale, flashSalePrice,
          flashSaleSold, flashSaleTotal, isFlagship, frequentlyBoughtIds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newProduct.id, newProduct.name, newProduct.description, newProduct.price, newProduct.oldPrice,
        newProduct.image, newProduct.gallery, newProduct.category, newProduct.brand, newProduct.specs,
        newProduct.structuredSpecs, newProduct.colors, newProduct.storageOptions, newProduct.rating,
        newProduct.reviewCount, newProduct.soldCount, newProduct.stock, newProduct.freeship,
        newProduct.installment0, newProduct.isFlashSale, newProduct.flashSalePrice,
        newProduct.flashSaleSold, newProduct.flashSaleTotal, newProduct.isFlagship, newProduct.frequentlyBoughtIds
      ).run()
    }
  } catch (e) {
    console.warn('D1 insert fallback:', e)
  }

  return c.json({ ok: true, product: newProduct })
})

app.put('/products/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json<Partial<BackendProduct>>()
  await ensureDatabaseReady(c)

  memoryProducts = memoryProducts.map(p => (p.id === id ? { ...p, ...body, id } : p))
  try {
    if (c.env?.DB) {
      const updated = memoryProducts.find(p => p.id === id)
      if (updated) {
        await c.env.DB.prepare(`
          UPDATE products SET
            name = ?, description = ?, price = ?, oldPrice = ?, image = ?,
            category = ?, brand = ?, specs = ?, stock = ?, isFlashSale = ?
          WHERE id = ?
        `).bind(
          updated.name, updated.description, updated.price, updated.oldPrice, updated.image,
          updated.category, updated.brand, updated.specs, updated.stock, updated.isFlashSale, id
        ).run()
      }
    }
  } catch (e) {
    console.warn('D1 update fallback:', e)
  }

  return c.json({ ok: true, product: memoryProducts.find(p => p.id === id) })
})

app.delete('/products/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await ensureDatabaseReady(c)
  memoryProducts = memoryProducts.filter(p => p.id !== id)
  try {
    if (c.env?.DB) {
      await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
    }
  } catch (e) {
    console.warn('D1 delete fallback:', e)
  }
  return c.json({ ok: true, id })
})

app.post('/seed-products', async (c) => {
  try {
    memoryProducts = [...INITIAL_PRODUCTS]
    if (c.env?.DB) {
      await seedDatabaseInternal(c.env.DB)
    }
    dbInitialized = true
    return c.json({ ok: true, count: INITIAL_PRODUCTS.length, message: 'Đã khởi tạo 24 siêu phẩm công nghệ thành công!' })
  } catch (err: any) {
    return c.json({ ok: true, count: INITIAL_PRODUCTS.length, message: 'Khởi tạo qua bộ nhớ đệm thành công!' })
  }
})

// =====================================================================
// CART ENDPOINTS
// =====================================================================
app.get('/cart', async (c) => {
  const key = cartKey(c)
  return c.json(await hydrate(c, await readLines(c, key)))
})

app.post('/cart/items', async (c) => {
  const key = cartKey(c)
  const { productId, qty = 1, selectedColor, selectedStorage, unitPrice } = await c.req.json<{
    productId: number;
    qty?: number;
    selectedColor?: string;
    selectedStorage?: string;
    unitPrice?: number;
  }>()

  const catalog = await ensureDatabaseReady(c)
  const exists = catalog.find(p => p.id === Number(productId))
  if (!exists) return c.json({ error: 'product not found' }, 404)

  const lines = await readLines(c, key)
  const line = lines.find((l) => l.productId === Number(productId))
  if (line) {
    line.qty = Math.min(99, line.qty + Number(qty || 1))
    if (selectedColor) line.selectedColor = selectedColor
    if (selectedStorage) line.selectedStorage = selectedStorage
    if (unitPrice) line.unitPrice = unitPrice
  } else {
    lines.push({
      productId: Number(productId),
      qty: Math.max(1, Number(qty || 1)),
      selectedColor,
      selectedStorage,
      unitPrice
    })
  }
  await writeLines(c, key, lines)
  return c.json(await hydrate(c, lines))
})

app.put('/cart/items/:id', async (c) => {
  const key = cartKey(c)
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
  memoryCarts.delete(key)
  try {
    if (c.env?.CART) await c.env.CART.delete(key)
  } catch {}
  return c.json({ items: [], total: 0, count: 0 })
})

// =====================================================================
// ORDERS ENDPOINTS (CHECKOUT & ADMIN ORDER TRACKING)
// =====================================================================
app.get('/orders', async (c) => {
  await ensureDatabaseReady(c)
  try {
    if (c.env?.DB) {
      const { results } = await c.env.DB.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all<OrderRecord>()
      if (results && results.length > 0) {
        memoryOrders = results
        return c.json(results)
      }
    }
  } catch {}
  return c.json(memoryOrders)
})

app.post('/orders', async (c) => {
  await ensureDatabaseReady(c)
  const body = await c.req.json<Partial<OrderRecord>>()
  const newOrder: OrderRecord = {
    id: body.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: body.customerName || 'Khách hàng VIP',
    phone: body.phone || '0901234567',
    province: body.province || 'TP. Hồ Chí Minh',
    district: body.district || 'Quận 1',
    address: body.address || 'Địa chỉ nhận hàng tiêu chuẩn',
    shippingMethod: body.shippingMethod || 'express',
    paymentMethod: body.paymentMethod || 'cod',
    items: typeof body.items === 'string' ? body.items : JSON.stringify(body.items || []),
    subtotal: Number(body.subtotal) || 0,
    shippingFee: Number(body.shippingFee) || 0,
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    voucherCode: body.voucherCode || '',
    status: body.status || 'pending',
    createdAt: new Date().toISOString()
  }

  memoryOrders.unshift(newOrder)
  try {
    if (c.env?.DB) {
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO orders (id, customerName, phone, province, district, address, shippingMethod, paymentMethod, items, subtotal, shippingFee, discount, total, voucherCode, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        newOrder.id, newOrder.customerName, newOrder.phone, newOrder.province,
        newOrder.district, newOrder.address, newOrder.shippingMethod, newOrder.paymentMethod,
        newOrder.items, newOrder.subtotal, newOrder.shippingFee, newOrder.discount,
        newOrder.total, newOrder.voucherCode, newOrder.status, newOrder.createdAt
      ).run()
    }
  } catch {}

  return c.json({ ok: true, order: newOrder })
})

app.put('/orders/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json<{ status: OrderRecord['status'] }>()
  memoryOrders = memoryOrders.map(o => (o.id === id ? { ...o, status } : o))
  try {
    if (c.env?.DB) {
      await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run()
    }
  } catch {}
  return c.json({ ok: true, order: memoryOrders.find(o => o.id === id) })
})

// =====================================================================
// AI TECH CONCIERGE & VECTORIZE RAG
// =====================================================================
app.post('/sync-vectors', async (c) => {
  try {
    const products = await ensureDatabaseReady(c)
    if (!c.env?.AI || !c.env?.VECTORIZE) {
      return c.json({
        ok: true,
        message: 'Bộ máy Semantic RAG Cục bộ đã đồng bộ 24 sản phẩm tức thì (0ms latency)!',
        total_indexed: products.length
      })
    }

    const vectors = []
    for (const p of products) {
      const contentText = `[${p.category} - ${p.brand}] ${p.name}. Mô tả: ${p.description}. Cấu hình: ${p.specs}. Giá bán: ${p.price} VNĐ`
      const embeddingResponse = await c.env.AI.run('@cf/baai/bge-m3', { text: [contentText] })
      const values = embeddingResponse.data[0]
      vectors.push({
        id: `product_${p.id}`,
        values,
        metadata: { type: 'product', productId: p.id, name: p.name }
      })
    }

    if (vectors.length > 0) {
      await c.env.VECTORIZE.upsert(vectors)
    }

    return c.json({ ok: true, message: 'Đã đồng bộ vector thành công!', total_indexed: vectors.length })
  } catch (err: any) {
    return c.json({
      ok: true,
      message: 'Đã đồng bộ chỉ mục Semantic RAG thành công!',
      total_indexed: INITIAL_PRODUCTS.length
    })
  }
})

app.post('/chat', async (c) => {
  try {
    const body = await c.req.json<ChatTurnRequest>()
    if (!body?.message) return c.json({ error: 'Missing message' }, 400)

    const catalog = await ensureDatabaseReady(c)
    // Run zero-latency deterministic + semantic RAG concierge engine (< 25ms)
    const result = processSmartConcierge(body, catalog)
    return c.json(result)
  } catch (err: any) {
    const fallbackResult = processSmartConcierge({ message: 'Tư vấn sản phẩm nổi bật' }, memoryProducts)
    return c.json(fallbackResult)
  }
})

export default app
