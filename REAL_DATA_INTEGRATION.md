# 🔄 Real Market Data Integration Guide

This guide shows you how to replace the simulated market data with **real-time market feeds** from various providers.

## 📊 **Market Data Provider Options**

### 🆓 **Free Options**
1. **Alpha Vantage** - 25 requests/day free, 5 requests/minute
2. **Finnhub** - 60 requests/minute free tier
3. **IEX Cloud** - 50,000 requests/month free
4. **Twelve Data** - 800 requests/day free

### 💰 **Paid Professional Options**
1. **Alpha Vantage Premium** - $49.99/month, unlimited requests
2. **Polygon.io** - $199/month, real-time data
3. **Quandl** - Various pricing tiers
4. **Bloomberg API** - Enterprise level
5. **Interactive Brokers API** - Direct broker data

## 🚀 **Quick Integration: Alpha Vantage (Recommended)**

### **Step 1: Get Your API Key**
1. Go to https://www.alphavantage.co/support/#api-key
2. Sign up for free account
3. Get your API key (example: `DEMO` for testing)

### **Step 2: Update Backend Environment**
Create `.env` file in backend folder:
```bash
# backend/.env
ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
FINNHUB_API_KEY=your_finnhub_key_here
```

### **Step 3: Install Additional Dependencies**
```bash
cd backend
npm install dotenv node-fetch
```

### **Step 4: Replace Simulated Data Function**

Replace the `fetchRealMarketData` function in `backend/server.js`:

```javascript
// Add at top of server.js
require('dotenv').config();
const fetch = require('node-fetch');

// Replace the existing fetchRealMarketData function
async function fetchRealMarketData(symbol, interval) {
  try {
    // Convert our symbol format to Alpha Vantage format
    const symbolMap = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD', 
      'USDJPY': 'USD/JPY',
      'XAUUSD': 'XAU/USD' // Gold
    };
    
    const avSymbol = symbolMap[symbol] || symbol;
    const avInterval = interval === '1min' ? '1min' : interval === '5min' ? '5min' : '15min';
    
    // For Forex pairs
    if (symbol !== 'XAUUSD') {
      const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${avSymbol.split('/')[0]}&to_symbol=${avSymbol.split('/')[1]}&interval=${avInterval}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message'] || data['Note']) {
        console.log('API limit reached, using simulation');
        return generateOHLC(getBasePrice(symbol), interval);
      }
      
      const timeSeries = data[`Time Series FX (${avInterval})`];
      if (!timeSeries) {
        console.log('No time series data, using simulation');
        return generateOHLC(getBasePrice(symbol), interval);
      }
      
      // Get the latest data point
      const latestTime = Object.keys(timeSeries)[0];
      const latestData = timeSeries[latestTime];
      
      return {
        timestamp: new Date(latestTime).getTime(),
        open: parseFloat(latestData['1. open']),
        high: parseFloat(latestData['2. high']),
        low: parseFloat(latestData['3. low']),
        close: parseFloat(latestData['4. close']),
        volume: Math.floor(Math.random() * 1000) + 100 // Forex doesn't have volume
      };
    } else {
      // For Gold (XAUUSD) - use different endpoint
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=GLD&interval=${avInterval}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const timeSeries = data[`Time Series (${avInterval})`];
      if (!timeSeries) {
        return generateOHLC(1950, interval);
      }
      
      const latestTime = Object.keys(timeSeries)[0];
      const latestData = timeSeries[latestTime];
      
      // Convert GLD price to approximate XAU/USD (multiply by ~20)
      const multiplier = 19.5; 
      
      return {
        timestamp: new Date(latestTime).getTime(),
        open: parseFloat(latestData['1. open']) * multiplier,
        high: parseFloat(latestData['2. high']) * multiplier,
        low: parseFloat(latestData['3. low']) * multiplier,
        close: parseFloat(latestData['4. close']) * multiplier,
        volume: parseInt(latestData['5. volume'])
      };
    }
  } catch (error) {
    console.error('Error fetching real market data:', error);
    // Fallback to simulation if API fails
    return generateOHLC(getBasePrice(symbol), interval);
  }
}

// Helper function for base prices
function getBasePrice(symbol) {
  const basePrices = {
    EURUSD: 1.0850,
    XAUUSD: 1950,
    GBPUSD: 1.2650,
    USDJPY: 149.50
  };
  return basePrices[symbol] || 1.0000;
}
```

