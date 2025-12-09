// Tailwind class utilities for light/dark mode consistency
// Use these classes throughout the app for consistent theming

export const themeClasses = {
  // Background colors
  bg: {
    primary: 'bg-chat-bg dark:bg-chat-bg bg-light-bg',
    sidebar: 'bg-chat-sidebar dark:bg-chat-sidebar bg-light-sidebar',
    input: 'bg-chat-input dark:bg-chat-input bg-light-input',
    hover: 'hover:bg-chat-hover dark:hover:bg-chat-hover hover:bg-light-hover',
    card: 'bg-chat-input dark:bg-chat-input bg-white',
  },
  
  // Text colors
  text: {
    primary: 'text-white dark:text-white text-gray-900',
    secondary: 'text-white/70 dark:text-white/70 text-gray-700',
    muted: 'text-white/60 dark:text-white/60 text-gray-600',
    placeholder: 'placeholder-white/40 dark:placeholder-white/40 placeholder-gray-400',
  },
  
  // Border colors
  border: {
    primary: 'border-white/10 dark:border-white/10 border-light-border',
    focus: 'focus:border-purple-500/50',
  },
  
  // Modal/Overlay
  modal: {
    backdrop: 'bg-black/70 backdrop-blur-sm',
    container: 'bg-chat-sidebar dark:bg-chat-sidebar bg-white border-white/10 dark:border-white/10 border-light-border',
  },
  
  // Button variants
  button: {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    secondary: 'bg-white/10 dark:bg-white/10 bg-gray-200 hover:bg-white/20 dark:hover:bg-white/20 hover:bg-gray-300',
    ghost: 'hover:bg-white/10 dark:hover:bg-white/10 hover:bg-light-hover',
  },
};
