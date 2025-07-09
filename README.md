# Advanced Trading Dashboard 📈

A real-time trading dashboard built with React that monitors multiple trading conditions and generates automated signals with SMS alerts. This professional-grade application features live price feeds, technical analysis indicators, and intelligent signal generation.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

## ✨ Features

### 🎯 Real-Time Trading Analysis
- **Live Price Feeds**: Real-time price data for major trading pairs (EUR/USD, XAU/USD, GBP/USD, USD/JPY)
- **TDI Oscillator**: Advanced momentum indicator with divergence detection
- **Multi-Condition Analysis**: 7 sophisticated trading conditions including volume, trend, EMA, market structure
- **Interactive Charts**: Beautiful, responsive charts powered by Recharts library

### 🤖 Intelligent Signal Generation
- **Smart Algorithms**: Signals generated when 5+ conditions align
- **Risk Management**: Automatic stop-loss and take-profit calculations
- **Signal Strength**: Percentage-based signal confidence scoring
- **Real-Time Notifications**: Instant alerts when trading opportunities arise

### 📱 SMS Alert System
- **Instant Notifications**: SMS alerts sent to your phone for urgent signals
- **Detailed Information**: Complete signal data including entry, SL, TP levels
- **Backend Integration**: RESTful API for reliable message delivery

### 🎨 Professional UI/UX
- **Dark Theme**: Modern, eye-friendly dark interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-Time Updates**: Live data updates every 2-3 seconds
- **Smooth Animations**: Polished transitions and visual feedback

## � Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd trading-dashboard
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Start the backend server**
```bash
cd backend
npm start
```
The backend will run on `http://localhost:3001`

5. **Start the frontend application**
```bash
npm start
```
The app will open in your browser at `http://localhost:3000`

## 📊 Trading Conditions Explained

### 1. **TDI (Traders Dynamic Index)**
- Oscillator ranging from 0-100
- Buy signals when TDI ≤ 32 with divergence
- Sell signals when TDI ≥ 80 with divergence
- Momentum tracking for trend confirmation

### 2. **Volume Analysis**
- Volume threshold monitoring
- Trend confirmation through volume patterns
- Increasing/decreasing volume detection

### 3. **Trend Analysis**
- Higher Highs/Higher Lows (HH/HL) pattern detection
- Market structure analysis
- Trend strength evaluation

### 4. **EMA (Exponential Moving Average)**
- Bullish/Bearish cross detection
- Win rate tracking (60-80%)
- Multiple timeframe analysis

### 5. **Market Structure**
- Break of Structure (BoS) detection
- Change of Character (ChoCH) identification
- Order blocks and fair value gaps
- Liquidity sweep recognition

### 6. **Session Analysis**
- Asian/European/American session monitoring
- Liquidity level tracking
- Session-based volatility adjustment

### 7. **Key Levels**
- Support/resistance level proximity
- Weekly/daily high/low monitoring
- Distance measurement in pips

## 🔧 Configuration

### Customizing Trading Pairs
Edit the currency pairs in the dropdown by modifying the `TradingDashboard.js` component:

```javascript
<select value={currentPair} onChange={(e) => setCurrentPair(e.target.value)}>
  <option value="EURUSD">EUR/USD</option>
  <option value="XAUUSD">XAU/USD</option>
  <option value="GBPUSD">GBP/USD</option>
  <option value="USDJPY">USD/JPY</option>
  // Add more pairs here
</select>
```

### SMS Configuration
Update the phone number in the `sendSMSAlert` function:

```javascript
const phoneNumber = '+1234567890'; // Replace with your number
```

### Signal Sensitivity
Adjust the signal generation threshold by changing the condition count:

```javascript
if (metConditions >= 5) { // Change from 5 to your preferred number
  // Signal generation logic
}
```

## 📈 Technical Architecture

### Frontend (React)
- **Components**: Modular React components with hooks
- **State Management**: React useState and useEffect hooks
- **Styling**: Tailwind CSS with custom animations
- **Charts**: Recharts library for responsive visualizations
- **Icons**: Lucide React for modern iconography

### Backend (Node.js/Express)
- **API Endpoints**: RESTful API for SMS functionality
- **Error Handling**: Comprehensive error handling and logging
- **CORS**: Cross-origin resource sharing enabled
- **Health Checks**: Built-in health monitoring endpoints

### Real-Time Data
- **Simulation**: Realistic price and indicator simulation
- **Market Hours**: Session-based volatility adjustments
- **Performance**: Optimized for smooth real-time updates

## � Project Structure

```
trading-dashboard/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── TradingDashboard.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── backend/
│   ├── server.js
│   └── package.json
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔮 Future Enhancements

- [ ] Real market data integration (Alpha Vantage, IEX Cloud)
- [ ] Database integration for signal history
- [ ] User authentication and personal dashboards
- [ ] Mobile app development (React Native)
- [ ] Advanced charting with TradingView integration
- [ ] Machine learning-based signal improvement
- [ ] Telegram/Discord bot integration
- [ ] Backtesting capabilities
- [ ] Portfolio tracking and management
- [ ] Social trading features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This trading dashboard is for educational and informational purposes only. It should not be considered as financial advice. Trading involves substantial risk of loss and is not suitable for all investors. Always conduct your own research and consult with financial professionals before making trading decisions.

## 📞 Support

If you have any questions or need help with the setup, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the trading community**
