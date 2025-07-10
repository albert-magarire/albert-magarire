# 🎯 Multi-Timeframe Trading Dashboard

A **professional-grade** real-time trading dashboard with **multi-timeframe analysis** that follows the proven trading strategy: analyze on 15-minute charts, confirm on 5-minute charts, and enter on 1-minute charts. Features real-time market data, candlestick charts, and automated SMS alerts.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## 🚀 **Multi-Timeframe Trading Strategy**

### 📊 **The 15M → 5M → 1M Approach**
1. **15-Minute Analysis**: Primary trend identification and signal generation
2. **5-Minute Confirmation**: Trend confirmation and entry refinement  
3. **1-Minute Entry**: Precise entry timing and execution

### 🎯 **Signal Generation Logic**
- **15M Chart**: Must have 5/7 conditions + TDI ≤32 (BUY) or ≥80 (SELL)
- **5M Chart**: Must have 4/7 conditions + TDI confirmation
- **1M Chart**: Must have 3/7 conditions for final entry confirmation
- **Final Signal**: Generated only when ALL timeframes align

## ✨ **Advanced Features**

### 🔄 **Real-Time Market Data**
- **WebSocket Connection**: Live data streaming every 30 seconds
- **OHLC Candlestick Data**: Professional candlestick charts for all timeframes
- **TDI Oscillators**: Individual TDI analysis for each timeframe
- **Market Sessions**: Volatility adjustment based on trading hours

### 📈 **Candlestick Charts**
- **15-Minute Charts**: Primary trend analysis
- **5-Minute Charts**: Trend confirmation
- **1-Minute Charts**: Entry timing
- **Interactive Tooltips**: OHLCV data on hover
- **Real-Time Updates**: Live chart updates via WebSocket

### 🤖 **Intelligent Analysis**
- **Multi-Condition Checking**: 7 sophisticated trading conditions per timeframe
- **TDI Divergence Detection**: Advanced momentum analysis
- **Risk Management**: Automatic SL/TP calculation with R:R ratios
- **Signal Strength**: Percentage-based confidence scoring

### 📱 **Enhanced SMS Alerts**
- **Phone Number**: `+1(662)924-9008` (Updated)
- **Multi-Timeframe Data**: Complete signal breakdown across all timeframes
- **Detailed Information**: Entry, SL, TP, TDI values, and confirmation status
- **Professional Format**: Clean, trader-friendly message format

## 🔧 **Technical Architecture**

### **Frontend (React + WebSocket)**
- **Real-Time Components**: WebSocket-powered live updates
- **Custom Candlestick Charts**: Built with Recharts
- **TDI Oscillators**: Individual charts for each timeframe
- **Responsive Design**: Works perfectly on all devices

### **Backend (Node.js + Express + WebSocket)**
- **Market Data API**: Real-time OHLC data generation
- **Multi-Timeframe Analysis**: Sophisticated trading logic
- **WebSocket Server**: Live data broadcasting
- **RESTful Endpoints**: Analysis and market data APIs
- **Cron Jobs**: Scheduled data updates every 30 seconds

### **Trading Logic Engine**
- **Condition Analysis**: 7 conditions per timeframe
- **TDI Calculation**: RSI-based momentum indicator
- **EMA Analysis**: 12/26 period crossovers
- **Volume Confirmation**: Trend validation
- **Market Structure**: Pattern recognition

## 🎮 **Quick Start**

### 🚀 **One-Command Launch**
```bash
./start.sh
```

### 📋 **Manual Setup**
```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start backend (Terminal 1)
cd backend && npm start

# Start frontend (Terminal 2)
npm start
```

### 🌐 **Access Points**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📊 **API Endpoints**

### **Market Data**
```bash
GET /api/market-data/{symbol}/{timeframe}
# Get OHLC data for specific symbol and timeframe
# Examples: /api/market-data/EURUSD/15min
```

### **Multi-Timeframe Analysis**
```bash
GET /api/analysis/{symbol}
# Get complete multi-timeframe analysis
# Returns: 15min, 5min, 1min TDI + conditions + signals
```

### **SMS Alerts**
```bash
POST /api/send-sms
# Send multi-timeframe trading signal via SMS
# Body: { signal: {...} }
```

## 🎯 **Trading Conditions Explained**

### **1. TDI (Traders Dynamic Index)**
- **Calculation**: RSI-based momentum oscillator (0-100)
- **Signals**: Buy ≤32, Sell ≥80, with divergence detection
- **Timeframes**: Individual calculation for 15M, 5M, 1M

### **2. Volume Analysis**
- **Pattern**: Increasing/decreasing volume trends
- **Confirmation**: Volume > 1.2x average for trend validation

