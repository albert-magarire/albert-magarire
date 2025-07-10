#!/bin/bash

# Real Market Data Setup Script
# This script helps you quickly integrate real market data into your trading dashboard

echo "🔄 Real Market Data Integration Setup"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📊 Available Market Data Providers:"
echo "1. Alpha Vantage (Free - 25 requests/day, easiest setup)"
echo "2. Finnhub (Free - 60 requests/minute, better real-time)"
echo "3. IEX Cloud (Free - 50,000 requests/month)"
echo ""

read -p "Choose provider (1-3): " provider_choice

case $provider_choice in
    1)
        PROVIDER="alpha_vantage"
        echo "✅ Alpha Vantage selected"
        echo ""
        echo "📝 Please get your free API key from: https://www.alphavantage.co/support/#api-key"
        ;;
    2)
        PROVIDER="finnhub"
        echo "✅ Finnhub selected"
        echo ""
        echo "📝 Please get your free API key from: https://finnhub.io/register"
        ;;
    3)
        PROVIDER="iex_cloud"
        echo "✅ IEX Cloud selected"
        echo ""
        echo "📝 Please get your free API key from: https://iexcloud.io/pricing"
        ;;
    *)
        echo "❌ Invalid choice. Using Alpha Vantage as default."
        PROVIDER="alpha_vantage"
        ;;
esac

echo ""
read -p "Enter your API key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ API key cannot be empty"
    exit 1
fi

echo ""
echo "🔧 Setting up real market data integration..."

# Install required dependencies
echo "📦 Installing dependencies..."
cd backend
npm install dotenv node-fetch
cd ..

# Create .env file
echo "📝 Creating environment file..."
cat > backend/.env << 'END_ENV'
# Market Data Configuration
DATA_PROVIDER=alpha_vantage
ALPHA_VANTAGE_API_KEY=replace_with_your_key
FINNHUB_API_KEY=replace_with_your_key
IEX_CLOUD_API_KEY=replace_with_your_key

# Trading Configuration
PHONE_NUMBER=+1(662)924-9008
END_ENV

# Replace the API key in the file
sed -i "s/replace_with_your_key/$api_key/g" backend/.env
sed -i "s/DATA_PROVIDER=alpha_vantage/DATA_PROVIDER=$PROVIDER/g" backend/.env

echo "✅ Environment file created: backend/.env"

# Create backup of original server.js
echo "💾 Creating backup of original server.js..."
cp backend/server.js backend/server.js.backup

echo ""
echo "🎯 Next Steps:"
echo "1. ✅ Dependencies installed"
echo "2. ✅ Environment file created"
echo "3. ✅ Original server.js backed up"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "You need to replace the fetchRealMarketData function in backend/server.js"
echo "with the code from REAL_DATA_INTEGRATION.md"
echo ""
echo "📖 See the integration guide: REAL_DATA_INTEGRATION.md"
echo ""
echo "🚀 After updating the code, restart your backend:"
echo "   cd backend && npm start"
echo ""
echo "🧪 Test your integration with:"
echo "   http://localhost:3001/api/test-real-data/EURUSD"
echo ""
echo "✨ Your trading dashboard will now use REAL market data!"