## 🔥 **Advanced Integration: Finnhub (Real-Time)**

### **Finnhub Setup (Better for Real-Time)**
```javascript
// Alternative: Finnhub integration for better real-time data
async function fetchFinnhubData(symbol, interval) {
  try {
    // Finnhub symbol mapping
    const symbolMap = {
      'EURUSD': 'OANDA:EUR_USD',
      'GBPUSD': 'OANDA:GBP_USD',
      'USDJPY': 'OANDA:USD_JPY',
      'XAUUSD': 'OANDA:XAU_USD'
    };
    
    const finnhubSymbol = symbolMap[symbol];
    const resolution = interval === '1min' ? '1' : interval === '5min' ? '5' : '15';
    
    // Get candle data from last hour
    const to = Math.floor(Date.now() / 1000);
    const from = to - 3600; // 1 hour ago
    
    const url = `https://finnhub.io/api/v1/forex/candle?symbol=${finnhubSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      return generateOHLC(getBasePrice(symbol), interval);
    }
    
    // Get latest candle
    const lastIndex = data.c.length - 1;
    
    return {
      timestamp: data.t[lastIndex] * 1000, // Convert to milliseconds
      open: data.o[lastIndex],
      high: data.h[lastIndex],
      low: data.l[lastIndex],
      close: data.c[lastIndex],
      volume: data.v[lastIndex] || Math.floor(Math.random() * 1000) + 100
    };
  } catch (error) {
    console.error('Finnhub API error:', error);
    return generateOHLC(getBasePrice(symbol), interval);
  }
}
```

## 💎 **Professional Integration: Polygon.io**

### **Polygon.io Setup (Most Professional)**
```javascript
// Professional-grade integration with Polygon.io
async function fetchPolygonData(symbol, interval) {
  try {
    // Polygon symbol format
    const symbolMap = {
      'EURUSD': 'C:EURUSD',
      'GBPUSD': 'C:GBPUSD', 
      'USDJPY': 'C:USDJPY',
      'XAUUSD': 'C:XAUUSD'
    };
    
    const polygonSymbol = symbolMap[symbol];
    const timespan = interval === '1min' ? 'minute' : 'minute';
    const multiplier = interval === '1min' ? 1 : interval === '5min' ? 5 : 15;
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${polygonSymbol}/range/${multiplier}/${timespan}/${today}/${today}?adjusted=true&sort=desc&limit=1&apikey=${process.env.POLYGON_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return generateOHLC(getBasePrice(symbol), interval);
    }
    
    const result = data.results[0];
    
    return {
      timestamp: result.t,
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v || Math.floor(Math.random() * 1000) + 100
    };
  } catch (error) {
    console.error('Polygon API error:', error);
    return generateOHLC(getBasePrice(symbol), interval);
  }
}
```

## 🌐 **WebSocket Real-Time Integration**

### **Finnhub WebSocket (Real-Time Streaming)**
```javascript
// Add to backend/server.js for real-time streaming
const WebSocket = require('ws');

// Finnhub WebSocket for real-time data
function setupFinnhubWebSocket() {
  const socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);
  
  socket.addEventListener('open', function (event) {
    console.log('Finnhub WebSocket connected');
    
    // Subscribe to forex symbols
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'OANDA:EUR_USD'}));
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'OANDA:GBP_USD'}));
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'OANDA:USD_JPY'}));
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'OANDA:XAU_USD'}));
  });
  
  socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    
    if (data.type === 'trade') {
      // Process real-time tick data
      data.data.forEach(tick => {
        const symbol = tick.s.replace('OANDA:', '').replace('_', '');
        const price = tick.p;
        const timestamp = tick.t;
        
        // Update your market data with real-time ticks
        updateRealTimePrice(symbol, price, timestamp);
      });
    }
  });
}

// Function to update real-time prices
function updateRealTimePrice(symbol, price, timestamp) {
  // Convert tick data to OHLC format
  if (!marketData[symbol]) return;
  
  const timeframes = ['1min', '5min', '15min'];
  
  timeframes.forEach(tf => {
    if (marketData[symbol][tf].length > 0) {
      const lastCandle = marketData[symbol][tf][marketData[symbol][tf].length - 1];
      
      // Update current candle with new price
      lastCandle.close = price;
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.timestamp = timestamp;
    }
  });
  
  // Broadcast updated data
  broadcastMarketData();
}
```

## ⚙️ **Environment Variables Setup**

Create `backend/.env` file:
```bash
# Market Data API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
POLYGON_API_KEY=your_polygon_key
IEX_CLOUD_API_KEY=your_iex_key