### **3. EMA Analysis**
- **Crossovers**: 12-period vs 26-period EMA
- **Trend**: Price above/below EMA for direction

### **4. Market Structure**
- **Patterns**: Higher Highs/Higher Lows detection
- **Structure**: Break of Structure (BoS) identification

### **5. Support/Resistance**
- **Key Levels**: Proximity to significant price levels
- **Distance**: Measured within 0.1% of key levels

### **6. Market Sessions**
- **Active Hours**: London (8-17 UTC), NY (13-22 UTC), Tokyo (0-9 UTC)
- **Volatility**: Session-based volatility adjustments

### **7. Risk Management**
- **Stop Loss**: Automatic calculation based on signal type
- **Take Profit**: Risk/Reward ratio optimization (1:2 to 1:4)

## 📱 **SMS Alert Format**

```
🟢 MULTI-TIMEFRAME SIGNAL
BUY EURUSD
Entry: 1.08450
15M TDI: 29.5
5M TDI: 31.2
1M TDI: 28.9
SL: 1.08250
TP: 1.08650
Strength: 85%
Time: 14:23:45
```

## 🔮 **Advanced Features Ready**

### **Real Market Data Integration**
- Easy integration with Alpha Vantage, Finnhub, or IEX Cloud
- Replace simulation with live market feeds
- Professional-grade data quality

### **Production Enhancements**
- Database integration for signal history
- User authentication and personal dashboards
- Mobile app development (React Native ready)
- Advanced backtesting capabilities
- Machine learning signal optimization

## 📈 **Multi-Timeframe Dashboard Layout**

```
┌─────────────────────────────────────────────────────────┐
│  📊 15-MINUTE TIMEFRAME                                 │
│  ├── Candlestick Chart    │  ├── TDI Oscillator        │
│  └── Primary Analysis     │  └── Signal Generation     │
├─────────────────────────────────────────────────────────┤
│  📊 5-MINUTE TIMEFRAME                                  │
│  ├── Candlestick Chart    │  ├── TDI Oscillator        │
│  └── Confirmation        │  └── Trend Validation      │
├─────────────────────────────────────────────────────────┤
│  📊 1-MINUTE TIMEFRAME                                  │
│  ├── Candlestick Chart    │  ├── TDI Oscillator        │
│  └── Entry Timing        │  └── Final Confirmation    │
├─────────────────────────────────────────────────────────┤
│  📋 MULTI-TIMEFRAME ANALYSIS SUMMARY                   │
│  ├── 15M: ✓ CONFIRMED    │  ├── 5M: ✓ CONFIRMED      │
│  └── 1M: ✓ CONFIRMED     │  └── 🚀 SIGNAL READY      │
└─────────────────────────────────────────────────────────┘
```

## ⚡ **Performance Features**

- **WebSocket Streaming**: Real-time data without polling
- **Optimized Rendering**: Efficient chart updates
- **Memory Management**: Limited data retention (100 candles per timeframe)
- **Error Handling**: Automatic reconnection and error recovery

## 🎓 **Trading Strategy Benefits**

### **Why Multi-Timeframe Analysis?**
1. **Reduced False Signals**: Higher confirmation across timeframes
2. **Better Entry Timing**: Precise 1-minute entries
3. **Improved Risk/Reward**: Better SL/TP placement
4. **Trend Alignment**: Trade with overall market direction

### **Professional Trading Approach**
- **Top-Down Analysis**: Start broad, narrow to specific
- **Confluence Trading**: Multiple confirmations required
- **Risk Management**: Systematic SL/TP calculation
- **Objective Signals**: Removes emotional trading decisions

## 🛡️ **Risk Management**

- **Position Sizing**: Automatic calculation recommendations
- **Stop Loss**: Dynamic SL based on market structure
- **Take Profit**: Optimized R:R ratios
- **Signal Filtering**: Only high-probability setups

## � **Support & Contact**

For technical support or trading strategy questions:
- **SMS Alerts**: `+1(662)924-9008`
- **GitHub Issues**: For technical problems
- **Documentation**: Comprehensive setup guides included

## ⚠️ **Important Disclaimers**

- **Educational Purpose**: This system is for educational and demonstration purposes
- **Not Financial Advice**: Consult professional traders and financial advisors
- **Risk Warning**: Trading involves substantial risk of loss
- **Demo Data**: Currently uses simulated market data (easily replaceable with real feeds)

---

## 🎉 **Ready to Trade?**

**🚀 Launch Command**: `./start.sh`

**� Watch your phone for SMS alerts when all timeframes align!**

**📈 Professional multi-timeframe analysis at your fingertips!**
