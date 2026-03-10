// HMR Trigger for Tailwind Config
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-dark': 'rgb(var(--primary-dark) / <alpha-value>)',
        'bg-light': 'rgb(var(--bg-main) / <alpha-value>)',
        'bg-dark': 'rgb(var(--bg-main) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(99, 102, 241, 0.4)',
        'premium-hover': '0 20px 40px -10px rgba(0,0,0,0.15), 0 0 20px rgba(99, 102, 241, 0.1)',
        'premium-dark': '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
        'glass-gradient-dark': 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.4) 100%)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}
