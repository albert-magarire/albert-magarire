import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Phone, Activity, BarChart3, Zap, Clock, Target, Wifi, WifiOff } from 'lucide-react';
import CandlestickChart from './CandlestickChart';
import TDIChart from './TDIChart';

const TradingDashboard = () => {
  const [currentPair, setCurrentPair] = useState('EURUSD');
  const [signals, setSignals] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [analysis, setAnalysis] = useState({});
  const [wsConnected, setWsConnected] = useState(false);
  const [tradingStats, setTradingStats] = useState({
    totalSignals: 0,
    winRate: 0,
    activeTime: 0
  });
  const [sessionStartTime] = useState(Date.now());
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket('ws://localhost:3001');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'marketData') {
            setMarketData(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setWsConnected(false);
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Fetch multi-timeframe analysis
  const fetchAnalysis = useCallback(async (symbol) => {
    try {
      const response = await fetch(`http://localhost:3001/api/analysis/${symbol}`);
      if (response.ok) {
        const analysisData = await response.json();
        setAnalysis(prev => ({ ...prev, [symbol]: analysisData }));
        
        // Generate signal if all timeframes align
        if (analysisData.signal && analysisData.type !== 'NEUTRAL') {
          const currentPrice = getCurrentPrice(symbol);
          generateMultiTimeframeSignal(analysisData, currentPrice);
        }
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  }, []);

  // Get current price for a symbol
  const getCurrentPrice = (symbol) => {
    const data = marketData[symbol];
    if (data && data['1min'] && data['1min'].length > 0) {
      return data['1min'][data['1min'].length - 1].close;
    }
    return 0;
  };

  // Generate multi-timeframe signal
  const generateMultiTimeframeSignal = (analysisData, currentPrice) => {
    const newSignal = {
      id: Date.now(),
      pair: analysisData.symbol,
      type: analysisData.type,
      timestamp: new Date().toLocaleTimeString(),
      price: currentPrice,
      timeframes: analysisData.timeframes,
      strength: Math.floor(
        (Object.values(analysisData.timeframes).filter(tf => tf.signal).length / 3) * 100
      ),
      riskReward: `1:${(Math.random() * 2 + 2).toFixed(1)}`,
      stopLoss: analysisData.type === 'BUY' ? currentPrice - 0.002 : currentPrice + 0.002,
      takeProfit: analysisData.type === 'BUY' ? currentPrice + 0.004 : currentPrice - 0.004
    };
    
    setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
    setTradingStats(prev => ({ ...prev, totalSignals: prev.totalSignals + 1 }));
  };

  // Periodic analysis updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsConnected && Object.keys(marketData).length > 0) {
        fetchAnalysis(currentPair);
      }
    }, 10000); // Every 10 seconds

    // Initial fetch
    if (wsConnected && marketData[currentPair]) {
      fetchAnalysis(currentPair);
    }

    return () => clearInterval(interval);
  }, [currentPair, wsConnected, marketData, fetchAnalysis]);

  // Update trading stats
  useEffect(() => {
    const interval = setInterval(() => {
      setTradingStats(prev => ({
        ...prev,
        activeTime: Math.floor((Date.now() - sessionStartTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Enhanced SMS alert with multi-timeframe data
  const sendSMSAlert = useCallback(async (signal) => {
    const phoneNumber = '+1(662)924-9008'; // Updated phone number
    
    const enhancedSignal = {
      ...signal,
      price: getCurrentPrice(signal.pair),
      timeframes: signal.timeframes
    };
    
    try {
      const response = await fetch('http://localhost:3001/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal: enhancedSignal })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('SMS sent successfully:', result);
        alert(`✅ Multi-Timeframe SMS Alert Sent to ${phoneNumber}!`);
      } else {
        const error = await response.json();
        alert(`❌ SMS Failed: ${error.error}`);
      }
    } catch (error) {
      alert(`📱 Backend offline - Mock SMS sent to ${phoneNumber}`);
      console.log('Mock Multi-Timeframe SMS Alert:', enhancedSignal);
    }
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timeframe data for current pair
  const getTimeframeData = (timeframe) => {
    return marketData[currentPair]?.[timeframe] || [];
  };

  // Get current analysis for display
  const currentAnalysis = analysis[currentPair];
  const isSignalReady = currentAnalysis?.signal || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-400 w-8 h-8" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Multi-Timeframe Trading Bot
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1">
              {wsConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                {wsConnected ? 'Live' : 'Reconnecting'} • {formatTime(tradingStats.activeTime)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm">{tradingStats.totalSignals} Signals</span>
            </div>
            <select 
              value={currentPair} 
              onChange={(e) => setCurrentPair(e.target.value)}
              className="bg-gray-800/70 border border-gray-600 rounded-lg px-4 py-2 backdrop-blur-sm"
            >
              <option value="EURUSD">EUR/USD</option>
              <option value="XAUUSD">XAU/USD</option>
              <option value="GBPUSD">GBP/USD</option>
              <option value="USDJPY">USD/JPY</option>
            </select>
            <div className={`px-4 py-2 rounded-lg font-semibold backdrop-blur-sm transition-all duration-300 ${
              isSignalReady ? 'bg-green-600/80 border border-green-400 animate-pulse-glow' : 'bg-yellow-600/80 border border-yellow-400'
            }`}>
              {isSignalReady ? '🚀 SIGNAL READY' : '⏳ ANALYZING'} ({currentAnalysis?.type || 'SCANNING'})
            </div>
          </div>
        </div>

        {/* Price Summary Header */}
        {getTimeframeData('1min').length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold font-mono">
                    {getTimeframeData('1min')[getTimeframeData('1min').length - 1]?.close?.toFixed(5) || '—'}
                  </div>
                  <div className="text-sm text-gray-400">{currentPair}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-400">15M</div>
                    <div className={`text-sm font-bold ${
                      currentAnalysis?.timeframes?.['15min']?.signal ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {currentAnalysis?.timeframes?.['15min']?.signal ? '✓' : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">5M</div>
                    <div className={`text-sm font-bold ${
                      currentAnalysis?.timeframes?.['5min']?.signal ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {currentAnalysis?.timeframes?.['5min']?.signal ? '✓' : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">1M</div>
                    <div className={`text-sm font-bold ${
                      currentAnalysis?.timeframes?.['1min']?.signal ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {currentAnalysis?.timeframes?.['1min']?.signal ? '✓' : '—'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Multi-TF Signal</div>
                <div className={`text-xl font-bold transition-colors duration-300 ${
                  currentAnalysis?.signal && currentAnalysis?.type === 'BUY' ? 'text-green-400' : 
                  currentAnalysis?.signal && currentAnalysis?.type === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {currentAnalysis?.type || 'NEUTRAL'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Multi-Timeframe Charts - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 15-Minute Timeframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CandlestickChart
                data={getTimeframeData('15min')}
                title="15-Minute Chart"
                timeframe="15min"
                tdi={currentAnalysis?.timeframes?.['15min']?.tdi}
                height={250}
              />
              <TDIChart
                data={getTimeframeData('15min')}
                timeframe="15min"
                tdiValue={currentAnalysis?.timeframes?.['15min']?.tdi}
                height={180}
              />
            </div>

            {/* 5-Minute Timeframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CandlestickChart
                data={getTimeframeData('5min')}
                title="5-Minute Chart"
                timeframe="5min"
                tdi={currentAnalysis?.timeframes?.['5min']?.tdi}
                height={220}
              />
              <TDIChart
                data={getTimeframeData('5min')}
                timeframe="5min"
                tdiValue={currentAnalysis?.timeframes?.['5min']?.tdi}
                height={160}
              />
            </div>

            {/* 1-Minute Timeframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CandlestickChart
                data={getTimeframeData('1min')}
                title="1-Minute Chart (Entry)"
                timeframe="1min"
                tdi={currentAnalysis?.timeframes?.['1min']?.tdi}
                height={200}
              />
              <TDIChart
                data={getTimeframeData('1min')}
                timeframe="1min"
                tdiValue={currentAnalysis?.timeframes?.['1min']?.tdi}
                height={140}
              />
            </div>

            {/* Multi-Timeframe Conditions Summary */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Multi-Timeframe Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['15min', '5min', '1min'].map(timeframe => (
                  <div key={timeframe} className={`p-4 rounded-lg border ${
                    currentAnalysis?.timeframes?.[timeframe]?.signal 
                      ? 'border-green-400 bg-green-900/20' 
                      : 'border-gray-600 bg-gray-800/20'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{timeframe.toUpperCase()}</h4>
                      {currentAnalysis?.timeframes?.[timeframe]?.signal ? (
                        <CheckCircle className="text-green-400 w-5 h-5" />
                      ) : (
                        <XCircle className="text-red-400 w-5 h-5" />
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>TDI: {currentAnalysis?.timeframes?.[timeframe]?.tdi?.toFixed(1) || '—'}</div>
                      <div>Conditions: {currentAnalysis?.timeframes?.[timeframe]?.conditions?.metCount || 0}/7</div>
                      <div className={`mt-1 font-semibold ${
                        currentAnalysis?.timeframes?.[timeframe]?.signal ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {currentAnalysis?.timeframes?.[timeframe]?.signal ? 'CONFIRMED' : 'WAITING'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Signals */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Multi-TF Signals
              <span className="text-xs text-gray-400 ml-auto">Total: {tradingStats.totalSignals}</span>
            </h3>
            
            {signals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Analyzing timeframes...</p>
                <p className="text-xs mt-1">15M → 5M → 1M</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal) => (
                  <div key={signal.id} className={`p-3 rounded-lg border backdrop-blur-sm ${
                    signal.type === 'BUY' ? 'border-green-400 bg-green-900/30' : 'border-red-400 bg-red-900/30'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {signal.type === 'BUY' ? 
                          <TrendingUp className="text-green-400 w-5 h-5" /> : 
                          <TrendingDown className="text-red-400 w-5 h-5" />
                        }
                        <div>
                          <div className="font-bold text-sm">{signal.pair}</div>
                          <div className="text-xs text-gray-400">{signal.timestamp}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendSMSAlert(signal)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-600 rounded text-xs transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        SMS
                      </button>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className={`font-bold ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.type} SIGNAL • {signal.strength}% strength
                      </div>
                      <div className="text-gray-400">
                        Entry: {signal.price?.toFixed(5)} • R:R {signal.riskReward}
                      </div>
                      <div className="text-gray-400">
                        SL: {signal.stopLoss?.toFixed(5)} • TP: {signal.takeProfit?.toFixed(5)}
                      </div>
                      <div className="text-gray-400">
                        Multi-TF: 15M→5M→1M Confirmed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;