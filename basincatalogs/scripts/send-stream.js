/**
 * Script gửi dữ liệu stream ingest cho Nhóm 09
 * Endpoint: https://f8fb6f6f730b404fb2f273fd789d04df.ingest.cloudflare.com
 */

const https = require('https');

const payload = {
  id: "nhóm 09",
  country: "VN",
  device: "ios",
  ip: "123.3456.57.234",
  time: 1791853920,
  meta: {
    key: "demo",
    value: "100"
  }
};

const payloadString = JSON.stringify(payload);

console.log('--- ĐANG GỬI DỮ LIỆU STREAM CHO NHÓM 09 ---');
console.log('Payload:', payloadString);

const req = https.request('https://f8fb6f6f730b404fb2f273fd789d04df.ingest.cloudflare.com', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString)
  }
}, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('\n--- KẾT QUẢ PHẢN HỒI TỪ CLOUDFLARE ---');
    console.log('Mã HTTP Status:', res.statusCode);
    console.log('Nội dung trả về:', responseData);
    if (res.statusCode === 200) {
      console.log('\n🎉 THÀNH CÔNG! Dữ liệu của Nhóm 09 đã được ingest vào Cloudflare thành công!');
    } else {
      console.log('\n❌ Gặp lỗi khi gửi dữ liệu.');
    }
  });
});

req.on('error', (err) => {
  console.error('Lỗi kết nối:', err.message);
});

req.write(payloadString);
req.end();
