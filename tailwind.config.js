/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          black: '#000814',
          navy: '#001233',
          blue: '#0353A4',
          purple: '#7209B7',
          pink: '#F72585',
          orange: '#FF7B00',
          yellow: '#FFD60A',
        },
        star: {
          white: '#FFFFFF',
          blue: '#CAF0F8',
          red: '#D00000',
        },
        'space-navy': '#0a1128',
        'space-blue': '#0466c8',
        'space-purple': '#6638f0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space)', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'stars': 'url("/images/stars-bg.png")',
        'nebula': 'url("/images/nebula-bg.png")',
      }
    },
  },
  plugins: [],
} 