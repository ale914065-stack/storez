/**
 * Cloudflare Worker: Visitor Stream Ingest → R2 Pipeline
 * 
 * Handles:
 * 1. Receive POST requests from Cloudflare Stream ingest endpoint
 * 2. Validate data against schema
 * 3. Write validated data to R2 bucket
 * 
 * Architecture:
 * Client → Cloudflare Stream → This Worker → R2 Bucket
 */

export default {
  async fetch(request, env, ctx) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse incoming JSON data
      const data = await request.json();

      // === 1. SCHEMA VALIDATION ===
      const validationErrors = validateVisitorData(data);
      if (validationErrors) {
        return new Response(
          JSON.stringify({ error: 'Validation failed', details: validationErrors }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // === 2. GENERATE R2 KEY ===
      // Create a unique key: timestamp_id or timestamp_random
      const id = data.id || `unknown_${Date.now()}`;
      const timestamp = Date.now();
      const r2Key = `visitors/${timestamp}_${id}.json`;

      // === 3. WRITE TO R2 ===
      const putResult = await env.VISITORS.put(
        r2Key,
        JSON.stringify(data, null, 2), // Pretty print with 2-space indent
        {
          httpMetadata: {
            contentType: 'application/json'
          }
        }
      );

      // === 4. SUCCESS RESPONSE ===
      return new Response(
        JSON.stringify({
          status: 'success',
          message: 'Data ingested and stored in R2',
          r2Key: r2Key,
          accountId: env.ACCOUNT_ID,
          bucket: env.BUCKET,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

    } catch (error) {
      // === ERROR HANDLING ===
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
};

/**
 * Validate visitor data against the schema defined in streaminfo.txt
 * Required fields: none (all optional according to schema)
 * Type checks for each field
 */
export function validateVisitorData(data) {
  const errors = [];

  // Check id - if present, must be string
  if (data.id !== undefined && typeof data.id !== 'string') {
    errors.push('id must be a string if provided');
  }

  // Check country - if present, must be string
  if (data.country !== undefined && typeof data.country !== 'string') {
    errors.push('country must be a string if provided');
  }

  // Check device - if present, must be string
  if (data.device !== undefined && typeof data.device !== 'string') {
    errors.push('device must be a string if provided');
  }

  // Check time - if present, must be integer (timestamp in ms)
  if (data.time !== undefined) {
    if (typeof data.time !== 'number' || !Number.isInteger(data.time)) {
      errors.push('time must be an integer (timestamp in milliseconds)');
    } else if (data.time < 0) {
      errors.push('time must be a positive timestamp');
    }
  }

  // Check ip - if present, must be string
  if (data.ip !== undefined && typeof data.ip !== 'string') {
    errors.push('ip must be a string if provided');
  }

  // Check meta - if present, must be object
  if (data.meta !== undefined) {
    if (typeof data.meta !== 'object' || Array.isArray(data.meta)) {
      errors.push('meta must be a JSON object');
    } else {
      // Optional: validate meta has expected structure
      if (data.meta.key === undefined && data.meta.value === undefined) {
        // meta is empty object, that's OK per schema
      }
    }
  }

  return errors.length > 0 ? errors : null;
}