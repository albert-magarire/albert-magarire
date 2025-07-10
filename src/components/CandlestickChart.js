import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const CandlestickChart = ({ data, height = 250, title, tdi, timeframe }) => {
  // Custom candlestick renderer
  const CandlestickBar = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const { open, high, low, close } = payload;
    const isGreen = close > open;
    const color = isGreen ? '#10B981' : '#EF4444';
    const bodyColor = isGreen ? '#10B981' : '#EF4444';
    const wickColor = '#6B7280';

    // Calculate dimensions
    const bodyHeight = Math.abs(close - open) * height / (payload.high - payload.low);
    const bodyY = y + (Math.max(high, close) - Math.max(open, close)) * height / (payload.high - payload.low);
    const wickX = x + width / 2;
    const bodyX = x + width * 0.2;
    const bodyWidth = width * 0.6;

    return (
      <g>
        {/* Upper wick */}
        <line
          x1={wickX}
          y1={y}
          x2={wickX}
          y2={bodyY}
          stroke={wickColor}
          strokeWidth={1}
        />
        {/* Lower wick */}
        <line
          x1={wickX}
          y1={bodyY + bodyHeight}
          x2={wickX}
          y2={y + height}
          stroke={wickColor}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={bodyX}
          y={bodyY}
          width={bodyWidth}
          height={Math.max(bodyHeight, 1)}
          fill={bodyColor}
          stroke={bodyColor}
          strokeWidth={1}
        />
      </g>
    );
  };

  // Custom shape component for Recharts
  const Candlestick = (props) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;

    return payload.map((entry, index) => {
      const { open, high, low, close, timestamp } = entry.payload;
      if (!open || !high || !low || !close) return null;

      const isGreen = close > open;
      const color = isGreen ? '#10B981' : '#EF4444';

      return (
        <g key={index}>
          {/* This is a simplified representation - in a real implementation, 
              you'd calculate exact pixel positions */}
          <rect
            x={entry.x - 3}
            y={Math.min(entry.y, entry.y - (close - open) * 10)}
            width={6}
            height={Math.abs((close - open) * 10)}
            fill={color}
            stroke={color}
          />
        </g>
      );
    });
  };

  // Format data for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Prepare chart data
  const chartData = data.map(candle => ({
    ...candle,
    time: formatTime(candle.timestamp),
    // For simplified line representation until we implement full candlesticks
    price: candle.close,
    // Calculate body color for tooltip
    bodyColor: candle.close > candle.open ? '#10B981' : '#EF4444'
  }));

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-blue-400">📊</span>
          {title}
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-400">{timeframe.toUpperCase()}</div>
          <div className={`text-sm font-bold ${
            tdi <= 32 ? 'text-green-400' : 
            tdi >= 80 ? 'text-red-400' : 'text-yellow-400'
          }`}>
            TDI: {tdi?.toFixed(1) || '—'}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id={`candleGradient${timeframe}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF" 
            tick={{ fontSize: 10 }} 
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9CA3AF" 
            tick={{ fontSize: 10 }}
            domain={['dataMin - 0.0002', 'dataMax + 0.0002']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151', 
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value, name) => {
              if (name === 'open') return [value?.toFixed(5), 'Open'];
              if (name === 'high') return [value?.toFixed(5), 'High'];
              if (name === 'low') return [value?.toFixed(5), 'Low'];
              if (name === 'close') return [value?.toFixed(5), 'Close'];
              if (name === 'volume') return [value?.toLocaleString(), 'Volume'];
              return [value, name];
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const isGreen = data.close > data.open;
                
                return (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                    <p className="text-gray-300 text-sm mb-2">{label}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Open:</span>
                        <span className="text-white font-mono">{data.open?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">High:</span>
                        <span className="text-green-400 font-mono">{data.high?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Low:</span>
                        <span className="text-red-400 font-mono">{data.low?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Close:</span>
                        <span className={`font-mono ${isGreen ? 'text-green-400' : 'text-red-400'}`}>
                          {data.close?.toFixed(5)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Volume:</span>
                        <span className="text-blue-400 font-mono">{data.volume?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Simplified candlestick representation using bars */}
          {chartData.map((candle, index) => {
            if (!candle.open || !candle.high || !candle.low || !candle.close) return null;
            
            const isGreen = candle.close > candle.open;
            const color = isGreen ? '#10B981' : '#EF4444';
            const x = (index / (chartData.length - 1)) * 100; // Percentage
            
            return (
              <g key={index}>
                {/* This is a visual approximation - real implementation would need proper scaling */}
                <rect
                  x={`${x}%`}
                  y="20%"
                  width="2%"
                  height="60%"
                  fill={color}
                  fillOpacity={0.8}
                />
              </g>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Candle summary */}
      {chartData.length > 0 && (
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <span>{chartData.length} candles</span>
          <span>Last: {chartData[chartData.length - 1]?.close?.toFixed(5)}</span>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;