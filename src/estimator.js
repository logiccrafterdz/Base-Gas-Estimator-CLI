/**
 * Gas Estimation Module
 * Handles ETH transfer gas estimation on Base network using ethers.js
 * 
 * @author Base Gas Estimator Team
 * @license MIT
 */

import { ethers } from 'ethers';
import { formatGweiFromWei, formatEthFromWei } from './utils.js';

/**
 * Estimate gas cost for ETH transfer on Base network
 * 
 * @param {Object} params - Estimation parameters
 * @param {string} params.to - Recipient address
 * @param {string} params.valueEth - Amount in ETH to transfer
 * @param {string} params.rpcUrl - RPC URL for the network
 * @returns {Promise<Object>} Gas estimation results
 * 
 * @example
 * const result = await estimateEthTransfer({
 *   to: '0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e',
 *   valueEth: '0.1',
 *   rpcUrl: 'https://mainnet.base.org'
 * });
 */
export async function estimateEthTransfer({ to, valueEth, rpcUrl }) {
  try {
    // Validate recipient address first
    if (!to || typeof to !== 'string') {
      throw new Error('Invalid recipient address');
    }
    
    // Basic address format validation
    if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid recipient address');
    }

    // Validate and parse ETH value
    let weiValue;
    try {
      weiValue = ethers.parseEther(valueEth.toString());
    } catch (error) {
      throw new Error('Invalid ETH value');
    }

    // Validate that the value is not negative
    if (weiValue < 0n) {
      throw new Error('ETH value cannot be negative');
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create a dummy wallet for estimation (private key doesn't matter for estimation)
    const dummyWallet = new ethers.Wallet(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      provider
    );

    // Prepare transaction object for gas estimation
    const transaction = {
      to: to,
      value: weiValue,
      // Standard ETH transfer doesn't need data
      data: '0x'
    };

    // Get current fee data (EIP-1559 compatible)
    const feeData = await provider.getFeeData();
    
    // Estimate gas limit
    const gasLimit = await provider.estimateGas(transaction);

    // Use maxFeePerGas for calculation (EIP-1559)
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice;
    
    if (!gasPrice) {
      throw new Error('Unable to fetch gas price from network');
    }

    // Calculate total cost in wei
    const totalWei = gasLimit * gasPrice;

    // Format results for display
    const gasUnits = Number(gasLimit);
    const gasPriceWei = gasPrice;
    const gasText = `${formatGweiFromWei(gasPrice)} Gwei (${gasPrice.toString()} wei)`;
    const totalText = formatEthFromWei(totalWei);

    return {
      gasUnits,
      gasPriceWei,
      totalWei,
      gasText,
      totalText
    };

  } catch (error) {
    // Handle specific error cases
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for gas estimation');
    } else if (error.message.includes('invalid address')) {
      throw new Error('Invalid recipient address');
    } else if (error.message.includes('network')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Unable to connect to Base network. Please try again later.');
    } else {
      // Re-throw with original message for other errors
      throw error;
    }
  }
}