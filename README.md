# Sovieth Presale Frontend

A modern React application for the Sovieth token presale with Web3 integration and red/black theme.

## 🚀 Features

✅ **Smart Contract Integration**
- Full integration with Sovieth Presale contract
- Real-time data fetching and updates
- Secure transaction handling

✅ **User Interface**
- Modern red/black theme matching Sovieth branding
- Responsive design for all devices
- Smooth animations and transitions

✅ **Presale Functionality**
- Token purchase with ETH
- Whitelist address checker
- Real-time progress tracking
- User contribution history

✅ **Admin Panel**
- ETH withdrawal before hardcap
- Whitelist management (add/remove addresses)
- Presale pause/unpause controls
- Admin-only access controls

✅ **Web3 Features**
- ConnectKit wallet integration
- Support for multiple wallets
- Transaction status tracking
- Error handling and user feedback

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite
- **Web3**: Wagmi, ConnectKit, Ethers.js
- **DeFi Integration**: PancakeSwap Router integration
- **State Management**: React Context API
- **Font**: Inter (Google Fonts)

## 📦 Installation

1. **Clone and navigate to the project**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── layers/           # Page sections (Hero, Buy, Features, etc.)
│   │   ├── layout/           # Header, Footer components
│   │   └── swap/             # Token swap components
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions and constants
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles and animations
├── public/                   # Static assets
├── dist/                     # Production build output
└── package.json              # Dependencies and scripts
```

## 🎨 Key Components

### Core Sections
- **Hero**: Landing section with animated title and feature highlights
- **Buy**: Interactive presale interface with swap functionality
- **Features**: Core advantages and benefits showcase
- **Tokenomics**: Token distribution and economics
- **Roadmap**: Development phases and milestones
- **FAQ**: Frequently asked questions

### Swap Integration
- **TokenSelector**: Multi-token selection dropdown
- **SwapInterface**: Complete swap logic and UI
- **PancakeSwap Integration**: Direct router interaction for token swaps

## 🌐 Web3 Integration

### Supported Networks
- Binance Smart Chain (BSC) Mainnet

### Supported Tokens
- **ODC**: OBE CAT Token (0x018cF072DEF5e8075294B019FcECCbD49C224444)
- **BNB**: Native Binance Coin
- **WBNB**: Wrapped BNB
- **USDT**: Tether USD (BEP-20)

### Wallet Support
- MetaMask
- WalletConnect
- Trust Wallet
- And other Web3 wallets via ConnectKit

## 🎭 Animations & Interactions

### Custom Animations
- `animate-fade-in-up`: Smooth fade and slide up effect
- `animate-fade-in`: Simple fade in animation
- `animate-slide-in-left/right`: Directional slide animations
- `animate-pulse-soft`: Gentle pulsing effect
- `animate-glow`: Glowing border animation
- `hover-lift`: Lift effect on hover
- `hover-scale`: Scale effect on hover

### Animation Delays
- Staggered delays (100ms - 500ms) for sequential animations
- Smooth transitions for all interactive elements

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_APP_NAME=Cat Finance
VITE_APP_VERSION=1.0.0

# Web3 Configuration
VITE_CHAIN_ID=56
VITE_RPC_URL=https://bsc-dataseed1.binance.org/

# PancakeSwap Configuration
VITE_ROUTER_ADDRESS=0x10ED43C718714eb63d5aA57B78B54704E256024E
VITE_FACTORY_ADDRESS=0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73
```

## 📱 Mobile Responsiveness

- **Breakpoints**: Follows Tailwind's responsive design system
- **Mobile Menu**: Slide-out navigation with backdrop
- **Touch Optimized**: Button sizes and interactions optimized for touch
- **Adaptive Layouts**: Components adapt to different screen sizes

## 🚀 Performance

### Build Optimizations
- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Minification**: JavaScript and CSS minification

### Bundle Analysis
- Main bundle: ~2MB (minified)
- Lazy-loaded chunks for optimal performance
- Gzip compression reduces transfer size significantly

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Development Guidelines
- Use TypeScript for type safety
- Follow React hooks patterns
- Implement responsive design mobile-first
- Use Tailwind classes for styling
- Add proper error handling for Web3 interactions

## 🔒 Security

### Best Practices
- No private keys stored in code
- Secure Web3 provider connections
- Input validation for all user inputs
- Proper error handling for failed transactions

## 🐛 Troubleshooting

### Common Issues
1. **Build Failures**: Ensure all TypeScript errors are resolved
2. **Web3 Connection**: Check network configuration and wallet connection
3. **Swap Failures**: Verify token approvals and sufficient balance
4. **Mobile Issues**: Test on actual devices for touch interactions

### Build Warnings
- Large chunk size warnings are expected due to Web3 dependencies
- Rollup annotation warnings from ox library can be safely ignored

## 📄 License

This project is part of the Cat Finance ecosystem. All rights reserved.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Ensure TypeScript compilation passes
3. Test on multiple devices and screen sizes
4. Add proper error handling for new features

---

**Sun God Lab** - Empowering communities through freedom in a disciplined world 🌟✨