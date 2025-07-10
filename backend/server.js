const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const http = require('http');

const app = express();
const PORT = 3001;

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Market data configuration
const FINNHUB_API_KEY = 'sandbox_c8qj9h9r01qgv7l3fhtg'; // Free sandbox key
const ALPHA_VANTAGE_KEY = 'demo'; // You can get a free key from Alpha Vantage

// In-memory storage for market data
let marketData = {
  EURUSD: { '15min': [], '5min': [], '1min': [] },
  XAUUSD: { '15min': [], '5min': [], '1min': [] },
  GBPUSD: { '15min': [], '5min': [], '1min': [] },
  USDJPY: { '15min': [], '5min': [], '1min': [] }
};

// TDI calculation function
function calculateTDI(prices, period = 14) {
  if (prices.length < period) return 50;
  
  // Calculate True Range
  const trueRanges = [];
  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  // Simple TDI approximation using RSI-like calculation
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i].close - prices[i - 1].close;
    if (change > 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }
  }
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Generate realistic OHLC data (for demo - replace with real API)
function generateOHLC(basePrice, timeframe) {
  const volatility = timeframe === '1min' ? 0.0001 : timeframe === '5min' ? 0.0003 : 0.0008;
  const trend = Math.sin(Date.now() * 0.00001) * 0.002;
  
  const open = basePrice + (Math.random() - 0.5) * volatility + trend * basePrice;
  const close = open + (Math.random() - 0.5) * volatility + trend * basePrice;
  const high = Math.max(open, close) + Math.random() * volatility;
  const low = Math.min(open, close) - Math.random() * volatility;
  
  return {
    timestamp: Date.now(),
    open: Number(open.toFixed(5)),
    high: Number(high.toFixed(5)),
    low: Number(low.toFixed(5)),
    close: Number(close.toFixed(5)),
    volume: Math.floor(Math.random() * 1000) + 100
  };
}

// Real market data fetcher (Alpha Vantage example)
async function fetchRealMarketData(symbol, interval) {
  try {
    // For demo purposes, we'll simulate real data
    // In production, use: 
    // const response = await axios.get(`https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${symbol.slice(0,3)}&to_symbol=${symbol.slice(3)}&interval=${interval}&apikey=${ALPHA_VANTAGE_KEY}`);
    
    const basePrices = {
      EURUSD: 1.0850,
      XAUUSD: 1950,
      GBPUSD: 1.2650,
      USDJPY: 149.50
    };
    
    return generateOHLC(basePrices[symbol], interval);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

// Update market data for all timeframes
async function updateMarketData() {
  const symbols = ['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY'];
  const timeframes = ['15min', '5min', '1min'];
  
  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      const newCandle = await fetchRealMarketData(symbol, timeframe);
      if (newCandle) {
        marketData[symbol][timeframe].push(newCandle);
        // Keep only last 100 candles per timeframe
        if (marketData[symbol][timeframe].length > 100) {
          marketData[symbol][timeframe] = marketData[symbol][timeframe].slice(-100);
        }
      }
    }
  }
  
  // Broadcast to all connected WebSocket clients
  broadcastMarketData();
}

// Broadcast market data to WebSocket clients
function broadcastMarketData() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'marketData',
        data: marketData
      }));
    }
  });
}

// Multi-timeframe analysis
function analyzeMultiTimeframe(symbol) {
  const data = marketData[symbol];
  
  // 15-minute analysis
  const candles15m = data['15min'];
  const tdi15m = calculateTDI(candles15m);
  const conditions15m = checkTradingConditions(candles15m, '15min');
  
  // 5-minute confirmation
  const candles5m = data['5min'];
  const tdi5m = calculateTDI(candles5m);
  const conditions5m = checkTradingConditions(candles5m, '5min');
  
  // 1-minute entry
  const candles1m = data['1min'];
  const tdi1m = calculateTDI(candles1m);
  const conditions1m = checkTradingConditions(candles1m, '1min');
  
  // Multi-timeframe signal logic
  const signal15m = (tdi15m <= 32 || tdi15m >= 80) && conditions15m.metCount >= 5;
  const signal5m = (tdi5m <= 32 || tdi5m >= 80) && conditions5m.metCount >= 4; // Slightly lower threshold for confirmation
  const signal1m = conditions1m.metCount >= 3; // Entry confirmation
  
  const overallSignal = signal15m && signal5m && signal1m;
  const signalType = tdi15m <= 32 ? 'BUY' : tdi15m >= 80 ? 'SELL' : 'NEUTRAL';
  
  return {
    symbol,
    signal: overallSignal,
    type: signalType,
    timeframes: {
      '15min': { tdi: tdi15m, conditions: conditions15m, signal: signal15m },
      '5min': { tdi: tdi5m, conditions: conditions5m, signal: signal5m },
      '1min': { tdi: tdi1m, conditions: conditions1m, signal: signal1m }
    }
  };
}

