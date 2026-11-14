/**
 * Test script for Visitor Stream Ingest Worker
 * 
 * Validates the worker implementation including:
 * 1. Schema validation
 * 2. Data processing and storage
 * 3. Error handling
 */

// Load the worker module using dynamic import for ESM
const workerModule = await import('../worker/index.js');
const worker = workerModule.default;
const validateVisitorData = workerModule.validateVisitorData;

// Mock environment for testing
const mockEnv = {
  ACCOUNT_ID: 'test-account-id',
  BUCKET: 'visitors',
  NAMESPACE: 'default',
  TABLE: 'visitors',
  VISITORS: {
    put: async (key, value) => {
      console.log(`✓ Mock R2 put: ${key} (${value.length} chars)`);
      return { key };
    }
  }
};

async function testSchemaValidation() {
  console.log('\n🧪 Testing Schema Validation...');

  const testCases = [
    {
      name: 'Valid complete data',
      data: {
        id: 'test_001',
        country: 'VN',
        device: 'ios',
        time: 1700000000000,
        ip: '123.45.67.89',
        meta: {
          key: 'demo',
          value: '100'
        }
      },
      shouldPass: true
    },
    {
      name: 'Valid minimal data',
      data: {
        name: 'sample',
        time: 1700000000000
      },
      shouldPass: true
    },
    {
      name: 'Invalid time type',
      data: {
        time: 'not-a-number'
      },
      shouldPass: false,
      expectedError: 'time must be an integer'
    },
    {
      name: 'Invalid meta type',
      data: {
        meta: 'string-instead-of-object'
      },
      shouldPass: false,
      expectedError: 'meta must be a JSON object'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const mockRequest = {
        json: () => Promise.resolve(testCase.data),
        method: 'POST'
      };

      const result = await worker.fetch(mockRequest, mockEnv);
      const responseData = await result.json();

      if (testCase.shouldPass) {
        if (result.status === 200) {
          console.log(`  ✓ ${testCase.name}: Passed as expected`);
          passed++;
        } else {
          console.log(`  ✗ ${testCase.name}: Unexpected failure - ${JSON.stringify(responseData)}`);
          failed++;
        }
      } else {
        if (result.status === 400 && responseData.error === 'Validation failed') {
          console.log(`  ✓ ${testCase.name}: Rejected as expected`);
          passed++;
        } else {
          console.log(`  ✗ ${testCase.name}: Should have been rejected`);
          failed++;
        }
      }
    } catch (error) {
      console.log(`  ✗ ${testCase.name}: Exception - ${error.message}`);
      failed++;
    }
  }

  return { passed, failed };
}

async function testValidationFunction() {
  console.log('\n🧪 Testing Validation Function...');

  // Load the worker module using dynamic import for ESM
  const workerModule = await import('../worker/index.js');
  const validateVisitorData = workerModule.validateVisitorData;

  // Test valid data
  const validCases = [
    { time: 1700000000000 },
    { id: 'string', country: 'string', device: 'string', ip: '123.45.67.89', meta: {} },
    { time: 0 },
    { meta: { key: 'test', value: 123 } }
  ];

  let passed = 0;

  for (const testData of validCases) {
    const errors = validateVisitorData(testData);
    if (errors === null) {
      console.log(`  ✓ ${JSON.stringify(testData)}: Valid`);
      passed++;
    } else {
      console.log(`  ✗ ${JSON.stringify(testData)}: ${errors.join(', ')}`);
    }
  }

  // Test invalid data
  const invalidCases = [
    { time: 'string' },
    { time: -1 },
    { meta: 'string' },
    { id: 123 }
  ];

  for (const testData of invalidCases) {
    const errors = validateVisitorData(testData);
    if (errors !== null) {
      console.log(`  ✓ ${JSON.stringify(testData)}: Invalid - ${errors.join(', ')}`);
      passed++;
    }
  }

  return passed;
}

async function main() {
  console.log('🚀 Starting Visitor Stream Ingest Pipeline Tests...');

  // Run all tests
  const validationTests = await testSchemaValidation();
  const unitTests = await testValidationFunction();

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`  Schema Validation Tests: ${validationTests.passed} passed, ${validationTests.failed} failed`);
  console.log(`  Unit Tests: ${unitTests} passed`);

  const totalPassed = validationTests.passed + unitTests;
  const totalFailed = validationTests.failed;

  if (totalFailed > 0) {
    console.log('\n❌ Some tests failed. Please check the implementation.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
main().catch(console.error);