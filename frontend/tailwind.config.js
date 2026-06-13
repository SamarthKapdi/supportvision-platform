/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        secondary: {
          500: '#8b5cf6',
        },
        background: {
          DEFAULT: '#0f172a',
          800: '#1e293b',
          900: '#0f172a',
        },
        surface: {
          DEFAULT: 'rgba(30, 41, 59, 0.5)', // slate-800/50
        },
        text: {
          DEFAULT: '#ffffff',
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
        },
        success: '#10b981', // emerald-500
        warning: '#f59e0b', // amber-500
        error: '#f43f5e', // rose-500
        accent: '#22d3ee', // cyan-400
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
