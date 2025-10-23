# Base Gas Estimator CLI

> A free, open-source command-line tool to estimate gas costs on Base network in ETH and USDC.

[![npm version](https://img.shields.io/npm/v/base-gas-estimator?color=green)](https://www.npmjs.com/package/base-gas-estimator)
[![License: MIT](https://img.shields.io/npm/l/base-gas-estimator)](https://github.com/logiccrafterdz/Base-Gas-Estimator-CLI/blob/main/LICENSE)

**Note**: Costs are displayed in USDC (USD Coin), the native stablecoin of Base. 1 USDC ≈ $1 USD.

## ✨ Features

- 🚀 **Zero-cost gas estimation** for Base mainnet and Sepolia testnet
- 💰 **Real-time ETH/USDC pricing** via CoinGecko API
- ⚡ **Lightning-fast estimates** using ethers.js and Base RPC
- 🔧 **Developer-friendly CLI** with clear error messages
- 📦 **No API keys required** - completely free to use
- 🌐 **Cross-platform support** (Windows, macOS, Linux)
- 🎯 **EIP-1559 compatible** with accurate fee calculations

## 🚀 Quick Start

Get instant gas estimates without installation:

```bash
npx base-gas-estimator transfer --to 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e --value 0.1
```

## 📥 Installation (Optional)

Install globally for faster access:

```bash
npm install -g base-gas-estimator
base-gas transfer --to 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e --value 0.1
```

## 🧪 Usage Examples

## Base Mainnet (Default)
```bash
# Estimate 0.1 ETH transfer
npx base-gas-estimator transfer --to 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e --value 0.1

# Estimate 1 ETH transfer
npx base-gas-estimator transfer --to 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e --value 1.0
```

## Base Sepolia Testnet
```bash
# Test on Sepolia
npx base-gas-estimator transfer --to 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e --value 0.01 --network base-sepolia
```

## Help & Options
```bash
# Show all available commands and options
npx base-gas-estimator --help
npx base-gas-estimator transfer --help
```

## 📊 Sample Output

```
Gas Units: 21,000
Gas Price: 0.001897 Gwei (1,897,000,000 wei)
Total Cost: 0.000039837 ETH (~0.000150 USDC)
```

## 🌐 Why Base?

Base is Coinbase's secure, low-cost, builder-friendly Ethereum L2 built on Optimism. With significantly lower gas fees than Ethereum mainnet, Base enables:

- **Affordable DeFi** transactions for everyday users
- **Scalable dApp development** with Ethereum compatibility  
- **Seamless onboarding** via Coinbase's infrastructure
- **Growing ecosystem** of innovative Web3 applications

This CLI helps developers and users estimate transaction costs before executing, enabling better financial planning and user experience optimization.

## 🛠️ Development

## Run Tests
```bash
npm test
```

## Local Development
```bash
git clone https://github.com/logiccrafterdz/Base-Gas-Estimator-CLI.git
cd Base-Gas-Estimator-CLI
npm install
node src/cli.js transfer --to 0x742D35cC6634c0532925a3b8D4c9Db96C4B5Da5e --value 0.1
```

## 🤝 Contributing

We welcome contributions! This project aims to be the most reliable and user-friendly Base gas estimation tool. Here's how you can help:

- 🐛 **Report bugs** via GitHub Issues
- 💡 **Suggest features** for better developer experience
- 🔧 **Submit pull requests** with improvements
- 📖 **Improve documentation** and examples
- ⭐ **Star the repo** to show support

## Development Guidelines
- Keep dependencies minimal (currently just 3)
- Maintain zero-cost operation (no API keys)
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for changes

## 📜 License

MIT License - feel free to use this tool in your projects, commercial or otherwise.

## 🌟 Join the Base Builders Spotlight

Your project can be featured in the community directory!

```bash
npx base-gas-estimator spotlight --register
```

## 🔗 Links

- **GitHub**: [Base-Gas-Estimator-CLI](https://github.com/logiccrafterdz/Base-Gas-Estimator-CLI)
- **npm**: [base-gas-estimator](https://www.npmjs.com/package/base-gas-estimator)
- **Base Network**: [base.org](https://base.org)
- **Base Docs**: [docs.base.org](https://docs.base.org)

---

**Built with ❤️ for the Base ecosystem**

## Notes

- ETH price is fetched from CoinGecko's free API (ETH/USD used as USDC equivalent).
- For standard ETH transfers between Externally Owned Accounts (EOAs), the gas limit is fixed at 21,000. If the RPC's eth_estimateGas call fails (e.g., due to missing from context), the tool safely defaults to this standard value.
- Gas price uses EIP-1559 fee data (`gasPrice` or `maxFeePerGas`) from the RPC.

## Project Structure

```
Base-Gas-Estimator-CLI/
├── src/
│   ├── cli.js          # CLI command parsing and execution
│   ├── estimator.js    # Gas estimation logic using ethers.js
│   ├── price.js        # Fetch ETH/USDC equivalent from CoinGecko
│   └── utils.js        # Helper functions (address validation, number formatting)
├── package.json        # Includes "type": "module" and "bin" field
├── README.md           # Usage and Base-focused context
└── .gitignore
```

## Error Handling

- Invalid address → clear message to fix input
- RPC failure → friendly retry message
- Price fetch failure → prints ETH-only costs; USDC becomes `(~N/A USDC)`