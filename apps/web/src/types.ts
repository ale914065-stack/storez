export interface ProductColor {
  name: string;
  hex: string;
  img: string;
  priceDelta?: number;
}

export interface ProductStorageOption {
  label: string;
  priceDelta: number;
  stock: number;
}

export interface StructuredSpecs {
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  display?: string;
  battery?: string;
  weight?: string;
  connectivity?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string; // JSON array string
  category?: string;
  brand?: string;
  specs?: string;
  structuredSpecs?: string; // JSON object string
  colors?: string; // JSON array string of ProductColor
  storageOptions?: string; // JSON array string of ProductStorageOption
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  stock?: number;
  freeship?: number;
  installment0?: number;
  isFlashSale?: number;
  flashSalePrice?: number;
  flashSaleSold?: number;
  flashSaleTotal?: number;
  isFlagship?: number;
  frequentlyBoughtIds?: string; // JSON array string of product IDs
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export interface ReviewItem {
  id: string;
  productId: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  variant: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  verified: boolean;
}

export interface Voucher {
  code: string;
  title: string;
  description: string;
  type: 'percent' | 'fixed' | 'freeship';
  value: number; // percent (e.g. 10) or VND amount (e.g. 500000)
  maxDiscount?: number;
  minOrder: number;
  tag: string;
  expiry: string;
}

export interface OrderItemSummary {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image: string;
  variant?: string;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  province: string;
  district: string;
  address: string;
  shippingMethod: 'express' | 'standard';
  paymentMethod: 'cod' | 'vietqr' | 'card' | 'installment';
  items: string; // JSON string of OrderItemSummary[]
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  voucherCode?: string;
  status: 'pending' | 'packing' | 'shipping' | 'delivered';
  createdAt: string;
}

export interface ComparisonRow {
  label: string;
  valA: string;
  valB: string;
  winner: 'A' | 'B' | 'tie';
}

export interface ChatComparisonData {
  productA: Product;
  productB: Product;
  rows: ComparisonRow[];
  verdict: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  products?: Product[];
  product?: Product | null;
  comparison?: ChatComparisonData | null;
  actionAddProduct?: Product | null;
  isStreaming?: boolean;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  brands: string[];
  minRating: number;
  onlyInStock: boolean;
  onlyFreeship: boolean;
  onlyInstallment0: boolean;
  onlyFlashSale: boolean;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
}
