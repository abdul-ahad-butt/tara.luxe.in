/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0A09',
        espresso: '#161311',
        gold: {
          light: '#F5E6BE',
          DEFAULT: '#D4AF37',
          brushed: '#C5A059',
          dark: '#997328'
        },
        ivory: {
          DEFAULT: '#FBF8F3',
          warm: '#F7F1E3',
          dark: '#E8DEC8'
        },
        emerald: {
          stock: '#10B981'
        },
        ruby: {
          stock: '#EF4444'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
