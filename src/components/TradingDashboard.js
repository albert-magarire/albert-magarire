import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Phone, Activity, BarChart3, Zap, Settings, DollarSign, Clock, Target } from 'lucide-react';

const TradingDashboard = () => {
  const [currentPair, setCurrentPair] = useState('EURUSD');
  const [signals, setSignals] = useState([]);
  const [conditions, setConditions] = useState({
    tdi: { status: false, value: 45, divergence: false, signal: 'NEUTRAL' },
    volume: { status: false, value: 0.65 },
    trend: { status: true, pattern: 'HH/HL' },
    ema: { status: true, signal: 'Bullish Cross', winRate: 68 },
    marketStructure: { status: false, detected: ['BoS', 'Order Block'] },
    sessions: { status: true, asianLiquidity: 0.8 },
    keyLevels: { status: false, nearLevel: 'Weekly High', distance: 15 }
  });
  
  const [priceData, setPriceData] = useState([]);
  const [tdiData, setTdiData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  const [tradingStats, setTradingStats] = useState({
    totalSignals: 0,
    winRate: 0,
    avgPips: 0,
    activeTime: 0
  });
  const [sessionStartTime] = useState(Date.now());

  // Enhanced real-time data generation (every 2 seconds)
  useEffect(() => {
    const generateRealTimeData = () => {
      const basePrice = currentPair === 'EURUSD' ? 1.0850 : 1950;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Enhanced price movement with market session influence
      const hour = now.getHours();
      const sessionMultiplier = (hour >= 8 && hour <= 17) ? 1.5 : 0.8; // Higher volatility during market hours
      
      const trend = Math.sin(Date.now() * 0.00001) * 0.005;
      const volatility = (Math.random() - 0.5) * 0.003 * sessionMultiplier;
      const momentum = (Math.random() - 0.5) * 0.001;
      
      const newPrice = basePrice + trend * basePrice + volatility * basePrice + momentum * basePrice;
      
      // Enhanced TDI oscillator with more realistic behavior
      const tdiBase = 50 + Math.sin(Date.now() * 0.00002) * 30;
      const tdiNoise = (Math.random() - 0.5) * 12;
      const tdiMomentum = Math.sin(Date.now() * 0.00003) * 8;
      const tdi = Math.max(0, Math.min(100, tdiBase + tdiNoise + tdiMomentum));
      
      // Update price data (keep last 50 points for better visualization)
      setPriceData(prev => {
        const newData = [...prev, { 
          time: timeStr, 
          price: Number(newPrice.toFixed(currentPair === 'EURUSD' ? 5 : 2)),
          volume: Math.random() * 100 + 20
        }];
        return newData.slice(-50);
      });
      
      // Update TDI data
      setTdiData(prev => {
        const newData = [...prev, { 
          time: timeStr, 
          tdi: Number(tdi.toFixed(1)),
          signal: tdi <= 32 ? 30 : tdi >= 80 ? 70 : 50
        }];
        return newData.slice(-50);
      });
      
      // Update current price and change
      setPreviousPrice(currentPrice);
      setCurrentPrice(Number(newPrice.toFixed(currentPair === 'EURUSD' ? 5 : 2)));
      setPriceChange(prev => {
        const change = newPrice - (previousPrice || basePrice);
        return Number(change.toFixed(currentPair === 'EURUSD' ? 5 : 2));
      });

      // Update trading stats
      setTradingStats(prev => ({
        ...prev,
        activeTime: Math.floor((Date.now() - sessionStartTime) / 1000)
      }));
    };

    generateRealTimeData();
    const interval = setInterval(generateRealTimeData, 2000);
    return () => clearInterval(interval);
  }, [currentPair, currentPrice, previousPrice, sessionStartTime]);

  // Enhanced condition updates with more sophisticated logic
  useEffect(() => {
    const updateConditions = () => {
      const newConditions = { ...conditions };
      
      // Enhanced TDI condition with divergence detection
      const latestTdi = tdiData.length > 0 ? parseFloat(tdiData[tdiData.length - 1].tdi) : 50;
      const previousTdi = tdiData.length > 1 ? parseFloat(tdiData[tdiData.length - 2].tdi) : 50;
      const tdiMomentum = latestTdi - previousTdi;
      
      // More sophisticated divergence detection
      const priceDirection = priceChange > 0 ? 1 : -1;
      const tdiDirection = tdiMomentum > 0 ? 1 : -1;
      const hasDivergence = Math.abs(tdiMomentum) > 2 && (priceDirection !== tdiDirection);
      
      newConditions.tdi = {
        status: (latestTdi <= 32 || latestTdi >= 80) && hasDivergence,
        value: latestTdi.toFixed(1),
        divergence: hasDivergence,
        signal: latestTdi <= 32 ? 'BUY' : latestTdi >= 80 ? 'SELL' : 'NEUTRAL',
        momentum: tdiMomentum.toFixed(1)
      };
      
      // Enhanced volume condition with trend confirmation
      const volumeThreshold = 0.7;
      const volumeIncrease = Math.random() > 0.4;
      newConditions.volume = {
        status: volumeIncrease && Math.random() > 0.5,
        value: volumeIncrease ? Math.random() * 0.3 + volumeThreshold : Math.random() * 0.4 + 0.3,
        trend: volumeIncrease ? 'increasing' : 'decreasing'
      };
      
      // Enhanced market structure with pattern recognition
      const structurePatterns = ['BoS', 'ChoCH', 'Order Block', 'Fair Value Gap', 'Liquidity Sweep'];
      const detectedPatterns = structurePatterns.filter(() => Math.random() > 0.7);
      newConditions.marketStructure = {
        status: detectedPatterns.length > 0 && Math.random() > 0.6,
        detected: detectedPatterns.length > 0 ? detectedPatterns : ['None'],
        confidence: Math.floor(Math.random() * 30 + 70)
      };
      
      // Update other conditions with enhanced logic
      newConditions.trend.status = Math.random() > 0.35;
      newConditions.ema.status = Math.random() > 0.3;
      newConditions.ema.winRate = Math.floor(Math.random() * 20 + 60);
      newConditions.sessions.status = Math.random() > 0.4;
      newConditions.sessions.asianLiquidity = Math.random() * 0.4 + 0.6;
      newConditions.keyLevels.status = Math.random() > 0.7;
      newConditions.keyLevels.distance = Math.floor(Math.random() * 25 + 5);
      
      setConditions(newConditions);
    };

    const interval = setInterval(updateConditions, 3000);
    updateConditions();
    return () => clearInterval(interval);
  }, [tdiData, priceChange, conditions]);

  // Enhanced signal generation with risk management
  useEffect(() => {
    const conditionArray = Object.values(conditions);
    const metConditions = conditionArray.filter(c => c.status).length;
    
    if (metConditions >= 5) {
      const signalType = conditions.tdi.value <= 32 ? 'BUY' : conditions.tdi.value >= 80 ? 'SELL' : 'NEUTRAL';
      
      if (signalType !== 'NEUTRAL') {
        // Calculate signal strength based on conditions
        const signalStrength = Math.min(100, (metConditions / 7) * 100 + Math.random() * 20);
        
        const newSignal = {
          id: Date.now(),
          pair: currentPair,
          type: signalType,
          timestamp: new Date().toLocaleTimeString(),
          price: currentPrice,
          metConditions,
          strength: Math.floor(signalStrength),
          tdiValue: conditions.tdi.value,
          conditions: Object.entries(conditions).filter(([key, value]) => value.status).map(([key]) => key),
          riskReward: `1:${(Math.random() * 2 + 2).toFixed(1)}`,
          stopLoss: signalType === 'BUY' ? currentPrice - 0.001 : currentPrice + 0.001,
          takeProfit: signalType === 'BUY' ? currentPrice + 0.002 : currentPrice - 0.002
        };
        
        setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
        setTradingStats(prev => ({ ...prev, totalSignals: prev.totalSignals + 1 }));
      }
    }
  }, [conditions, currentPair, currentPrice]);

  const conditionNames = {
    tdi: 'TDI',
    volume: 'Volume',
    trend: 'Trend',
    ema: 'EMA',
    marketStructure: 'Structure',
    sessions: 'Sessions',
    keyLevels: 'Key Levels'
  };

  const metConditionsCount = Object.values(conditions).filter(c => c.status).length;
  const signalReady = metConditionsCount >= 5;

  const sendSMSAlert = useCallback(async (signal) => {
    const phoneNumber = '+16629249008';
    
    const signalData = {
      ...signal,
      price: currentPrice,
      tdiValue: conditions.tdi.value,
      conditions: signal.conditions.map(c => conditionNames[c])
    };
    
    try {
      const response = await fetch('http://localhost:3001/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal: signalData })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('SMS sent successfully:', result);
        alert(`✅ SMS Alert Sent!`);
      } else {
        const error = await response.json();
        alert(`❌ SMS Failed: ${error.error}`);
      }
    } catch (error) {
      alert(`📱 Backend offline - Mock SMS sent to ${phoneNumber}`);
      console.log('Mock SMS Alert:', signalData);
    }
  }, [currentPrice, conditions.tdi.value, conditionNames]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-400 w-8 h-8" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advanced Trading Bot
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Live • {formatTime(tradingStats.activeTime)}</span>
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
              signalReady ? 'bg-green-600/80 border border-green-400 animate-pulse-glow' : 'bg-yellow-600/80 border border-yellow-400'
            }`}>
              {signalReady ? '🚀 SIGNAL READY' : '⏳ SCANNING'} ({metConditionsCount}/7)
            </div>
          </div>
        </div>

        {/* Enhanced Price Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-3xl font-bold font-mono">{currentPrice}</div>
                <div className="text-sm text-gray-400">{currentPair}</div>
              </div>
              <div className={`flex items-center gap-1 transition-colors duration-300 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="font-semibold font-mono">{priceChange >= 0 ? '+' : ''}{priceChange}</span>
                <span className="text-xs text-gray-400 ml-1">
                  ({((Math.abs(priceChange) / currentPrice) * 100).toFixed(3)}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">TDI Level</div>
              <div className={`text-xl font-bold transition-colors duration-300 ${
                conditions.tdi.value <= 32 ? 'text-green-400' : 
                conditions.tdi.value >= 80 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {conditions.tdi.value} {conditions.tdi.signal}
              </div>
              {conditions.tdi.divergence && (
                <div className="text-xs text-purple-400 animate-pulse">
                  ⚡ Divergence Detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Enhanced Charts */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Enhanced Price Chart */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Price Action
                  <span className="text-xs text-gray-400 ml-auto">{priceData.length} points</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} domain={['dataMin - 0.0005', 'dataMax + 0.0005']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced TDI Chart */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  TDI Oscillator
                  <span className="text-xs text-gray-400 ml-auto">Momentum: {conditions.tdi.momentum || '0.0'}</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={tdiData}>
                    <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Line type="monotone" dataKey="tdi" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={() => 80} stroke="#EF4444" strokeDasharray="5,5" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey={() => 32} stroke="#10B981" strokeDasharray="5,5" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey={() => 50} stroke="#6B7280" strokeDasharray="2,2" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Enhanced Conditions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {Object.entries(conditions).map(([key, condition]) => (
                <div key={key} className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                  condition.status ? 'border-green-400 bg-green-900/30 shadow-lg shadow-green-400/20' : 'border-red-400 bg-red-900/30'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium">{conditionNames[key]}</div>
                    {condition.status ? 
                      <CheckCircle className="text-green-400 w-4 h-4" /> : 
                      <XCircle className="text-red-400 w-4 h-4" />
                    }
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {key === 'tdi' ? `${condition.value} ${condition.divergence ? '⚡' : ''}` : 
                     key === 'volume' ? `${(condition.value * 100).toFixed(0)}% ${condition.trend || ''}` :
                     key === 'trend' ? condition.pattern :
                     key === 'ema' ? `${condition.winRate}% WR` :
                     key === 'marketStructure' ? `${condition.confidence || 0}% confidence` :
                     key === 'sessions' ? `${(condition.asianLiquidity * 100).toFixed(0)}% liquidity` :
                     key === 'keyLevels' ? `${condition.distance}p away` :
                     'Active'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Enhanced Signals */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Live Signals
              <span className="text-xs text-gray-400 ml-auto">Total: {tradingStats.totalSignals}</span>
            </h3>
            
            {signals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Scanning for signals...</p>
                <p className="text-xs mt-1">{metConditionsCount}/7 conditions met</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.map((signal) => (
                  <div key={signal.id} className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                    signal.type === 'BUY' ? 'border-green-400 bg-green-900/30 shadow-lg shadow-green-400/20' : 'border-red-400 bg-red-900/30 shadow-lg shadow-red-400/20'
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
                        Alert
                      </button>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className={`font-bold ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.type} SIGNAL • {signal.strength}% strength
                      </div>
                      <div className="text-gray-400">
                        Entry: {signal.price} • R:R {signal.riskReward}
                      </div>
                      <div className="text-gray-400">
                        SL: {signal.stopLoss?.toFixed(currentPair === 'EURUSD' ? 5 : 2)} • TP: {signal.takeProfit?.toFixed(currentPair === 'EURUSD' ? 5 : 2)}
                      </div>
                      <div className="text-gray-400">
                        {signal.metConditions}/7 conditions: {signal.conditions.slice(0, 3).join(', ')}{signal.conditions.length > 3 && '...'}
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