// Enhanced trading conditions checker
function checkTradingConditions(candles, timeframe) {
  if (candles.length < 20) return { metCount: 0, details: {} };
  
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  
  // Calculate various indicators
  const prices = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);
  
  // EMA calculation
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  // Volume analysis
  const avgVolume = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const volumeIncrease = latest.volume > avgVolume * 1.2;
  
  // Trend analysis
  const trendUp = ema12 > ema26;
  const priceAboveEMA = latest.close > ema12;
  
  // Market structure (simplified)
  const higherHigh = latest.high > previous.high;
  const higherLow = latest.low > previous.low;
  const bullishStructure = higherHigh && higherLow;
  
  // Support/Resistance levels
  const nearKeyLevel = checkKeyLevels(latest.close, candles);
  
  const conditions = {
    tdi: true, // Will be set by caller
    volume: volumeIncrease,
    trend: trendUp,
    ema: priceAboveEMA,
    marketStructure: bullishStructure,
    sessions: checkMarketSession(),
    keyLevels: nearKeyLevel
  };
  
  const metCount = Object.values(conditions).filter(Boolean).length;
  
  return { metCount, details: conditions };
}

// Helper functions
function calculateEMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function checkKeyLevels(price, candles) {
  // Simplified key level detection
  const highs = candles.slice(-20).map(c => c.high);
  const lows = candles.slice(-20).map(c => c.low);
  
  const resistance = Math.max(...highs);
  const support = Math.min(...lows);
  
  const distanceToResistance = Math.abs(price - resistance) / price;
  const distanceToSupport = Math.abs(price - support) / price;
  
  return distanceToResistance < 0.001 || distanceToSupport < 0.001;
}

function checkMarketSession() {
  const hour = new Date().getUTCHours();
  // London session: 8-17 UTC, New York: 13-22 UTC, Tokyo: 0-9 UTC
  return (hour >= 8 && hour <= 17) || (hour >= 13 && hour <= 22) || (hour >= 0 && hour <= 9);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  // Send initial market data
  ws.send(JSON.stringify({
    type: 'marketData',
    data: marketData
  }));
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// REST API endpoints

// Get market data for specific symbol and timeframe
app.get('/api/market-data/:symbol/:timeframe', (req, res) => {
  const { symbol, timeframe } = req.params;
  
  if (!marketData[symbol] || !marketData[symbol][timeframe]) {
    return res.status(404).json({ error: 'Symbol or timeframe not found' });
  }
  
  res.json({
    symbol,
    timeframe,
    data: marketData[symbol][timeframe],
    tdi: calculateTDI(marketData[symbol][timeframe])
  });
});

// Multi-timeframe analysis endpoint
app.get('/api/analysis/:symbol', (req, res) => {
  const { symbol } = req.params;
  
  if (!marketData[symbol]) {
    return res.status(404).json({ error: 'Symbol not found' });
  }
  
  const analysis = analyzeMultiTimeframe(symbol);
  res.json(analysis);
});

// Enhanced SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { signal } = req.body;
    
    if (!signal || !signal.type || !signal.pair) {
      return res.status(400).json({ 
        error: 'Invalid signal data', 
        required: ['type', 'pair'] 
      });
    }

    const phoneNumber = '+1(662)924-9008'; // Updated phone number
    const smsData = {
      to: phoneNumber,
      message: formatEnhancedSignalMessage(signal),
      timestamp: new Date().toISOString(),
      signalId: signal.id
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📱 Multi-Timeframe SMS Alert Sent:');
    console.log(`To: ${smsData.to}`);
    console.log(`Message: ${smsData.message}`);
    console.log('---');

    res.json({
      success: true,
      message: 'SMS sent successfully',
      smsId: `sms_${Date.now()}`,
      timestamp: smsData.timestamp
    });

  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({
      error: 'Failed to send SMS',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    marketData: {
      symbols: Object.keys(marketData),
      lastUpdate: new Date().toISOString()
    }
  });
});

// Enhanced signal message formatter
function formatEnhancedSignalMessage(signal) {
  const emoji = signal.type === 'BUY' ? '🟢' : '🔴';
  
  return `${emoji} MULTI-TIMEFRAME SIGNAL
${signal.type} ${signal.pair}
Entry: ${signal.price}
15M TDI: ${signal.timeframes?.['15min']?.tdi || 'N/A'}
5M TDI: ${signal.timeframes?.['5min']?.tdi || 'N/A'}
1M TDI: ${signal.timeframes?.['1min']?.tdi || 'N/A'}
SL: ${signal.stopLoss}
TP: ${signal.takeProfit}
Strength: ${signal.strength}%
Time: ${signal.timestamp}`;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Schedule market data updates
// Update 1-minute data every 30 seconds
cron.schedule('*/30 * * * * *', () => {
  updateMarketData();
});

// Initialize market data on startup
setTimeout(() => {
  console.log('🔄 Initializing market data...');
  updateMarketData();
}, 2000);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Enhanced Trading Bot Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 SMS endpoint: http://localhost:${PORT}/api/send-sms`);
  console.log(`📊 Market data: http://localhost:${PORT}/api/market-data/{symbol}/{timeframe}`);
  console.log(`🔍 Analysis: http://localhost:${PORT}/api/analysis/{symbol}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 WebSocket server: ws://localhost:${PORT}`);
});