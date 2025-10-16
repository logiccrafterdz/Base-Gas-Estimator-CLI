/**
 * Utility Functions Module
 * Provides validation, formatting, and helper functions for Base Gas Estimator CLI
 * 
 * @author Base Gas Estimator Team
 * @license MIT
 */

import { ethers } from 'ethers';

/**
 * Network configuration mapping
 */
const NETWORK_CONFIG = {
  'base': {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453
  },
  'base-sepolia': {
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532
  }
};

/**
 * Validate if a string is a valid Ethereum address
 * 
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid Ethereum address
 * 
 * @example
 * isValidAddress('0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e'); // true
 * isValidAddress('invalid'); // false
 */
export function isValidAddress(address) {
  if (typeof address !== 'string') {
    return false;
  }
  
  try {
    // ethers.isAddress() checks format and checksum
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Validate if a string represents a positive number
 * 
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid positive number
 * 
 * @example
 * isPositiveNumber('0.1'); // true
 * isPositiveNumber('1.5'); // true
 * isPositiveNumber('-1'); // false
 * isPositiveNumber('abc'); // false
 */
export function isPositiveNumber(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }
  
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num > 0;
}

/**
 * Get RPC URL for a given network
 * 
 * @param {string} network - Network name ('base' or 'base-sepolia')
 * @returns {string} RPC URL for the network
 * @throws {Error} If network is not supported
 * 
 * @example
 * getRpcUrl('base'); // 'https://mainnet.base.org'
 * getRpcUrl('base-sepolia'); // 'https://sepolia.base.org'
 */
export function getRpcUrl(network) {
  const config = NETWORK_CONFIG[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}. Supported networks: ${Object.keys(NETWORK_CONFIG).join(', ')}`);
  }
  return config.rpcUrl;
}

/**
 * Get network configuration for a given network
 * 
 * @param {string} network - Network name
 * @returns {Object} Network configuration object
 * @throws {Error} If network is not supported
 */
export function getNetworkConfig(network) {
  const config = NETWORK_CONFIG[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
}

/**
 * Format Wei amount to Gwei with appropriate precision
 * 
 * @param {bigint|string} weiAmount - Amount in Wei
 * @returns {string} Formatted Gwei amount
 * 
 * @example
 * formatGweiFromWei('1000000000'); // '1'
 * formatGweiFromWei('1500000000'); // '1.5'
 */
export function formatGweiFromWei(weiAmount) {
  try {
    const gwei = ethers.formatUnits(weiAmount, 'gwei');
    const num = parseFloat(gwei);
    
    // Format with appropriate precision
    if (num >= 1000) {
      return num.toFixed(0);
    } else if (num >= 1) {
      return num.toFixed(3).replace(/\.?0+$/, '');
    } else {
      return num.toFixed(6).replace(/\.?0+$/, '');
    }
  } catch (error) {
    throw new Error('Invalid Wei amount for Gwei conversion');
  }
}

/**
 * Format Wei amount to ETH with appropriate precision
 * 
 * @param {bigint|string} weiAmount - Amount in Wei
 * @returns {string} Formatted ETH amount
 * 
 * @example
 * formatEthFromWei('1000000000000000000'); // '1'
 * formatEthFromWei('100000000000000000'); // '0.1'
 */
export function formatEthFromWei(weiAmount) {
  try {
    const eth = ethers.formatEther(weiAmount);
    const num = parseFloat(eth);
    
    // Format with appropriate precision
    if (num >= 1) {
      return num.toFixed(6).replace(/\.?0+$/, '');
    } else if (num >= 0.001) {
      return num.toFixed(6).replace(/\.?0+$/, '');
    } else {
      return num.toFixed(9).replace(/\.?0+$/, '');
    }
  } catch (error) {
    throw new Error('Invalid Wei amount for ETH conversion');
  }
}

/**
 * Format USDC amount with appropriate precision
 * 
 * @param {number} usdcAmount - Amount in USDC
 * @returns {string} Formatted USDC amount
 * 
 * @example
 * formatUsdc(123.456789); // '123.456789 USDC'
 * formatUsdc(0.000001); // '0.000001 USDC'
 */
export function formatUsdc(usdcAmount) {
  if (typeof usdcAmount !== 'number' || !isFinite(usdcAmount)) {
    return '0.000000 USDC';
  }
  
  return `${usdcAmount.toFixed(6)} USDC`;
}

// Legacy function name for backward compatibility
export const formatUsd = formatUsdc;

/**
 * Format integer with thousands separators
 * 
 * @param {number|bigint} num - Number to format
 * @returns {string} Formatted number with commas
 * 
 * @example
 * formatInteger(21000); // '21,000'
 * formatInteger(1234567); // '1,234,567'
 */
export function formatInteger(num) {
  return Number(num).toLocaleString();
}

/**
 * Trim trailing zeros and decimal point from decimal string
 * 
 * @param {string} decimalStr - Decimal string to trim
 * @returns {string} Trimmed decimal string
 * 
 * @example
 * trimDecimals('1.000'); // '1'
 * trimDecimals('1.500'); // '1.5'
 */
export function trimDecimals(decimalStr) {
  if (typeof decimalStr !== 'string') {
    return decimalStr;
  }
  
  return decimalStr.replace(/\.?0+$/, '');
}