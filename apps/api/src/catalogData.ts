export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  image: string;
  gallery: string; // JSON array of image URLs
  category: string;
  brand: string;
  specs: string; // Pipe-separated summary specs
  structuredSpecs: string; // JSON object for detailed comparison
  colors: string; // JSON array of { name, hex, img, priceDelta }
  storageOptions: string; // JSON array of { label, priceDelta, stock }
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  freeship: number; // 1 or 0
  installment0: number; // 1 or 0
  isFlashSale: number; // 1 or 0
  flashSalePrice: number;
  flashSaleSold: number;
  flashSaleTotal: number;
  isFlagship: number; // 1 or 0
  frequentlyBoughtIds: string; // JSON array of product IDs
}

export const INITIAL_PRODUCTS: BackendProduct[] = [
  // ==================== 1. LAPTOP (6 SẢN PHẨM) ====================
  {
    id: 1,
    name: "MacBook Pro 14 inch M3 Max 36GB/1TB",
    category: "Laptop",
    brand: "Apple",
    price: 64990000,
    oldPrice: 72990000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=85",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=85"
    ]),
    description: "Siêu phẩm Workstation di động đỉnh cao từ Apple với vi xử lý M3 Max 14 nhân CPU, 30 nhân GPU hỗ trợ Ray Tracing phần cứng. Màn hình Liquid Retina XDR 120Hz ProMotion chuẩn màu tuyệt đối cho kỹ sư AI, dựng phim 8K và đồ họa 3D.",
    specs: "Chip: Apple M3 Max (14-core CPU, 30-core GPU)|RAM: 36GB Unified|SSD: 1TB NVMe|Màn hình: 14.2\" Liquid Retina XDR 120Hz",
    structuredSpecs: JSON.stringify({
      cpu: "Apple M3 Max 14 nhân (4.05 GHz)",
      ram: "36GB Unified Memory (400GB/s)",
      storage: "1TB SSD PCIe Gen 4",
      gpu: "Apple M3 Max 30-Core GPU (Ray Tracing)",
      display: "14.2 inch Liquid Retina XDR (3024x1964) 120Hz, 1600 nits",
      battery: "22 giờ (72.4 Wh), MagSafe 3 96W",
      weight: "1.62 kg",
      connectivity: "Wi-Fi 6E, Bluetooth 5.3, 3x Thunderbolt 4, HDMI 2.1, SDXC"
    }),
    colors: JSON.stringify([
      { name: "Đen Không Gian (Space Black)", hex: "#1e1f22", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85", priceDelta: 0 },
      { name: "Bạc Classic (Silver)", hex: "#e2e4e6", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=85", priceDelta: -500000 }
    ]),
    storageOptions: JSON.stringify([
      { label: "36GB / 1TB SSD", priceDelta: 0, stock: 8 },
      { label: "48GB / 1TB SSD", priceDelta: 7500000, stock: 4 },
      { label: "64GB / 2TB SSD", priceDelta: 16000000, stock: 2 }
    ]),
    rating: 5.0,
    reviewCount: 142,
    soldCount: 389,
    stock: 14,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 61990000,
    flashSaleSold: 44,
    flashSaleTotal: 50,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([14, 15])
  },
  {
    id: 2,
    name: "ASUS ROG Strix SCAR 16 RTX 4080 Mini-LED",
    category: "Laptop",
    brand: "ASUS",
    price: 52990000,
    oldPrice: 59990000,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=85",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=85"
    ]),
    description: "Quái vật Laptop Gaming eSports đầu bảng với Intel Core i9-14900HX 24 nhân và card đồ họa NVIDIA GeForce RTX 4080 175W TGP. Tản nhiệt 3 quạt Tri-Fan kèm keo kim loại lỏng Conductonaut Extreme, màn hình ROG Nebula HDR Mini-LED 240Hz.",
    specs: "CPU: Intel Core i9-14900HX|VGA: RTX 4080 12GB (175W)|RAM: 32GB DDR5|Màn hình: 16\" 2.5K Mini-LED 240Hz",
    structuredSpecs: JSON.stringify({
      cpu: "Intel Core i9-14900HX (24 nhân 32 luồng, 5.8 GHz)",
      ram: "32GB DDR5 5600MHz (Nâng cấp tối đa 64GB)",
      storage: "1TB SSD PCIe 4.0 NVMe M.2 Performance",
      gpu: "NVIDIA GeForce RTX 4080 12GB GDDR6 (MUX Switch + Advanced Optimus)",
      display: "16 inch 2.5K (2560x1600) Nebula HDR Mini-LED 240Hz, 1100 nits",
      battery: "90Wh, Sạc nhanh 330W & Type-C 100W",
      weight: "2.50 kg",
      connectivity: "Wi-Fi 6E, LAN 2.5G, Thunderbolt 4, HDMI 2.1 FRL"
    }),
    colors: JSON.stringify([
      { name: "Đen Translucent RGB", hex: "#141619", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "32GB RAM / 1TB SSD", priceDelta: 0, stock: 9 },
      { label: "64GB RAM / 2TB SSD RAID 0", priceDelta: 6500000, stock: 5 }
    ]),
    rating: 4.9,
    reviewCount: 98,
    soldCount: 275,
    stock: 14,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 49990000,
    flashSaleSold: 38,
    flashSaleTotal: 42,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([21, 10])
  },
  {
    id: 3,
    name: "MacBook Air M3 13.6 inch 16GB/512GB",
    category: "Laptop",
    brand: "Apple",
    price: 27490000,
    oldPrice: 31990000,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=85",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85"
    ]),
    description: "Chiếc Ultrabook quốc dân dành cho sinh viên IT, lập trình viên và doanh nhân. Siêu mỏng 1.13cm, nặng chỉ 1.24kg, chạy hoàn toàn êm ái không quạt tản nhiệt với thời lượng pin 18 tiếng liên tục.",
    specs: "Chip: Apple M3 8-Core|RAM: 16GB Unified|SSD: 512GB|Màn hình: 13.6\" Liquid Retina 500 nits",
    structuredSpecs: JSON.stringify({
      cpu: "Apple M3 8 nhân (4 nhân hiệu năng + 4 nhân tiết kiệm điện)",
      ram: "16GB Unified Memory",
      storage: "512GB SSD NVMe",
      gpu: "Apple M3 10-Core GPU",
      display: "13.6 inch Liquid Retina (2560x1664) True Tone, 500 nits",
      battery: "18 giờ (52.6 Wh), MagSafe 3",
      weight: "1.24 kg",
      connectivity: "Wi-Fi 6E, Bluetooth 5.3, 2x Thunderbolt / USB 4"
    }),
    colors: JSON.stringify([
      { name: "Xanh Đêm (Midnight)", hex: "#1d242d", img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=85", priceDelta: 0 },
      { name: "Ánh Sao (Starlight)", hex: "#e5dcd3", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85", priceDelta: 0 },
      { name: "Xám Không Gian (Space Gray)", hex: "#54575a", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "8GB / 256GB SSD", priceDelta: -3500000, stock: 15 },
      { label: "16GB / 512GB SSD", priceDelta: 0, stock: 22 },
      { label: "24GB / 1TB SSD", priceDelta: 5500000, stock: 7 }
    ]),
    rating: 4.9,
    reviewCount: 312,
    soldCount: 940,
    stock: 44,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 26490000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([15, 16])
  },
  {
    id: 4,
    name: "Lenovo Legion Slim 5 Gaming Ryzen 7 RTX 4060",
    category: "Laptop",
    brand: "Lenovo",
    price: 28990000,
    oldPrice: 33990000,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=85"
    ]),
    description: "Laptop Gaming & Đồ họa toàn diện nhất tầm giá dưới 30 triệu cho sinh viên IT, Kỹ thuật và Gamer. Màn hình chuẩn màu 100% sRGB 165Hz, tản nhiệt ColdFront 5.0 mát lạnh, hiệu năng RTX 4060 140W.",
    specs: "CPU: AMD Ryzen 7 7840HS|VGA: RTX 4060 8GB (140W)|RAM: 16GB DDR5|Màn hình: 16\" WQXGA 165Hz",
    structuredSpecs: JSON.stringify({
      cpu: "AMD Ryzen 7 7840HS (8 nhân 16 luồng, 5.1 GHz)",
      ram: "16GB DDR5 5600MHz",
      storage: "512GB SSD PCIe 4.0 NVMe",
      gpu: "NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)",
      display: "16 inch 2.5K (2560x1600) IPS 165Hz, 100% sRGB, G-Sync",
      battery: "80Wh Super Rapid Charge",
      weight: "2.30 kg",
      connectivity: "Wi-Fi 6E, RJ45, USB-C PD 140W, HDMI 2.1"
    }),
    colors: JSON.stringify([
      { name: "Xám Storm Grey", hex: "#4a4e54", img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "16GB / 512GB SSD", priceDelta: 0, stock: 18 },
      { label: "32GB / 1TB SSD", priceDelta: 3200000, stock: 10 }
    ]),
    rating: 4.8,
    reviewCount: 186,
    soldCount: 620,
    stock: 28,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 26990000,
    flashSaleSold: 76,
    flashSaleTotal: 85,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([21, 14])
  },
  {
    id: 5,
    name: "Dell XPS 15 9530 OLED Touch Core i7",
    category: "Laptop",
    brand: "Dell",
    price: 41900000,
    oldPrice: 48900000,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=85",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85"
    ]),
    description: "Biểu tượng laptop doanh nhân cao cấp chế tác từ nhôm CNC nguyên khối và sợi Carbon hàng không. Màn hình 3.5K OLED cảm ứng tràn viền InfinityEdge 4 cạnh tuyệt mỹ.",
    specs: "CPU: Core i7-13700H|VGA: Intel Arc / RTX 4050|RAM: 16GB DDR5|Màn hình: 15.6\" 3.5K OLED Touch",
    structuredSpecs: JSON.stringify({
      cpu: "Intel Core i7-13700H (14 nhân 20 luồng, 5.0 GHz)",
      ram: "16GB DDR5 4800MHz",
      storage: "1TB SSD M.2 PCIe NVMe",
      gpu: "NVIDIA GeForce RTX 4050 6GB GDDR6",
      display: "15.6 inch 3.5K (3456x2160) OLED Touch InfinityEdge, 100% DCI-P3",
      battery: "86Wh, ExpressCharge",
      weight: "1.86 kg",
      connectivity: "2x Thunderbolt 4, USB-C 3.2, Khe thẻ SD full-size"
    }),
    colors: JSON.stringify([
      { name: "Bạc Platinum Silver", hex: "#c0c5ce", img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "16GB / 1TB SSD", priceDelta: 0, stock: 7 },
      { label: "32GB / 1TB SSD", priceDelta: 4500000, stock: 5 }
    ]),
    rating: 4.8,
    reviewCount: 74,
    soldCount: 195,
    stock: 12,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 39900000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([15, 16])
  },
  {
    id: 6,
    name: "ASUS Vivobook 15 OLED Ryzen 7 Sinh Viên IT",
    category: "Laptop",
    brand: "ASUS",
    price: 16490000,
    oldPrice: 19990000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85"
    ]),
    description: "Lựa chọn số 1 dưới 20 triệu cho Sinh viên IT, Kinh tế & Văn phòng. Sở hữu màn hình Lumina OLED 100% DCI-P3 bảo vệ mắt, RAM 16GB sẵn sàng chạy Docker, VS Code mượt mà.",
    specs: "CPU: AMD Ryzen 7 7730U|RAM: 16GB DDR4|SSD: 512GB NVMe|Màn hình: 15.6\" FHD Lumina OLED",
    structuredSpecs: JSON.stringify({
      cpu: "AMD Ryzen 7 7730U (8 nhân 16 luồng, 4.5 GHz)",
      ram: "16GB DDR4 3200MHz",
      storage: "512GB M.2 NVMe PCIe 3.0 SSD",
      gpu: "AMD Radeon Graphics",
      display: "15.6 inch FHD (1920x1080) OLED, 600 nits, 100% DCI-P3, 0.2ms",
      battery: "50Wh, Sạc nhanh 65W",
      weight: "1.70 kg",
      connectivity: "Wi-Fi 6E, USB-C Power Delivery, HDMI 1.4, Cảm biến vân tay"
    }),
    colors: JSON.stringify([
      { name: "Bạc Cool Silver", hex: "#d1d5db", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85", priceDelta: 0 },
      { name: "Đen Indie Black", hex: "#1f2937", img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "16GB / 512GB SSD", priceDelta: 0, stock: 35 },
      { label: "16GB / 1TB SSD", priceDelta: 1500000, stock: 14 }
    ]),
    rating: 4.9,
    reviewCount: 245,
    soldCount: 1120,
    stock: 49,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 14990000,
    flashSaleSold: 92,
    flashSaleTotal: 100,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([15, 22])
  },

  // ==================== 2. ĐIỆN THOẠI (4 SẢN PHẨM) ====================
  {
    id: 7,
    name: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    category: "Điện thoại",
    brand: "Apple",
    price: 29490000,
    oldPrice: 34990000,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=85"
    ]),
    description: "Khung viền Titanium cấp độ 5 chuẩn hàng không vũ trụ siêu bền nhẹ. Chip A17 Pro 3nm đầu tiên trên thế giới chiến game AAA Console, cụm camera 48MP Telephoto Zoom quang 5x sắc nét và nút Action Button đa năng.",
    specs: "Màn hình: 6.7\" Super Retina XDR 120Hz|Chip: Apple A17 Pro 3nm|Camera: 48MP Zoom quang 5x|Pin: 4422mAh USB-C",
    structuredSpecs: JSON.stringify({
      cpu: "Apple A17 Pro 6 nhân (Tiến trình 3nm)",
      ram: "8GB LPDDR5",
      storage: "256GB NVMe",
      gpu: "Apple GPU 6 nhân (Hardware Ray Tracing)",
      display: "6.7 inch LTPO Super Retina XDR OLED 120Hz, 2000 nits",
      battery: "4422 mAh (Xem video 29 giờ), MagSafe, USB-C 3.0",
      weight: "221 g",
      connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, Ultra Wideband 2"
    }),
    colors: JSON.stringify([
      { name: "Titan Tự Nhiên", hex: "#b8b3a8", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85", priceDelta: 0 },
      { name: "Titan Xanh", hex: "#2f3844", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85", priceDelta: -300000 },
      { name: "Titan Đen", hex: "#262729", img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=85", priceDelta: 0 },
      { name: "Titan Trắng", hex: "#f2f1ed", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "256GB", priceDelta: 0, stock: 30 },
      { label: "512GB", priceDelta: 5500000, stock: 15 },
      { label: "1TB", priceDelta: 11500000, stock: 6 }
    ]),
    rating: 5.0,
    reviewCount: 528,
    soldCount: 2450,
    stock: 51,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 27990000,
    flashSaleSold: 88,
    flashSaleTotal: 100,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([11, 16])
  },
  {
    id: 8,
    name: "Samsung Galaxy S24 Ultra 5G 12GB/256GB",
    category: "Điện thoại",
    brand: "Samsung",
    price: 27990000,
    oldPrice: 33990000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=85",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85"
    ]),
    description: "Kỷ nguyên Quyền năng Galaxy AI tiếng Việt: Khoanh vùng tìm kiếm, phiên dịch trực tiếp cuộc gọi, khung viền Titanium phẳng kết hợp kính Gorilla Armor chống chói 75% và bút S-Pen quyền năng.",
    specs: "Màn hình: 6.8\" Dynamic AMOLED 2X|Chip: Snapdragon 8 Gen 3 for Galaxy|RAM: 12GB|Camera: 200MP EyeZoom",
    structuredSpecs: JSON.stringify({
      cpu: "Snapdragon 8 Gen 3 for Galaxy (8 nhân, 3.39 GHz)",
      ram: "12GB LPDDR5X",
      storage: "256GB UFS 4.0",
      gpu: "Adreno 750 (1 GHz)",
      display: "6.8 inch QHD+ (3120x1440) Dynamic AMOLED 2X 120Hz, 2600 nits",
      battery: "5000 mAh, Sạc siêu nhanh 45W",
      weight: "232 g",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, S-Pen tích hợp, Samsung DeX"
    }),
    colors: JSON.stringify([
      { name: "Xám Titan", hex: "#8c877e", img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=85", priceDelta: 0 },
      { name: "Đen Titan", hex: "#212124", img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85", priceDelta: 0 },
      { name: "Tím Titan", hex: "#544e61", img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "12GB / 256GB", priceDelta: 0, stock: 24 },
      { label: "12GB / 512GB", priceDelta: 3500000, stock: 12 },
      { label: "12GB / 1TB", priceDelta: 8000000, stock: 5 }
    ]),
    rating: 4.9,
    reviewCount: 410,
    soldCount: 1830,
    stock: 41,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 25990000,
    flashSaleSold: 64,
    flashSaleTotal: 75,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([16, 10])
  },
  {
    id: 9,
    name: "Xiaomi 14 Ultra 5G Leica Summilux 16GB/512GB",
    category: "Điện thoại",
    brand: "Xiaomi",
    price: 24990000,
    oldPrice: 29990000,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85"
    ]),
    description: "Tuyệt tác nhiếp ảnh di động với cảm biến 1-inch Sony LYT-900 khẩu độ biến thiên vô cấp f/1.63 - f/4.0 hợp tác cùng Leica. Pin khủng 5000mAh sạc siêu tốc 90W đầy 100% trong 33 phút.",
    specs: "Camera: 4 ống kính Leica 50MP cảm biến 1-inch|Chip: Snapdragon 8 Gen 3|RAM: 16GB|Pin: 5000mAh Sạc 90W",
    structuredSpecs: JSON.stringify({
      cpu: "Qualcomm Snapdragon 8 Gen 3 (4nm)",
      ram: "16GB LPDDR5X",
      storage: "512GB UFS 4.0",
      gpu: "Adreno 750",
      display: "6.73 inch WQHD+ LTPO AMOLED 120Hz, 3000 nits, Dolby Vision",
      battery: "5000 mAh, Sạc có dây 90W + Sạc không dây 80W",
      weight: "219.8 g",
      connectivity: "5G, Wi-Fi 7, Bluetooth 5.4, Hồng ngoại, IP68"
    }),
    colors: JSON.stringify([
      { name: "Đen Da Thuộc Leica", hex: "#1c1c1e", img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85", priceDelta: 0 },
      { name: "Trắng Ceramic", hex: "#f4f4f6", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "16GB / 512GB", priceDelta: 0, stock: 19 }
    ]),
    rating: 4.9,
    reviewCount: 156,
    soldCount: 540,
    stock: 19,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 23990000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([16, 22])
  },
  {
    id: 10,
    name: "ASUS ROG Phone 8 Pro Gaming 16GB/512GB",
    category: "Điện thoại",
    brand: "ASUS",
    price: 23490000,
    oldPrice: 26990000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85"
    ]),
    description: "Gaming Phone mạnh nhất hành tinh với màn hình phụ AniMe Vision 341 bóng mini-LED mặt lưng, nút cò cảm ứng AirTrigger siêu nhạy, màn hình 165Hz và pin trâu 5500mAh.",
    specs: "Màn hình: 6.78\" AMOLED 165Hz|Chip: Snapdragon 8 Gen 3|RAM: 16GB|Pin: 5500mAh AirTrigger",
    structuredSpecs: JSON.stringify({
      cpu: "Snapdragon 8 Gen 3 (3.3 GHz) + Tản nhiệt GameCool 8",
      ram: "16GB LPDDR5X (8533 Mbps)",
      storage: "512GB UFS 4.0",
      gpu: "Adreno 750",
      display: "6.78 inch FHD+ Samsung Flexible AMOLED 165Hz, 2500 nits",
      battery: "5500 mAh, Sạc HyperCharge 65W (2 cổng sạc USB-C)",
      weight: "225 g",
      connectivity: "5G, Wi-Fi 7, Jack 3.5mm Hi-Res Dirac Virtuo, IP68"
    }),
    colors: JSON.stringify([
      { name: "Đen Phantom Black", hex: "#121316", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "16GB / 512GB", priceDelta: 0, stock: 12 },
      { label: "24GB / 1TB (Kèm quạt AeroActive)", priceDelta: 4500000, stock: 5 }
    ]),
    rating: 4.9,
    reviewCount: 112,
    soldCount: 380,
    stock: 17,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 22490000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([22, 23])
  },

  // ==================== 3. ÂM THANH (4 SẢN PHẨM) ====================
  {
    id: 11,
    name: "Tai nghe Apple AirPods Pro 2 USB-C MagSafe",
    category: "Âm thanh",
    brand: "Apple",
    price: 5790000,
    oldPrice: 6790000,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=85",
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=85"
    ]),
    description: "Trang bị chip Apple H2 khử tiếng ồn chủ động gấp 2 lần, chế độ Âm thanh thích ứng (Adaptive Audio) tự động nhận diện cuộc trò chuyện và hỗ trợ âm thanh Lossless độ trễ cực thấp.",
    specs: "Chip: Apple H2|Chống ồn: ANC chủ động x2 + Adaptive Audio|Pin: 30 giờ (kèm hộp sạc USB-C)|Kháng bụi nước: IP54",
    structuredSpecs: JSON.stringify({
      cpu: "Chip âm thanh Apple H2 + Chip định vị U1",
      ram: "Adaptive EQ & Spatial Audio theo dõi chuyển động đầu",
      storage: "Hộp sạc MagSafe USB-C tích hợp loa tìm kiếm",
      gpu: "Driver biên độ cao độc quyền của Apple",
      display: "Đèn LED báo sạc + Điều khiển vuốt cảm ứng lực trên thân tai",
      battery: "6 giờ nghe liên tục (ANC bật) / 30 giờ kèm hộp sạc",
      weight: "5.3g (mỗi tai) / 50.8g (hộp sạc)",
      connectivity: "Bluetooth 5.3, Sạc MagSafe / Apple Watch / USB-C, IP54"
    }),
    colors: JSON.stringify([
      { name: "Trắng Pure White", hex: "#f8fafc", img: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản USB-C 2024 Chính hãng VN/A", priceDelta: 0, stock: 60 }
    ]),
    rating: 5.0,
    reviewCount: 640,
    soldCount: 3890,
    stock: 60,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 5290000,
    flashSaleSold: 142,
    flashSaleTotal: 150,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([7, 16])
  },
  {
    id: 12,
    name: "Tai nghe Chống Ồn Sony WH-1000XM5 Hi-Res ANC",
    category: "Âm thanh",
    brand: "Sony",
    price: 7490000,
    oldPrice: 8990000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=85"
    ]),
    description: "Vua tai nghe chống ồn chụp tai (Over-ear) với 8 micro thu tiếng ồn điều khiển bởi 2 vi xử lý Sony V1 + QN1. Đệm tai da Soft Fit siêu êm cho Coder tập trung code suốt 30 giờ.",
    specs: "Chống ồn: 8 Micro + Dual Processor V1 & QN1|Codec: LDAC Hi-Res Audio|Pin: 30 giờ (Sạc 3 phút nghe 3 giờ)|Đàm thoại: AI Precise Voice",
    structuredSpecs: JSON.stringify({
      cpu: "Bộ xử lý chống ồn HD QN1 + Bộ xử lý tích hợp V1",
      ram: "Hỗ trợ kết nối Đa điểm (Multipoint 2 thiết bị cùng lúc)",
      storage: "Kèm hộp đựng gấp gọn cao cấp + Cáp AUX & USB-C",
      gpu: "Driver 30mm sợi Carbon độ nhạy cao (4Hz - 40.000Hz)",
      display: "Cảm ứng chạm vuốt bên củ tai phải + Speak-to-Chat",
      battery: "30 giờ (ANC bật) / 40 giờ (ANC tắt), Sạc nhanh USB-PD",
      weight: "250 g",
      connectivity: "Bluetooth 5.2 (SBC, AAC, LDAC), Jack 3.5mm"
    }),
    colors: JSON.stringify([
      { name: "Đen Midnight Black", hex: "#1c1d21", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85", priceDelta: 0 },
      { name: "Bạc Platinum Silver", hex: "#dcd8d0", img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Tiêu chuẩn Chính hãng Sony VN", priceDelta: 0, stock: 32 }
    ]),
    rating: 4.9,
    reviewCount: 289,
    soldCount: 1150,
    stock: 32,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 6790000,
    flashSaleSold: 53,
    flashSaleTotal: 60,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([14, 16])
  },
  {
    id: 13,
    name: "Loa Bluetooth Marshall Stanmore III 80W",
    category: "Âm thanh",
    brand: "Marshall",
    price: 8690000,
    oldPrice: 10990000,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=85",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=85"
    ]),
    description: "Kiệt tác loa decor bàn làm việc & phòng khách mang âm hưởng Rock 'n' Roll cổ điển. Công suất 80W uy lực, núm vặn đồng nguyên khối tinh chỉnh Bass/Treble trực tiếp cực phê.",
    specs: "Công suất: 80W Class D|Âm trường: Dynamic Loudness Stereo|Kết nối: Bluetooth 5.2, RCA, AUX 3.5mm|Thiết kế: Da Vegan & Đồng thau",
    structuredSpecs: JSON.stringify({
      cpu: "Amply Class D (1x 50W Woofer + 2x 15W Tweeter)",
      ram: "Công nghệ cân bằng âm Dynamic Loudness",
      storage: "Tùy chỉnh EQ qua App Marshall Bluetooth",
      gpu: "Dải tần đáp ứng 45Hz – 20.000Hz, Max SPL 97 dB",
      display: "Hệ thống đèn LED thước đo âm lượng màu đỏ cổ điển",
      battery: "Nguồn điện trực tiếp 100-240V (Dây nguồn bọc dù)",
      weight: "4.25 kg",
      connectivity: "Bluetooth 5.2 LE Audio, Cổng RCA, AUX 3.5mm"
    }),
    colors: JSON.stringify([
      { name: "Đen Classic Black", hex: "#18181b", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=85", priceDelta: 0 },
      { name: "Kem Vintage Cream", hex: "#f3ead8", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=85", priceDelta: 300000 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản Quốc Tế ASH Chính Hãng", priceDelta: 0, stock: 18 }
    ]),
    rating: 4.9,
    reviewCount: 164,
    soldCount: 490,
    stock: 18,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 8290000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([14, 19])
  },
  {
    id: 22,
    name: "Tai nghe Gaming In-Ear ATK Horizon IEM Hi-Fi",
    category: "Âm thanh",
    brand: "ATK",
    price: 990000,
    oldPrice: 1390000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=85",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85"
    ]),
    description: "Tai nghe IEM chuyên trị FPS (Valorant, CS2, PUBG) định vị tiếng bước chân chuẩn xác từng milimet. Housing hợp kim nhôm CNC nguyên khối, dây đồng mạ bạc tháo rời 2-pin.",
    specs: "Driver: 10mm Dual-Cavity Dynamic|Kết nối: Type-C DSP / 3.5mm|Micro: Khử ồn ENC|Dây: Đồng tinh khiết mạ bạc 2-Pin",
    structuredSpecs: JSON.stringify({
      cpu: "Chip giải mã DAC tích hợp (bản Type-C 32bit/384kHz)",
      ram: "Tuning chuẩn Harman Target & eSports Footstep",
      storage: "Tặng kèm hộp cứng + 6 bộ nút tai Silicone",
      gpu: "Màng loa 10mm LCP (Liquid Crystal Polymer)",
      display: "Vỏ nhôm hàng không CNC chống cộng hưởng",
      battery: "Không dùng pin (Độ trễ 0ms tuyệt đối)",
      weight: "24 g",
      connectivity: "Jack 3.5mm mạ vàng hoặc USB Type-C có Mic"
    }),
    colors: JSON.stringify([
      { name: "Xám Titan", hex: "#4b5563", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=85", priceDelta: 0 },
      { name: "Bạc Ánh Kim", hex: "#e2e8f0", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản Jack 3.5mm", priceDelta: 0, stock: 45 },
      { label: "Bản Type-C DAC Gaming", priceDelta: 100000, stock: 38 }
    ]),
    rating: 4.8,
    reviewCount: 215,
    soldCount: 1420,
    stock: 83,
    freeship: 1,
    installment0: 0,
    isFlashSale: 1,
    flashSalePrice: 790000,
    flashSaleSold: 118,
    flashSaleTotal: 130,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([21, 23])
  },

  // ==================== 4. GAMING GEAR & PHỤ KIỆN (5 SẢN PHẨM) ====================
  {
    id: 14,
    name: "Bàn Phím Cơ NuPhy Air75 V2 QMK/VIA Wireless",
    category: "Gaming Gear",
    brand: "NuPhy",
    price: 2890000,
    oldPrice: 3490000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=85",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=85"
    ]),
    description: "Bàn phím cơ Low-Profile đỉnh nhất cho Lập trình viên & Designer. Hỗ trợ keymap QMK/VIA trực tiếp, Polling Rate 1000Hz không dây, đặt vừa khít lên trên bàn phím MacBook mà không cấn.",
    specs: "Layout: 75% (84 phím) Low-profile|Kết nối: 3 Mode (2.4GHz 1000Hz / BT 5.1 / USB-C)|Firmware: QMK/VIA|Pin: 4000mAh (220 giờ)",
    structuredSpecs: JSON.stringify({
      cpu: "MCU ARM Cortex-M0 hỗ trợ QMK/VIA hoàn toàn",
      ram: "Polling Rate 1000Hz (2.4GHz & Wired), Hotswap 5-pin",
      storage: "Lưu 4 lớp Macro / Keymap trực tiếp vào bộ nhớ phím",
      gpu: "Keycap Double-shot PBT nSA Profile + LED RGB 40 chế độ",
      display: "2 thanh LED RGB viền nhôm hiển thị phần trăm Pin & CapsLock",
      battery: "4000 mAh (Dùng tới 220 giờ khi tắt LED)",
      weight: "598 g",
      connectivity: "2.4GHz Wireless, Bluetooth 5.1 (3 thiết bị), USB-C"
    }),
    colors: JSON.stringify([
      { name: "Đen Basalt Black", hex: "#1e2024", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=85", priceDelta: 0 },
      { name: "Trắng Ionic White", hex: "#f1f5f9", img: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=85", priceDelta: 0 },
      { name: "Xám Lunar Gray", hex: "#64748b", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Cowberry Switch (Linear Êm)", priceDelta: 0, stock: 25 },
      { label: "Wisteria Switch (Tactile Đầm)", priceDelta: 0, stock: 18 },
      { label: "Gateron Brown 2.0", priceDelta: -100000, stock: 12 }
    ]),
    rating: 5.0,
    reviewCount: 342,
    soldCount: 1680,
    stock: 55,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 2590000,
    flashSaleSold: 81,
    flashSaleTotal: 90,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([15, 21])
  },
  {
    id: 15,
    name: "Chuột Công Thái Học Logitech MX Master 3S",
    category: "Gaming Gear",
    brand: "Logitech",
    price: 2290000,
    oldPrice: 2790000,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=85"
    ]),
    description: "Huyền thoại chuột công thái học dành cho Coder, Editor và Dân tài chính. Con lăn điện từ MagSpeed cuộn 1000 dòng/giây, nút bấm Quiet Click giảm 90% tiếng ồn và mắt đọc 8000 DPI chạy trên mặt kính.",
    specs: "Cảm biến: Darkfield 8000 DPI (Chạy trên kính)|Con lăn: Từ tính MagSpeed vô cực|Click: Quiet Clicks siêu êm|Pin: 70 ngày",
    structuredSpecs: JSON.stringify({
      cpu: "Cảm biến quang học Darkfield 8000 DPI độ chính xác cao",
      ram: "Logi Options+ Flow (Copy-Paste xuyên suốt giữa Mac & Windows)",
      storage: "7 nút bấm lập trình riêng cho từng phần mềm (VSCode, Premiere)",
      gpu: "Con lăn chính MagSpeed thép gia công + Con lăn ngang ngón cái",
      display: "Thiết kế công thái học nâng đỡ lòng bàn tay chống mỏi cổ tay",
      battery: "500 mAh (70 ngày sử dụng, Sạc nhanh 1 phút dùng 3 giờ)",
      weight: "141 g",
      connectivity: "Bluetooth Low Energy + Đầu thu Logi Bolt USB (3 thiết bị)"
    }),
    colors: JSON.stringify([
      { name: "Đen Graphite", hex: "#27272a", img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=85", priceDelta: 0 },
      { name: "Trắng Pale Gray", hex: "#e4e4e7", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản Đa Nền Tảng (Kèm USB Bolt)", priceDelta: 0, stock: 42 },
      { label: "Bản For Mac", priceDelta: -50000, stock: 20 }
    ]),
    rating: 4.9,
    reviewCount: 495,
    soldCount: 2890,
    stock: 62,
    freeship: 1,
    installment0: 0,
    isFlashSale: 0,
    flashSalePrice: 2090000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([14, 16])
  },
  {
    id: 21,
    name: "Chuột Gaming Siêu Nhẹ ATK A9 Air Ultimate+ 8KHz",
    category: "Gaming Gear",
    brand: "ATK",
    price: 1590000,
    oldPrice: 2190000,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=85",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85"
    ]),
    description: "Chuột eSports không dây sở hữu mắt đọc đầu bảng PixArt PAW3950 Ultra 42.000 DPI, Polling Rate thực 8000Hz (độ trễ 0.125ms) và trọng lượng siêu nhẹ chỉ 54g như lông vũ.",
    specs: "Cảm biến: PAW3950 Ultra 42.000 DPI|Polling Rate: 8000Hz Wireless (Kèm Dongle 8K)|Trọng lượng: 54g|Switch: Quang học Omron",
    structuredSpecs: JSON.stringify({
      cpu: "MCU Nordic 52840 + Cảm biến PixArt PAW3950 Ultra",
      ram: "Tần số phản hồi 8000Hz không dây (Độ trễ 0.125ms)",
      storage: "Cấu hình trực tiếp trên Web Hub không cần cài phần mềm",
      gpu: "Switch Quang học Omron 70 triệu lần nhấn (Chống Double Click)",
      display: "Lớp phủ Ice-Feeling chống bám mồ hôi tay + Feet PTFE 100%",
      battery: "500 mAh (150 giờ ở 1000Hz)",
      weight: "54 g",
      connectivity: "3 Mode: 2.4GHz 8K Dongle / Bluetooth / Wired Paracord"
    }),
    colors: JSON.stringify([
      { name: "Đen Obsidian", hex: "#111111", img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=85", priceDelta: 0 },
      { name: "Cam Lava Orange", hex: "#f97316", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85", priceDelta: 50000 },
      { name: "Trắng Glacier", hex: "#f8fafc", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản Ultimate+ (Kèm Dongle 8KHz)", priceDelta: 0, stock: 38 },
      { label: "Bản Pro (1KHz/4KHz)", priceDelta: -300000, stock: 25 }
    ]),
    rating: 4.9,
    reviewCount: 276,
    soldCount: 1560,
    stock: 63,
    freeship: 1,
    installment0: 0,
    isFlashSale: 1,
    flashSalePrice: 1390000,
    flashSaleSold: 95,
    flashSaleTotal: 100,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([22, 23])
  },
  {
    id: 16,
    name: "Trạm Sạc Nhanh Anker Prime 100W GaN 3 Cổng",
    category: "Gaming Gear",
    brand: "Anker",
    price: 1490000,
    oldPrice: 1990000,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=85"
    ]),
    description: "Củ sạc GaNPrime thế hệ mới nhỏ gọn trong lòng bàn tay, cung cấp công suất 100W sạc nhanh đồng thời cả MacBook Pro, iPhone 15 Pro Max và AirPods với cảm biến kiểm soát nhiệt ActiveShield 2.0.",
    specs: "Công suất: 100W Max PD 3.0 PPS|Cổng sạc: 2x USB-C + 1x USB-A|Công nghệ: GaNPrime & ActiveShield 2.0|Thiết kế: Chân gập gọn",
    structuredSpecs: JSON.stringify({
      cpu: "Vi mạch PowerIQ 4.0 tự động phân bổ dòng điện thông minh",
      ram: "ActiveShield 2.0 đo nhiệt độ 3 triệu lần/ngày bảo vệ pin",
      storage: "Chân cắm gập 90 độ tiện lợi mang đi du lịch, cafe",
      gpu: "Sạc đơn cổng USB-C1/C2 đạt tối đa 100W",
      display: "Vỏ nhám kim loại sang trọng chống trầy xước",
      battery: "Sạc 50% MacBook Pro 14\" chỉ trong 28 phút",
      weight: "189 g",
      connectivity: "2x USB-C (PD 3.0 / PPS 45W Samsung) + 1x USB-A (22.5W)"
    }),
    colors: JSON.stringify([
      { name: "Xám Titan", hex: "#52525b", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản 100W (Chưa kèm cáp)", priceDelta: 0, stock: 50 },
      { label: "Combo 100W + Cáp Anker 240W bọc dù", priceDelta: 250000, stock: 35 }
    ]),
    rating: 4.9,
    reviewCount: 380,
    soldCount: 2100,
    stock: 85,
    freeship: 1,
    installment0: 0,
    isFlashSale: 0,
    flashSalePrice: 1290000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([3, 7])
  },
  {
    id: 17,
    name: "Tay Cầm Chơi Game Xbox Wireless Controller Carbon",
    category: "Gaming Gear",
    brand: "Microsoft",
    price: 1390000,
    oldPrice: 1790000,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=85"
    ]),
    description: "Tay cầm chuẩn mực số 1 thế giới cho PC Windows, Steam, FC Online, Elden Ring và Black Myth: Wukong. Cò rung Impulse Triggers chân thực từng nhịp ga và độ bám nhám chống trượt.",
    specs: "Kết nối: Bluetooth / USB-C / Xbox Wireless|Tương thích: PC Windows, Mac, iOS, Android, Xbox|Rung: 4 mô-tơ Impulse Triggers|Pin: 40 giờ",
    structuredSpecs: JSON.stringify({
      cpu: "Xbox Wireless & Bluetooth Low Energy",
      ram: "Tương thích Plug & Play 100% với Steam & Windows 11",
      storage: "Nút Share quay clip/chụp màn hình nhanh",
      gpu: "4 mô-tơ rung độc lập (2 ở thân + 2 ở cò LT/RT)",
      display: "D-Pad Hybrid 8 hướng vát chéo tối ưu combo đối kháng",
      battery: "Lên tới 40 giờ sử dụng liên tục",
      weight: "287 g",
      connectivity: "Bluetooth, Cổng USB-C, Jack tai nghe 3.5mm"
    }),
    colors: JSON.stringify([
      { name: "Đen Carbon Black", hex: "#171717", img: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=85", priceDelta: 0 },
      { name: "Trắng Robot White", hex: "#f4f4f5", img: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Tay cầm + Cáp USB-C", priceDelta: 0, stock: 40 },
      { label: "Kèm USB Receiver Chính Hãng", priceDelta: 400000, stock: 22 }
    ]),
    rating: 4.9,
    reviewCount: 230,
    soldCount: 1340,
    stock: 62,
    freeship: 1,
    installment0: 0,
    isFlashSale: 0,
    flashSalePrice: 1250000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([22, 23])
  },
  {
    id: 23,
    name: "Túi Thấm Hút Mồ Hôi Tay eSports Pygora Pro Grip",
    category: "Gaming Gear",
    brand: "Pygora",
    price: 69000,
    oldPrice: 120000,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=85"
    ]),
    description: "Vũ khí bí mật của các tuyển thủ Valorant & Liên Minh Huyền Thoại chuyên nghiệp. Giữ lòng bàn tay khô ráo tức thì trong những pha Clutch căng thẳng, hương bạc hà dịu nhẹ kháng khuẩn.",
    specs: "Chất liệu: Vải lanh tự nhiên & Khoáng hút ẩm|Công dụng: Khô tay tức thì khi cầm chuột/điện thoại|Trọng lượng: 55g|Tái sử dụng: 6 tháng",
    structuredSpecs: JSON.stringify({
      cpu: "Hạt khoáng Silica & Đất sét tự nhiên hoạt tính",
      ram: "Không để lại bụi phấn lên chuột hay bàn phím",
      storage: "Đi kèm túi Zip bảo quản kín khí",
      gpu: "Vải Linen kháng khuẩn dệt 2 lớp siêu bền",
      display: "Thiết kế vừa vặn nắm tay giúp khởi động khớp ngón tay",
      battery: "Sử dụng bền bỉ từ 4 - 6 tháng",
      weight: "55 g",
      connectivity: "Phù hợp cho PC Gamer, Mobile Gamer & Billiards"
    }),
    colors: JSON.stringify([
      { name: "Đen Stealth", hex: "#111827", img: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "1 Túi Tiêu Chuẩn", priceDelta: 0, stock: 120 },
      { label: "Combo 2 Túi Tiết Kiệm", priceDelta: 50000, stock: 80 }
    ]),
    rating: 4.8,
    reviewCount: 412,
    soldCount: 4200,
    stock: 200,
    freeship: 1,
    installment0: 0,
    isFlashSale: 0,
    flashSalePrice: 49000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([21, 22])
  },

  // ==================== 5. PC & LINH KIỆN (3 SẢN PHẨM) ====================
  {
    id: 19,
    name: "Màn Hình Gaming LG UltraGear 27\" 2K Nano IPS 180Hz",
    category: "PC & Linh kiện",
    brand: "LG",
    price: 6890000,
    oldPrice: 8490000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=85"
    ]),
    description: "Màn hình chuẩn mực cho cả Coder, Designer và Game thủ. Độ phân giải QHD 2K siêu nét, tấm nền Nano IPS 98% DCI-P3 rực rỡ, tần số quét 180Hz 1ms GtG kèm chân đế xoay dọc 90 độ đọc code cực sướng.",
    specs: "Kích thước: 27 inch QHD 2K (2560x1440)|Tấm nền: Nano IPS 98% DCI-P3|Tần số quét: 180Hz (1ms GtG)|Chân đế: Nâng hạ, Xoay dọc Pivot 90°",
    structuredSpecs: JSON.stringify({
      cpu: "NVIDIA G-SYNC Compatible & AMD FreeSync Premium",
      ram: "1.07 tỷ màu (10-bit), Độ phủ màu 98% DCI-P3",
      storage: "Chân đế công thái học: Nâng hạ 110mm, Nghiêng, Xoay dọc 90°",
      gpu: "Tần số quét 180Hz, Thời gian phản hồi 1ms (GtG)",
      display: "27 inch QHD (2560x1440) Nano IPS, DisplayHDR 400",
      battery: "Adapter nguồn rời mát mẻ (Tiêu thụ 45W)",
      weight: "6.2 kg (kèm chân đế)",
      connectivity: "1x DisplayPort 1.4, 2x HDMI 2.0, USB Hub 3.0, Audio Out"
    }),
    colors: JSON.stringify([
      { name: "Đen Đỏ UltraGear", hex: "#18181b", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản 27 inch 2K 180Hz Nano IPS", priceDelta: 0, stock: 26 },
      { label: "Bản 27 inch 2K 240Hz OLED", priceDelta: 11000000, stock: 6 }
    ]),
    rating: 4.9,
    reviewCount: 268,
    soldCount: 930,
    stock: 32,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 6190000,
    flashSaleSold: 47,
    flashSaleTotal: 55,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([14, 15])
  },
  {
    id: 24,
    name: "PC Gaming CyberCore Titanium i9-14900K / RTX 4090 24GB",
    category: "PC & Linh kiện",
    brand: "ASUS",
    price: 64500000,
    oldPrice: 74900000,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=85",
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=85"
    ]),
    description: "Cỗ máy PC Hi-End tối thượng dùng cho huấn luyện mô hình AI LLM cục bộ, Render 3D Unreal Engine 5 và Max Setting 4K Ray Tracing mọi tựa game AAA. Vỏ kính cong Panorama Vô Cực kèm tản nước AIO màn hình LCD.",
    specs: "CPU: Intel Core i9-14900K (6.0GHz)|VGA: ROG Strix RTX 4090 24GB|RAM: 64GB DDR5 RGB 6400MHz|SSD: 2TB Samsung 990 Pro Gen4",
    structuredSpecs: JSON.stringify({
      cpu: "Intel Core i9-14900K (24 nhân 32 luồng, Turbo 6.0 GHz)",
      ram: "64GB (2x32GB) Corsair Dominator Titanium DDR5 6400MHz",
      storage: "2TB SSD Samsung 990 PRO PCIe 4.0 NVMe (Đọc 7450 MB/s)",
      gpu: "ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB GDDR6X",
      display: "Tản nhiệt nước ROG Ryujin III 360 ARGB có màn hình LCD 3.5\"",
      battery: "Nguồn ROG Thor 1200W Platinum II (Chuẩn ATX 3.0 PCIe 5.0)",
      weight: "18.5 kg",
      connectivity: "Mainboard Z790 Wi-Fi 7, LAN 10Gb, Thunderbolt 4"
    }),
    colors: JSON.stringify([
      { name: "Đen Vô Cực ARGB", hex: "#0f172a", img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=85", priceDelta: 0 },
      { name: "Trắng Snow Edition", hex: "#f8fafc", img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=85", priceDelta: 1500000 }
    ]),
    storageOptions: JSON.stringify([
      { label: "64GB RAM / 2TB SSD", priceDelta: 0, stock: 5 },
      { label: "128GB RAM / 4TB SSD", priceDelta: 9500000, stock: 3 }
    ]),
    rating: 5.0,
    reviewCount: 64,
    soldCount: 118,
    stock: 8,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 61900000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 1,
    frequentlyBoughtIds: JSON.stringify([19, 14])
  },
  {
    id: 25,
    name: "Ổ Cứng SSD Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2",
    category: "PC & Linh kiện",
    brand: "Samsung",
    price: 4390000,
    oldPrice: 5490000,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=85"
    ]),
    description: "Ổ cứng SSD M.2 PCIe 4.0 nhanh nhất thế giới với tốc độ đọc chạm ngưỡng 7.450 MB/s. Nâng cấp hoàn hảo cho Laptop Gaming, PC Đồ họa và máy chơi game PS5.",
    specs: "Dung lượng: 2TB M.2 2280|Đọc/Ghi: 7.450 MB/s - 6.900 MB/s|Bộ nhớ đệm: 2GB LPDDR4 DRAM|Độ bền: 1200 TBW (Bảo hành 5 năm)",
    structuredSpecs: JSON.stringify({
      cpu: "Controller Samsung Pascal in-house 8nm",
      ram: "2GB LPDDR4 DRAM Cache tốc độ cao",
      storage: "2TB Samsung V-NAND 3-bit MLC",
      gpu: "Tốc độ Đọc tuần tự 7450 MB/s | Ghi tuần tự 6900 MB/s",
      display: "Nhãn tản nhiệt đồng mạ Niken kiểm soát nhiệt độ Dynamic Thermal Guard",
      battery: "Tiết kiệm điện năng hơn 50% mỗi Watt so với 980 PRO",
      weight: "9 g",
      connectivity: "M.2 (2280) PCIe Gen 4.0 x4, NVMe 2.0 (Tương thích PC/Laptop/PS5)"
    }),
    colors: JSON.stringify([
      { name: "Bản Tiêu Chuẩn", hex: "#18181b", img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "1TB (7450MB/s)", priceDelta: -1600000, stock: 40 },
      { label: "2TB (7450MB/s)", priceDelta: 0, stock: 30 },
      { label: "2TB Kèm Heatsink RGB", priceDelta: 450000, stock: 15 }
    ]),
    rating: 5.0,
    reviewCount: 310,
    soldCount: 1750,
    stock: 85,
    freeship: 1,
    installment0: 0,
    isFlashSale: 0,
    flashSalePrice: 3990000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([4, 21])
  },

  // ==================== 6. TABLET & SMART HOME (4 SẢN PHẨM) ====================
  {
    id: 801,
    name: "iPad Pro M4 11 inch Ultra Retina XDR OLED Wi-Fi",
    category: "Tablet & Smart Home",
    brand: "Apple",
    price: 26490000,
    oldPrice: 29990000,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=85"
    ]),
    description: "Thiết bị mỏng nhất lịch sử Apple (chỉ 5.3mm) mang trong mình siêu chip Apple M4 và màn hình Tandem OLED 2 lớp Ultra Retina XDR tuyệt đẹp. Tương thích Apple Pencil Pro bóp xoay trực quan.",
    specs: "Chip: Apple M4 (9-core CPU, 10-core GPU)|Màn hình: 11\" Tandem OLED 120Hz|Độ mỏng: 5.3mm siêu nhẹ|Lưu trữ: 256GB",
    structuredSpecs: JSON.stringify({
      cpu: "Apple M4 9 nhân (Tiến trình 3nm thế hệ 2)",
      ram: "8GB Unified Memory (120GB/s)",
      storage: "256GB NVMe",
      gpu: "Apple M4 10-Core GPU (Hardware Ray Tracing)",
      display: "11 inch Ultra Retina XDR (Tandem OLED 2 lớp) 120Hz, 1600 nits",
      battery: "10 giờ lướt web/vẽ liên tục (31.29 Wh)",
      weight: "444 g",
      connectivity: "Wi-Fi 6E, Thunderbolt / USB 4, Face ID ngang, Hỗ trợ Pencil Pro"
    }),
    colors: JSON.stringify([
      { name: "Đen Không Gian (Space Black)", hex: "#232528", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85", priceDelta: 0 },
      { name: "Bạc (Silver)", hex: "#e3e4e6", img: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "256GB Wi-Fi", priceDelta: 0, stock: 22 },
      { label: "512GB Wi-Fi", priceDelta: 5000000, stock: 10 },
      { label: "256GB Wi-Fi + 5G", priceDelta: 5500000, stock: 8 }
    ]),
    rating: 5.0,
    reviewCount: 194,
    soldCount: 680,
    stock: 40,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 24990000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([11, 16])
  },
  {
    id: 901,
    name: "Samsung Galaxy Tab S9 Ultra 14.6\" Kèm Bút S-Pen",
    category: "Tablet & Smart Home",
    brand: "Samsung",
    price: 23990000,
    oldPrice: 29990000,
    image: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=85",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85"
    ]),
    description: "Máy tính bảng màn hình khổng lồ 14.6 inch Dynamic AMOLED 2X như một chiếc laptop thực thụ với chế độ Samsung DeX. Kháng nước IP68 cả máy lẫn bút S-Pen tặng kèm trong hộp.",
    specs: "Màn hình: 14.6\" Dynamic AMOLED 2X 120Hz|Chip: Snapdragon 8 Gen 2 for Galaxy|RAM: 12GB / 256GB|Phụ kiện: Kèm bút S-Pen IP68",
    structuredSpecs: JSON.stringify({
      cpu: "Snapdragon 8 Gen 2 for Galaxy (3.36 GHz)",
      ram: "12GB LPDDR5X",
      storage: "256GB UFS 4.0 (Hỗ trợ thẻ nhớ MicroSD tới 1TB)",
      gpu: "Adreno 740",
      display: "14.6 inch (2960x1848) Dynamic AMOLED 2X 120Hz HDR10+",
      battery: "11200 mAh, Sạc nhanh 45W",
      weight: "732 g",
      connectivity: "5G/Wi-Fi 6E, 4 loa AKG Dolby Atmos, Kháng nước IP68"
    }),
    colors: JSON.stringify([
      { name: "Xám Graphite", hex: "#373a40", img: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=85", priceDelta: 0 },
      { name: "Kem Beige", hex: "#e8dfd1", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "12GB / 256GB Wi-Fi", priceDelta: 0, stock: 14 },
      { label: "12GB / 512GB 5G", priceDelta: 4000000, stock: 8 }
    ]),
    rating: 4.9,
    reviewCount: 128,
    soldCount: 410,
    stock: 22,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 22490000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([16, 15])
  },
  {
    id: 18,
    name: "Đồng Hồ Thông Minh Apple Watch Series 9 GPS 41mm",
    category: "Tablet & Smart Home",
    brand: "Apple",
    price: 9290000,
    oldPrice: 10990000,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=85",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=85"
    ]),
    description: "Trợ lý sức khỏe trên cổ tay với chip S9 SiP mạnh mẽ, thao tác chạm hai ngón tay (Double Tap) nhận cuộc gọi không cần chạm màn hình, đo điện tâm đồ ECG và SpO2 chuẩn y khoa.",
    specs: "Chip: Apple S9 SiP (Double Tap)|Màn hình: Always-On Retina 2000 nits|Sức khỏe: ECG, SpO2, Nhiệt độ, Giấc ngủ|Chống nước: 50m",
    structuredSpecs: JSON.stringify({
      cpu: "Apple S9 SiP 64-bit lõi kép + Neural Engine 4 lõi",
      ram: "Cử chỉ Chạm hai lần (Double Tap) thông minh",
      storage: "64GB bộ nhớ trong",
      gpu: "Cảm biến nhịp tim điện học ECG + Oxy trong máu SpO2",
      display: "LTPO OLED Always-On Retina độ sáng 2000 nits",
      battery: "18 giờ (36 giờ ở chế độ Nguồn điện thấp), Sạc nhanh",
      weight: "31.9 g",
      connectivity: "GPS, Wi-Fi, Bluetooth 5.3, Chip Ultra Wideband thế hệ 2"
    }),
    colors: JSON.stringify([
      { name: "Đen Midnight", hex: "#1b2028", img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=85", priceDelta: 0 },
      { name: "Hồng Pink", hex: "#f4c2c2", img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=85", priceDelta: 0 },
      { name: "Trắng Starlight", hex: "#e5ded4", img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "41mm GPS Viền Nhôm", priceDelta: 0, stock: 28 },
      { label: "45mm GPS Viền Nhôm", priceDelta: 800000, stock: 20 }
    ]),
    rating: 4.9,
    reviewCount: 275,
    soldCount: 1290,
    stock: 48,
    freeship: 1,
    installment0: 1,
    isFlashSale: 1,
    flashSalePrice: 8490000,
    flashSaleSold: 62,
    flashSaleTotal: 70,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([7, 11])
  },
  {
    id: 20,
    name: "Flycam DJI Mini 4 Pro RC 2 (Kèm Màn Hình Cảm Ứng)",
    category: "Tablet & Smart Home",
    brand: "DJI",
    price: 18990000,
    oldPrice: 22490000,
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=85",
    gallery: JSON.stringify([
      "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=85"
    ]),
    description: "Flycam mini dưới 249g đỉnh cao nhất với cảm biến tránh vật cản đa hướng 360 độ, quay dọc True Vertical 4K/60fps HDR cho TikTok/Reels và truyền sóng O4 xa tới 20km.",
    specs: "Camera: 1/1.3\" CMOS 48MP, 4K/100fps HDR|Cảm biến: Tránh vật cản đa hướng 360°|Truyền sóng: DJI O4 (20km)|Thời gian bay: 34 - 45 phút",
    structuredSpecs: JSON.stringify({
      cpu: "Hệ thống APAS 5.0 tránh vật cản 360 độ + ActiveTrack 360°",
      ram: "Truyền hình ảnh Full HD 1080p/60fps khoảng cách 20km (DJI O4)",
      storage: "Tay cầm DJI RC 2 tích hợp màn hình 5.5 inch 700 nits",
      gpu: "Cảm biến 1/1.3 inch CMOS khẩu độ f/1.7, 10-bit D-Log M",
      display: "Quay dọc True Vertical Shooting 4K/60fps HDR không cắt khung",
      battery: "34 phút (Pin tiêu chuẩn) / 45 phút (Pin Plus)",
      weight: "248 g",
      connectivity: "Wi-Fi QuickTransfer, GPS + Galileo + BeiDou"
    }),
    colors: JSON.stringify([
      { name: "Xám DJI", hex: "#9ca3af", img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=85", priceDelta: 0 }
    ]),
    storageOptions: JSON.stringify([
      { label: "Bản Đơn (Kèm Tay cầm RC-N2)", priceDelta: 0, stock: 12 },
      { label: "Bản Tay cầm màn hình DJI RC 2", priceDelta: 3500000, stock: 15 },
      { label: "Bản Fly More Combo Plus (3 Pin 45p)", priceDelta: 6900000, stock: 9 }
    ]),
    rating: 5.0,
    reviewCount: 134,
    soldCount: 460,
    stock: 36,
    freeship: 1,
    installment0: 1,
    isFlashSale: 0,
    flashSalePrice: 17990000,
    flashSaleSold: 0,
    flashSaleTotal: 0,
    isFlagship: 0,
    frequentlyBoughtIds: JSON.stringify([25, 16])
  }
];
