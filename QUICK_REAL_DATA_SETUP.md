# ⚡ Quick Real Data Setup (5 Minutes)

Replace simulated data with **real market data** in just 5 minutes!

## 🚀 **Option 1: Automated Setup (Recommended)**

```bash
# Run the setup script
./setup-real-data.sh
```

Follow the prompts to choose your data provider and enter your API key.

## 🛠️ **Option 2: Manual Setup (Alpha Vantage)**

### **Step 1: Get API Key**
1. Go to: https://www.alphavantage.co/support/#api-key
2. Sign up for free account 
3. Copy your API key

### **Step 2: Install Dependencies**
```bash
cd backend
npm install dotenv node-fetch
cd ..
```

### **Step 3: Create Environment File**
```bash
# Create backend/.env file
echo "ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE" > backend/.env
```

### **Step 4: Update Backend Code**

**Add to the top of `backend/server.js`:**
```javascript
require('dotenv').config();
const fetch = require('node-fetch');
```

**Replace the `fetchRealMarketData` function in `backend/server.js`:**
```javascript
async function fetchRealMarketData(symbol, interval) {
  try {
    // Convert symbols for Alpha Vantage
    const symbolMap = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD', 
      'USDJPY': 'USD/JPY',
      'XAUUSD': 'XAU/USD'
    };
    
    const avSymbol = symbolMap[symbol] || symbol;
    const avInterval = interval === '1min' ? '1min' : interval === '5min' ? '5min' : '15min';
    
    // Build API URL
    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${avSymbol.split('/')[0]}&to_symbol=${avSymbol.split('/')[1]}&interval=${avInterval}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for API limit or errors
    if (data['Error Message'] || data['Note']) {
      console.log('API limit reached, using simulation');
      return generateOHLC(getBasePrice(symbol), interval);
    }
    
    const timeSeries = data[`Time Series FX (${avInterval})`];
    if (!timeSeries) {
      console.log('No time series data, using simulation');
      return generateOHLC(getBasePrice(symbol), interval);
    }
    
    // Get latest data
    const latestTime = Object.keys(timeSeries)[0];
    const latestData = timeSeries[latestTime];
    
    return {
      timestamp: new Date(latestTime).getTime(),
      open: parseFloat(latestData['1. open']),
      high: parseFloat(latestData['2. high']),
      low: parseFloat(latestData['3. low']),
      close: parseFloat(latestData['4. close']),
      volume: Math.floor(Math.random() * 1000) + 100
    };
  } catch (error) {
    console.error('Error fetching real market data:', error);
    return generateOHLC(getBasePrice(symbol), interval);
  }
}

// Add helper function
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

### **Step 5: Restart Backend**
```bash
cd backend
npm start
```

## 🧪 **Test Your Setup**

Visit: `http://localhost:3001/api/test-real-data/EURUSD`

You should see real market data instead of simulation!

## 📱 **You're Done!**

Your trading dashboard now uses **real market data**! 

- **Free tier**: 25 API calls per day
- **Fallback**: Automatically uses simulation if API limit reached
- **Multi-timeframe**: Real data for 15M, 5M, and 1M charts

## 🚨 **Troubleshooting**

### **API Limit Reached**
- **Free tier**: 25 requests per day
- **Solution**: Upgrade to paid plan or use simulation
- **Status**: Check console logs for "API limit reached"

### **No Data Showing**
- **Check**: API key is correct in `.env` file
- **Check**: Internet connection
- **Check**: Console for error messages

### **Still Seeing Simulation**
- **Normal**: System falls back to simulation if API fails
- **Check**: Console logs for actual API responses
- **Test**: Use the test endpoint above

## 🎯 **What Happens Now**

1. ✅ **Real market data** flows into your charts
2. ✅ **Automatic fallback** to simulation if API fails  
3. ✅ **Multi-timeframe analysis** with real prices
4. ✅ **Enhanced signals** based on actual market movements
5. ✅ **SMS alerts** triggered by real market conditions

## 🔥 **Upgrade Options**

### **Alpha Vantage Premium** - $49.99/month
- Unlimited API calls
- Higher frequency updates
- More currency pairs

### **Finnhub** - Free 60 calls/minute
- Better real-time data
- WebSocket streaming available
- See `REAL_DATA_INTEGRATION.md` for setup

### **Polygon.io** - $199/month
- Professional-grade data
- Ultra-low latency
- Enterprise features

---

**🎉 Congratulations! You're now trading with REAL market data!**

**📈 Watch those real price movements drive your multi-timeframe analysis!**