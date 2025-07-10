import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Zap } from 'lucide-react';

const TDIChart = ({ data, height = 180, timeframe, tdiValue }) => {
  // Calculate TDI data from candle data
  const calculateTDIData = (candles) => {
    if (!candles || candles.length < 14) return [];
    
    const tdiData = [];
    for (let i = 13; i < candles.length; i++) {
      const period = 14;
      const slice = candles.slice(i - period + 1, i + 1);
      
      // Simple RSI-based TDI calculation
      const gains = [];
      const losses = [];
      
      for (let j = 1; j < slice.length; j++) {
        const change = slice[j].close - slice[j - 1].close;
        if (change > 0) {
          gains.push(change);
          losses.push(0);
        } else {
          gains.push(0);
          losses.push(Math.abs(change));
        }
      }
      
      const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
      
      let tdi = 50;
      if (avgLoss !== 0) {
        const rs = avgGain / avgLoss;
        tdi = 100 - (100 / (1 + rs));
      }
      
      tdiData.push({
        timestamp: candles[i].timestamp,
        time: new Date(candles[i].timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        tdi: Number(tdi.toFixed(1)),
        // Add signal lines
        overbought: 80,
        oversold: 32,
        midline: 50
      });
    }
    
    return tdiData;
  };

  const tdiData = calculateTDIData(data);
  const currentTDI = tdiValue || (tdiData.length > 0 ? tdiData[tdiData.length - 1].tdi : 50);
  
  // Determine signal state
  const getSignalState = (tdi) => {
    if (tdi <= 32) return { color: 'text-green-400', state: 'BUY', bg: 'bg-green-900/30' };
    if (tdi >= 80) return { color: 'text-red-400', state: 'SELL', bg: 'bg-red-900/30' };
    return { color: 'text-yellow-400', state: 'NEUTRAL', bg: 'bg-gray-800/30' };
  };

  const signalState = getSignalState(currentTDI);

  // Check for divergence (simplified)
  const checkDivergence = () => {
    if (tdiData.length < 10 || !data || data.length < 10) return false;
    
    const recentTDI = tdiData.slice(-5);
    const recentPrice = data.slice(-5);
    
    // Simple divergence check: TDI going up while price going down (bullish divergence)
    const tdiTrend = recentTDI[recentTDI.length - 1].tdi - recentTDI[0].tdi;
    const priceTrend = recentPrice[recentPrice.length - 1].close - recentPrice[0].close;
    
    return (tdiTrend > 0 && priceTrend < 0) || (tdiTrend < 0 && priceTrend > 0);
  };

  const hasDivergence = checkDivergence();

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 ${signalState.bg}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          TDI - {timeframe.toUpperCase()}
        </h4>
        <div className="text-right">
          <div className={`text-lg font-bold ${signalState.color}`}>
            {currentTDI.toFixed(1)}
          </div>
          <div className={`text-xs ${signalState.color}`}>
            {signalState.state}
          </div>
          {hasDivergence && (
            <div className="text-xs text-purple-400 animate-pulse">
              ⚡ Divergence
            </div>
          )}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={tdiData}>
          <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF" 
            tick={{ fontSize: 9 }} 
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#9CA3AF" 
            tick={{ fontSize: 9 }}
            width={35}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value, name) => [
              value.toFixed(1), 
              name === 'tdi' ? 'TDI' : name
            ]}
          />
          
          {/* Reference lines */}
          <ReferenceLine 
            y={80} 
            stroke="#EF4444" 
            strokeDasharray="5,5" 
            strokeWidth={1}
          />
          <ReferenceLine 
            y={32} 
            stroke="#10B981" 
            strokeDasharray="5,5" 
            strokeWidth={1}
          />
          <ReferenceLine 
            y={50} 
            stroke="#6B7280" 
            strokeDasharray="2,2" 
            strokeWidth={1}
          />
          
          {/* TDI line */}
          <Line 
            type="monotone" 
            dataKey="tdi" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, fill: '#3B82F6' }}
          />
          
          {/* Signal area fill */}
          <defs>
            <linearGradient id={`tdiGradient${timeframe}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
      
      {/* TDI Summary */}
      <div className="flex justify-between items-center mt-2 text-xs">
        <span className="text-gray-400">
          {tdiData.length} periods
        </span>
        <div className="flex items-center gap-3 text-gray-400">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded"></div>
            Sell 80+
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded"></div>
            Neutral
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded"></div>
            Buy 32-
          </span>
        </div>
      </div>
    </div>
  );
};

export default TDIChart;