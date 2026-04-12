/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#06060d',
          surface: '#0e0e1a',
          card: '#141425',
          neon: '#6366f1',
          cyan: '#22d3ee',
          accent: '#a855f7',
          fire: '#f97316',
          gold: '#fbbf24',
          text: '#e8e8ed',
          muted: '#6b7280',
          success: '#10b981',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
