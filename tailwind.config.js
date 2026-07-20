/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./index.html",
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Dark Mode - inspirada em FC26 / FM
        'dark-bg': '#0a0c10',
        'dark-card': '#121620',
        'dark-border': '#1e2638',
        'dark-hover': '#1a2236',
        // Cores de acento neon
        'neon-green': '#00ff87',
        'neon-cyan': '#00e5ff',
        'gold-fc': '#e2b142',
        'accent-blue': '#3b82f6',
        // Cores de status
        'success': '#22c55e',
        'danger': '#ef4444',
        'warning': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 135, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.3)',
        'gold': '0 0 20px rgba(226, 177, 66, 0.3)',
      },
    },
  },
  plugins: [],
};
