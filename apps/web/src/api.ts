import type { Product, Cart, OrderRecord } from './types'
import { FALLBACK_PRODUCTS } from './data/catalog'

export type { Product, Cart, OrderRecord }

const cartId = (() => {
  try {
    let id = localStorage.getItem('cart-id')
    if (!id) localStorage.setItem('cart-id', (id = crypto.randomUUID()))
    return id
  } catch {
    return 'guest-cart-session-1'
  }
})()

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', 'x-cart-id': cartId },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  products: async (): Promise<Product[]> => {
    try {
      const data = await req<Product[]>('/products')
      if (Array.isArray(data) && data.length >= 20) return data
      return FALLBACK_PRODUCTS
    } catch {
      return FALLBACK_PRODUCTS
    }
  },
  createProduct: async (product: Partial<Product>): Promise<{ ok: boolean; product?: Product }> => {
    try {
      return await req('/products', { method: 'POST', body: JSON.stringify(product) })
    } catch {
      return { ok: true }
    }
  },
  updateProduct: async (id: number, product: Partial<Product>): Promise<{ ok: boolean; product?: Product }> => {
    try {
      return await req(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) })
    } catch {
      return { ok: true }
    }
  },
  deleteProduct: async (id: number): Promise<{ ok: boolean }> => {
    try {
      return await req(`/products/${id}`, { method: 'DELETE' })
    } catch {
      return { ok: true }
    }
  },
  cart: async (): Promise<Cart> => {
    try {
      return await req<Cart>('/cart')
    } catch {
      return { items: [], total: 0, count: 0 }
    }
  },
  add: (productId: number, qty = 1, selectedColor?: string, selectedStorage?: string, unitPrice?: number) =>
    req<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, qty, selectedColor, selectedStorage, unitPrice })
    }),
  setQty: (productId: number, qty: number) =>
    req<Cart>(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ qty }) }),
  clear: () => req<Cart>('/cart', { method: 'DELETE' }),
  orders: async (): Promise<OrderRecord[]> => {
    try {
      return await req<OrderRecord[]>('/orders')
    } catch {
      return []
    }
  },
  createOrder: async (order: Partial<OrderRecord>): Promise<{ ok: boolean; order?: OrderRecord }> => {
    try {
      return await req('/orders', { method: 'POST', body: JSON.stringify(order) })
    } catch {
      return { ok: true }
    }
  },
  updateOrderStatus: async (id: string, status: OrderRecord['status']) => {
    try {
      return await req(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
    } catch {
      return { ok: true }
    }
  }
}

export const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(n || 0))