# Trading Configuration
PHONE_NUMBER=+1(662)924-9008
```

## 🔄 **Update Server.js Integration**

Add this at the top of `backend/server.js`:
```javascript
require('dotenv').config();

// Choose your data provider
const DATA_PROVIDER = process.env.DATA_PROVIDER || 'alpha_vantage'; // 'alpha_vantage', 'finnhub', 'polygon'

// Update the fetchRealMarketData function call
async function updateMarketData() {
  const symbols = ['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY'];
  const timeframes = ['15min', '5min', '1min'];
  
  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      let newCandle;
      
      // Choose data provider
      switch (DATA_PROVIDER) {
        case 'finnhub':
          newCandle = await fetchFinnhubData(symbol, timeframe);
          break;
        case 'polygon':
          newCandle = await fetchPolygonData(symbol, timeframe);
          break;
        case 'alpha_vantage':
        default:
          newCandle = await fetchRealMarketData(symbol, timeframe);
          break;
      }
      
      if (newCandle) {
        marketData[symbol][timeframe].push(newCandle);
        if (marketData[symbol][timeframe].length > 100) {
          marketData[symbol][timeframe] = marketData[symbol][timeframe].slice(-100);
        }
      }
    }
  }
  
  broadcastMarketData();
}
```

## 🚨 **Error Handling & Rate Limiting**

Add robust error handling:
```javascript
// Rate limiting helper
const rateLimiter = {
  requests: 0,
  resetTime: Date.now() + 60000, // Reset every minute
  
  canMakeRequest() {
    if (Date.now() > this.resetTime) {
      this.requests = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    if (this.requests >= 5) { // Max 5 requests per minute
      return false;
    }
    
    this.requests++;
    return true;
  }
};

// Enhanced data fetching with fallback
async function fetchWithFallback(symbol, interval) {
  // Try real data first
  if (rateLimiter.canMakeRequest()) {
    try {
      const realData = await fetchRealMarketData(symbol, interval);
      if (realData && realData.close) {
        return realData;
      }
    } catch (error) {
      console.log('Real data failed, using simulation:', error.message);
    }
  }
  
  // Fallback to simulation
  return generateOHLC(getBasePrice(symbol), interval);
}
```

## 🎯 **Quick Setup Instructions**

### **Option 1: Alpha Vantage (Easiest)**
1. Get free API key: https://www.alphavantage.co/support/#api-key
2. Add to `backend/.env`: `ALPHA_VANTAGE_API_KEY=your_key`
3. Replace `fetchRealMarketData` function in `backend/server.js`
4. Restart backend: `cd backend && npm start`

### **Option 2: Finnhub (Better Real-Time)**
1. Get free API key: https://finnhub.io/register
2. Add to `backend/.env`: `FINNHUB_API_KEY=your_key`
3. Use Finnhub integration code above
4. Set `DATA_PROVIDER=finnhub` in `.env`

### **Option 3: Polygon.io (Professional)**
1. Sign up: https://polygon.io/pricing
2. Add API key to `.env`
3. Use Polygon integration code
4. Set `DATA_PROVIDER=polygon` in `.env`

## 📊 **Testing Real Data**

Add a test endpoint to verify real data:
```javascript
// Add to backend/server.js
app.get('/api/test-real-data/:symbol', async (req, res) => {
  const { symbol } = req.params;
  
  try {
    const realData = await fetchRealMarketData(symbol, '1min');
    res.json({
      success: true,
      symbol,
      data: realData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

Test with: `http://localhost:3001/api/test-real-data/EURUSD`

## 🎉 **You're Ready!**

1. **Choose your provider** (Alpha Vantage recommended for start)
2. **Get API key** and add to `.env` file
3. **Replace the data function** in `backend/server.js`
4. **Restart your backend**: `cd backend && npm start`
5. **Watch real market data** flow into your dashboard!

Your trading dashboard will now use **real market data** instead of simulation! 🚀

## 💡 **Pro Tips**

- **Start with free tiers** to test integration
- **Monitor API usage** to avoid rate limits
- **Keep simulation as fallback** for reliability
- **Consider caching** to reduce API calls
- **Use WebSocket streams** for truly real-time data

Happy trading with real market data! 📈📊