# Visitor Stream Ingest Pipeline

Cloudflare Worker + R2 pipeline cho dữ liệu stream "visitors".

## Architecture

```
Client → Cloudflare Stream Ingest → Cloudflare Worker → R2 Bucket (visitors)
```

## Setup

### 1. Install dependencies
```bash
npm install cloudflare-workers
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env với R2 credentials từ Cloudflare Dashboard
```

### 3. Deploy Worker
```bash
npx wrangler publish
```

## Data Schema

Schema được định nghĩa trong `streaminfo.txt`:

| Field    | Type      | Required | Description |
|----------|-----------|----------|-------------|
| id       | string    | no       | Sự kiện ID |
| country  | string    | no       | Mã quốc gia |
| device   | string    | no       | Loại device |
| time     | timestamp | no       | Unix timestamp (ms) |
| ip       | string    | no       | IP address |
| meta     | json      | no       | Metadata bổ sung |

## API

### POST /

Gửi dữ liệu stream để ingest và lưu vào R2.

**Example Request:**
```bash
curl -X POST https://f8fb6f6f730b404fb2f273fd789d04df.ingest.cloudflare.com \
  -H "Content-Type: application/json" \
  -d '{
    "id": "visitor_001",
    "country": "VN",
    "device": "ios",
    "time": 1700000000000,
    "ip": "123.45.67.89",
    "meta": {
      "key": "demo",
      "value": "100"
    }
  }'
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Data ingested and stored in R2",
  "r2Key": "visitors/1700000000000_visitor_001.json",
  "accountId": "...",
  "bucket": "visitors"
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": ["id must be a string if provided"]
}
```

## Validation Rules

- Tất cả fields đều optional (không bắt buộc)
- Nếu có `time`: phải là integer (milliseconds), giá trị dương
- Nếu có `meta`: phải là JSON object
- Các field string phải là type `string`

## R2 Storage

Dữ liệu được lưu với format key:
```
visitors/{timestamp}_{id}.json
```

Mỗi record được lưu với pretty-print JSON.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| ACCOUNT_ID | yes | Cloudflare Account ID |
| BUCKET | yes | R2 bucket name |
| NAMESPACE | yes | Default namespace |
| TABLE | yes | Table name for queries |
| R2_ACCOUNT_ID | yes | R2 Account ID |
| R2_BUCKET | yes | R2 Bucket name |
| R2_ACCESS_KEY_ID | yes | R2 API Access Key |
| R2_SECRET_ACCESS_KEY | yes | R2 API Secret Key |

## Testing

```bash
# Test with sample data
curl -X POST https://your-worker-url.workers.dev \
  -H "Content-Type: application/json" \
  -d @example-payload.json
```

## Security Notes

- Không commit `.env` file (credentials plain text)
- Sử dụng Cloudflare Secrets để quản lý credentials production
- Thay đổi access keys định kỳ