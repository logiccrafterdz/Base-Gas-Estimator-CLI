/**
 * Price Fetching Module
 * Handles ETH/USD price fetching from CoinGecko API for USDC equivalent calculations
 * 
 * Note: USDC value assumes 1 USDC = 1 USD, consistent with Base ecosystem standards
 * 
 * @author Base Gas Estimator Team
 * @license MIT
 */

import axios from 'axios';

/**
 * CoinGecko API endpoint for ETH price in USD
 * Free tier with no API key required
 * Used as proxy for ETH/USDC rate (1 USD ≈ 1 USDC)
 */
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

/**
 * Request timeout in milliseconds
 */
const REQUEST_TIMEOUT = 5000;

/**
 * Fetch current ETH price in USD from CoinGecko API
 * Returns USD price which serves as USDC equivalent for Base ecosystem calculations
 * 
 * @returns {Promise<number>} Current ETH price in USD (equivalent to USDC)
 * 
 * @example
 * const ethUsdcEquivalent = await getEthUsdPrice();
 * console.log(`Current ETH price: ${ethUsdcEquivalent} USDC`); // Current ETH price: 3450.25 USDC
 * 
 * @throws {Error} When API request fails or returns invalid data
 */
export async function getEthUsdPrice() {
  try {
    const response = await axios.get(COINGECKO_API_URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'base-gas-estimator/0.1.0'
      }
    });

    // Validate response structure
    if (!response.data || !response.data.ethereum || !response.data.ethereum.usd) {
      throw new Error('Invalid response format from price API');
    }

    const usdcEquivalent = response.data.ethereum.usd;

    // Validate price is a positive number
    if (typeof usdcEquivalent !== 'number' || usdcEquivalent <= 0 || !isFinite(usdcEquivalent)) {
      throw new Error('Invalid ETH price received from API');
    }

    return usdcEquivalent;

  } catch (error) {
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Price API request timed out. Please try again.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to price API. Please check your internet connection.');
    } else if (error.response) {
      // API returned an error response
      const status = error.response.status;
      if (status === 429) {
        throw new Error('Price API rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('Price API server error. Please try again later.');
      } else {
        throw new Error(`Price API error (${status}). Please try again later.`);
      }
    } else if (error.message.includes('Invalid')) {
      // Re-throw validation errors as-is
      throw error;
    } else {
      // Generic network or parsing error
      throw new Error('Failed to fetch ETH price. Please try again later.');
    }
  }
}