const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { signal } = req.body;
    
    // Validate signal data
    if (!signal || !signal.type || !signal.pair) {
      return res.status(400).json({ 
        error: 'Invalid signal data', 
        required: ['type', 'pair'] 
      });
    }

    // Mock SMS sending logic
    // In a real implementation, you would integrate with Twilio, AWS SNS, or another SMS service
    const smsData = {
      to: '+16629249008', // Phone number from frontend
      message: formatSignalMessage(signal),
      timestamp: new Date().toISOString(),
      signalId: signal.id
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log the SMS (in production, this would be sent via SMS service)
    console.log('📱 SMS Alert Sent:');
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
    uptime: process.uptime()
  });
});

// Signal history endpoint (optional)
app.get('/api/signals', (req, res) => {
  // This could return recent signals from a database
  res.json({
    signals: [],
    message: 'Signal history endpoint - implement as needed'
  });
});

// Helper function to format signal message
function formatSignalMessage(signal) {
  const emoji = signal.type === 'BUY' ? '🟢' : '🔴';
  const conditions = signal.conditions ? signal.conditions.slice(0, 3).join(', ') : 'N/A';
  
  return `${emoji} TRADING SIGNAL
${signal.type} ${signal.pair}
Price: ${signal.price}
Strength: ${signal.strength}%
Conditions: ${conditions}
SL: ${signal.stopLoss}
TP: ${signal.takeProfit}
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trading Bot Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 SMS endpoint: http://localhost:${PORT}/api/send-sms`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});