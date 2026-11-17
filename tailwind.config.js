/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        shine: {
          blue: '#063b7a',
          'blue-dark': '#032653',
          'blue-bright': '#145ef3',
          'blue-pale': '#e8f0ff',
          yellow: '#ffd028',
          'yellow-hover': '#f5c316',
          'yellow-pale': '#fff7cc',
          ink: '#101828',
          muted: '#5d6878',
          line: '#d9e1ec',
          cloud: '#f4f7fb',
          cream: '#fdfbf7',
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'shine-sm': '2px 2px 0 #032653',
        'shine-md': '4px 4px 0 #032653',
        'shine-lg': '6px 6px 0 #032653',
        'shine-xl': '8px 8px 0 #032653',
        'shine-yellow-sm': '2px 2px 0 #ffd028',
        'shine-yellow-md': '4px 4px 0 #ffd028',
        'shine-yellow-lg': '6px 6px 0 #ffd028',
        'shine-yellow-xl': '8px 8px 0 #ffd028',
        'shine-card': '0 18px 48px rgba(3, 38, 83, 0.08)',
        'shine-float': '0 20px 40px rgba(3, 38, 83, 0.15)',
      }
    },
  },
  plugins: [],
}
