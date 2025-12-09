// Tailwind class utilities for light/dark mode consistency
// Use these classes throughout the app for consistent theming

export const themeClasses = {
  // Background colors
  bg: {
    // primary app background: light first, dark via `dark:` prefix
    primary: 'bg-white dark:bg-chat-bg',
    sidebar: 'bg-white dark:bg-chat-sidebar',
    input: 'bg-white/60 dark:bg-chat-input',
    hover: 'hover:bg-gray-100 dark:hover:bg-chat-hover hover:bg-light-hover',
    card: 'bg-white dark:bg-chat-input',
  },
  
  // Text colors
  text: {
    // Default: light mode first, dark mode via `dark:` prefix
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-white/70',
    muted: 'text-gray-600 dark:text-white/60',
    placeholder: 'placeholder-gray-400 dark:placeholder-white/40',
  },
  
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-white/10',
    focus: 'focus:border-purple-500/50',
  },
  
  // Modal/Overlay
  modal: {
    backdrop: 'bg-black/60 backdrop-blur-sm',
    container: 'bg-white dark:bg-chat-sidebar border-gray-200 dark:border-white/10',
  },
  
  // Button variants
  button: {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    secondary: 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20',
    ghost: 'hover:bg-gray-100 dark:hover:bg-white/10',
  },
};
