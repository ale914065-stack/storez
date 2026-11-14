/**
 * Setup Script: Initialize Cloudflare Worker for visitor stream pipeline
 * 
 * This script creates/updates the Worker configuration and binds
 * the necessary environment variables and R2 bucket references.
 * 
 * Usage: npm run setup -- --account-id=YOUR_ACCOUNT_ID --bucket-name=visitors
 */

const fs = require('fs');
const path = require('path');

// Read existing wrangler.toml if it exists
const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');

let wranglerConfig = {
  name: 'visitor-ingest-worker',
  accountId: '',
  workersDev: true,
  workersApiVersion: '2024-05-24',
  name: 'visitor-ingest-worker',
  compatibilityDate: '2024-09-30',
  env: {
    VISITORS: {
      bind: '@visitors',
      type: 'R2',
    },
  },
  // Add account binding
  accountId: '',
};

// Default environment config (to be overridden by CLI args or .env)
const defaultConfig = {
  ACCOUNT_ID: 'de1d7518f067890180f66ad877cb6b2c',  // From streaminfo.txt
  BUCKET: 'visitors',
  NAMESPACE: 'default',
  TABLE: 'visitors',
  R2_ACCOUNT_ID: 'de1d7518f067890180f66ad877cb6b2c',
  R2_BUCKET: 'visitors',
  R2_ACCESS_KEY_ID: '',       // Should be set via .env or secrets
  R2_SECRET_ACCESS_KEY: '',   // Should be set via .env or secrets
};

// Check if .env exists, if not create template
const envPath = path.join(__dirname, '..', '.env');
const envTemplate = `# Cloudflare Worker Environment Config
# Copy to .env and fill in actual values
ACCOUNT_ID=${defaultConfig.ACCOUNT_ID}
BUCKET=${defaultConfig.BUCKET}
NAMESPACE=${defaultConfig.NAMESPACE}
TABLE=${defaultConfig.TABLE}
R2_ACCOUNT_ID=${defaultConfig.R2_ACCOUNT_ID}
R2_BUCKET=${defaultConfig.R2_BUCKET}
# Generate these from Cloudflare Dashboard > R2 > Settings
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✓ Created .env template at:', envPath);
  console.log('  Please edit .env with your actual R2 credentials');
}

// Check wrangler.toml
if (!fs.existsSync(wranglerPath)) {
  const tomlContent = [
    '[project]',
    `  name = "visitor-ingest-worker"`,
    `  account_id = "${defaultConfig.ACCOUNT_ID}"`,
    '',
    '[deployment]',
    '  preview = true',
    '  target = "remote"',
    '',
    '[worker]',
    '  compatibility_date = "2024-09-30"',
    '',
    '[env.production]',
    `  ACCOUNT_ID = "${defaultConfig.ACCOUNT_ID}"`,
    `  BUCKET = "${defaultConfig.BUCKET}"`,
    `  NAMESPACE = "${defaultConfig.NAMESPACE}"`,
    `  TABLE = "${defaultConfig.TABLE}"`,
    '',
    '[env.production] bindings',
    `  VISITORS = "r2:${defaultConfig.R2_BUCKET}"`,
    '',
    '[env.development]',
    `  ACCOUNT_ID = "${defaultConfig.ACCOUNT_ID}"`,
    `  BUCKET = "${defaultConfig.BUCKET}"`,
    `  NAMESPACE = "${defaultConfig.NAMESPACE}"`,
    `  TABLE = "${defaultConfig.TABLE}"`,
    '',
    '[env.development] bindings',
    `  VISITORS = "r2:${defaultConfig.R2_BUCKET}"`,
  ].join('\n');

  fs.writeFileSync(wranglerPath, tomlContent);
  console.log('✓ Created wrangler.toml at:', wranglerPath);
} else {
  console.log('⚠ wrangler.toml already exists, skipping creation');
}

// Summary
console.log('\n=== Setup Complete ===');
console.log('1. Worker code: worker/index.js');
console.log('2. Environment config: .env');
console.log('3. Wrangler config: wrangler.toml');
console.log('\n=== Next Steps ===');
console.log('1. Edit .env with your R2 credentials');
console.log('2. Run: npm install cloudflare-workers');
console.log('3. Run: npx wrangler publish');
console.log('4. Test with: curl -X POST https://your-worker-url/ -H "Content-Type: application/json" -d \'{"name":"test"}\'');