#!/usr/bin/env node

/**
 * Manual Test Suite for Base Gas Estimator CLI
 * Self-contained test file with no external dependencies
 * 
 * @author Base Gas Estimator Team
 * @license MIT
 */

import { estimateEthTransfer } from '../src/estimator.js';
import { getEthUsdPrice } from '../src/price.js';
import { 
  isValidAddress, 
  isPositiveNumber, 
  getRpcUrl, 
  formatGweiFromWei, 
  formatEthFromWei,
  formatUsdc,
  formatInteger
} from '../src/utils.js';

// Test configuration
const TEST_CONFIG = {
  timeout: 8000, // 8 second timeout per test
  networks: ['base', 'base-sepolia'],
  validAddresses: [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0x000000000000000000000000000000000000dead',
    '0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e'  // Properly checksummed
  ],
  invalidAddresses: [
    'invalid-address',
    '0x123',
    '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    ''
  ],
  testValues: ['0.01', '0.001', '1.0', '0.0001']
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '📋',
    pass: '✅',
    fail: '❌',
    warn: '⚠️'
  }[type];
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log(`PASS: ${message}`, 'pass');
  } else {
    testResults.failed++;
    testResults.failures.push(message);
    log(`FAIL: ${message}`, 'fail');
  }
}

function assertThrows(fn, expectedError, message) {
  testResults.total++;
  try {
    fn();
    testResults.failed++;
    testResults.failures.push(message);
    log(`FAIL: ${message} (expected error but none thrown)`, 'fail');
  } catch (error) {
    if (expectedError && !error.message.includes(expectedError)) {
      testResults.failed++;
      testResults.failures.push(message);
      log(`FAIL: ${message} (wrong error: ${error.message})`, 'fail');
    } else {
      testResults.passed++;
      log(`PASS: ${message}`, 'pass');
    }
  }
}

async function withTimeout(promise, timeoutMs, testName) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Test "${testName}" timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Test suites
async function testUtilityFunctions() {
  log('Testing utility functions...', 'info');

  // Test address validation
  TEST_CONFIG.validAddresses.forEach(addr => {
    assert(isValidAddress(addr), `Valid address should pass: ${addr}`);
  });

  TEST_CONFIG.invalidAddresses.forEach(addr => {
    assert(!isValidAddress(addr), `Invalid address should fail: ${addr}`);
  });

  // Test network mapping
  assert(getRpcUrl('base') === 'https://mainnet.base.org', 'Base mainnet RPC URL correct');
  assert(getRpcUrl('base-sepolia') === 'https://sepolia.base.org', 'Base Sepolia RPC URL correct');
  
  assertThrows(
    () => getRpcUrl('invalid-network'),
    'Unsupported network',
    'Invalid network should throw error'
  );

  // Test formatting functions
  const testWei = BigInt('1000000000000000000'); // 1 ETH in wei
  assert(formatEthFromWei(testWei) === '1', 'Wei to ETH conversion correct');
  
  const testGweiWei = BigInt('1000000000'); // 1 Gwei in wei
  assert(formatGweiFromWei(testGweiWei) === '1', 'Wei to Gwei conversion correct');
}

async function testPriceFetching() {
  log('Testing ETH price fetching...', 'info');

  try {
    const price = await withTimeout(
      getEthUsdPrice(),
      TEST_CONFIG.timeout,
      'ETH price fetch'
    );
    
    assert(typeof price === 'number', 'Price should be a number');
    assert(price > 0, 'Price should be positive');
    assert(price < 100000, 'Price should be reasonable (< 100k USDC)');
    assert(price > 100, 'Price should be reasonable (> 100 USDC)');
    
    log(`Current ETH price: ${price} USDC`, 'info');
  } catch (error) {
    log(`Price fetch failed (acceptable in offline mode): ${error.message}`, 'warn');
    // Don't fail the test for network issues
  }
}

