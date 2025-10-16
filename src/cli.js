#!/usr/bin/env node

/**
 * Base Gas Estimator CLI
 * A free, open-source command-line tool to estimate gas costs on Base network
 * 
 * @author Base Gas Estimator Team
 * @license MIT
 */

import { Command } from 'commander';
import { estimateEthTransfer } from './estimator.js';
import { getEthUsdPrice } from './price.js';
import { isValidAddress, isPositiveNumber, getRpcUrl } from './utils.js';

const program = new Command();

/**
 * Format and display gas estimation results
 * @param {Object} estimation - Gas estimation results
 * @param {number} ethPrice - Current ETH price in USD (used as USDC equivalent)
 */
function displayResults(estimation, ethPrice) {
  const { gasUnits, gasPriceWei, totalWei, gasText, totalText } = estimation;
  const totalUsdc = (parseFloat(totalText) * ethPrice).toFixed(6);
  
  console.log(`Gas Units: ${gasUnits.toLocaleString()}`);
  console.log(`Gas Price: ${gasText}`);
  console.log(`Total Cost: ${totalText} ETH (~${totalUsdc} USDC)`);
}

/**
 * Handle transfer command
 * @param {Object} options - Command options
 */
async function handleTransfer(options) {
  try {
    // Validate recipient address
    if (!isValidAddress(options.to)) {
      console.error('Error: Invalid recipient address');
      console.error('Please provide a valid Ethereum address (0x... format)');
      process.exit(1);
    }

    // Validate ETH value
    if (!isPositiveNumber(options.value)) {
      console.error('Error: Invalid ETH value');
      console.error('Please provide a positive number (e.g., 0.1, 1.5)');
      process.exit(1);
    }

    // Validate network
    const validNetworks = ['base', 'base-sepolia'];
    if (!validNetworks.includes(options.network)) {
      console.error(`Error: Invalid network "${options.network}"`);
      console.error(`Supported networks: ${validNetworks.join(', ')}`);
      process.exit(1);
    }

    // Get RPC URL for the network
    const rpcUrl = getRpcUrl(options.network);
    
    // Fetch ETH price and gas estimation in parallel
    const [ethPrice, estimation] = await Promise.all([
      getEthUsdPrice(),
      estimateEthTransfer({
        to: options.to,
        valueEth: options.value,
        rpcUrl: rpcUrl
      })
    ]);

    // Display results
    displayResults(estimation, ethPrice);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Configure CLI program
program
  .name('base-gas')
  .description('A free, open-source CLI to estimate gas costs on Base network')
  .version('0.1.0');

// Transfer command
program
  .command('transfer')
  .description('Estimate gas cost for ETH transfer')
  .requiredOption('--to <address>', 'Recipient Ethereum address')
  .requiredOption('--value <amount>', 'Amount of ETH to transfer')
  .option('--network <network>', 'Network to use (base, base-sepolia)', 'base')
  .action(handleTransfer);

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}