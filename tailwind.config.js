/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      fontFamily: {
        'mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      colors: {
        'trading': {
          'green': '#10B981',
          'red': '#EF4444',
          'blue': '#3B82F6',
          'yellow': '#F59E0B',
          'purple': '#8B5CF6',
        }
      }
    },
  },
  plugins: [],
}