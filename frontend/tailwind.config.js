/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode via class toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        'chat-bg': '#343541',
        'chat-sidebar': '#202123',
        'chat-input': '#40414f',
        'chat-hover': '#2a2b32',
        // Light mode colors
        'light-bg': '#f7f7f8',
        'light-sidebar': '#ffffff',
        'light-input': '#ffffff',
        'light-hover': '#f0f0f0',
        'light-border': '#e5e5e5',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