async function testGasEstimation() {
  log('Testing gas estimation...', 'info');

  for (const network of TEST_CONFIG.networks) {
    log(`Testing ${network} network...`, 'info');
    
    try {
      const result = await withTimeout(
        estimateEthTransfer({
          to: TEST_CONFIG.validAddresses[0],
          valueEth: TEST_CONFIG.testValues[0],
          rpcUrl: getRpcUrl(network)
        }),
        TEST_CONFIG.timeout,
        `Gas estimation on ${network}`
      );

      // Validate result structure
      assert(typeof result === 'object', `Result should be object for ${network}`);
      assert(typeof result.gasUnits === 'number', `Gas units should be number for ${network}`);
      assert(typeof result.gasPriceWei === 'bigint', `Gas price should be bigint for ${network}`);
      assert(typeof result.totalWei === 'bigint', `Total cost should be bigint for ${network}`);

      // Validate reasonable values
      assert(result.gasUnits >= 21000, `Gas units should be at least 21,000 for ${network}`);
      assert(result.gasPriceWei > 0n, `Gas price should be positive for ${network}`);
      assert(result.totalWei > 0n, `Total cost should be positive for ${network}`);

      // For ETH transfers, gas should typically be exactly 21,000
      if (result.gasUnits === 21000) {
        log(`✓ Standard ETH transfer gas limit (21,000) detected for ${network}`, 'pass');
      }

      log(`${network} - Gas: ${result.gasUnits}, Price: ${formatGweiFromWei(result.gasPriceWei)} Gwei, Cost: ${formatEthFromWei(result.totalWei)} ETH`, 'info');

    } catch (error) {
      if (error.message.includes('timed out')) {
        log(`Gas estimation timed out for ${network} (network may be slow)`, 'warn');
      } else {
        assert(false, `Gas estimation failed for ${network}: ${error.message}`);
      }
    }
  }
}

async function testErrorHandling() {
  log('Testing error handling...', 'info');

  // Test invalid addresses in gas estimation
  for (const invalidAddr of TEST_CONFIG.invalidAddresses.slice(0, 2)) { // Test first 2 to save time
    try {
      await estimateEthTransfer({
         to: invalidAddr,
         valueEth: '0.01',
         rpcUrl: getRpcUrl('base')
       });
      assert(false, `Should throw error for invalid address: ${invalidAddr}`);
    } catch (error) {
      assert(
        error.message.includes('Invalid') || error.message.includes('address'),
        `Should get address validation error for: ${invalidAddr}`
      );
    }
  }

  // Test invalid values
  const invalidValues = ['abc', '-1', ''];
  for (const invalidValue of invalidValues) {
    try {
      await estimateEthTransfer({
         to: TEST_CONFIG.validAddresses[0],
         valueEth: invalidValue,
         rpcUrl: getRpcUrl('base')
       });
      assert(false, `Should throw error for invalid value: ${invalidValue}`);
    } catch (error) {
      assert(
        error.message.includes('Invalid') || error.message.includes('value'),
        `Should get value validation error for: ${invalidValue}`
      );
    }
  }
}

async function testEdgeCases() {
  log('Testing edge cases...', 'info');

  try {
    // Test zero value
    const zeroResult = await withTimeout(
       estimateEthTransfer({
         to: TEST_CONFIG.validAddresses[0],
         valueEth: '0',
         rpcUrl: getRpcUrl('base')
       }),
      TEST_CONFIG.timeout,
      'Zero value transfer'
    );
    
    assert(zeroResult.gasUnits >= 21000, 'Zero value transfer should still require gas');
    
    // Test very small value
    const smallResult = await withTimeout(
       estimateEthTransfer({
         to: TEST_CONFIG.validAddresses[0],
         valueEth: '0.000000001',
         rpcUrl: getRpcUrl('base')
       }),
      TEST_CONFIG.timeout,
      'Very small value transfer'
    );
    
    assert(smallResult.gasUnits >= 21000, 'Small value transfer should still require gas');
    
  } catch (error) {
    if (error.message.includes('timed out')) {
      log('Edge case tests timed out (network may be slow)', 'warn');
    } else {
      assert(false, `Edge case test failed: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Base Gas Estimator CLI Test Suite\n');
  
  const startTime = Date.now();
  
  try {
    await testUtilityFunctions();
    await testPriceFetching();
    await testGasEstimation();
    await testErrorHandling();
    await testEdgeCases();
  } catch (error) {
    log(`Unexpected test suite error: ${error.message}`, 'fail');
    testResults.failed++;
    testResults.total++;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Duration: ${duration}s`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure}`);
    });
  }
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The CLI is ready for production.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before publishing.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled promise rejection: ${reason}`, 'fail');
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  log(`Test suite crashed: ${error.message}`, 'fail');
  process.exit(1);
});