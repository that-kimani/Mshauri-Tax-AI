/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#06090F',
        shadow: '#0A0F1A',
        surface: {
          DEFAULT: '#0F172A',
          elevated: '#141F36',
        },
        accent: {
          DEFAULT: '#E2E8F0',
          hover: '#F8FAFC',
        },
        warn: '#F59E0B',
        danger: '#F87171',
        ink: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
          disabled: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        shell: '24px',
        panel: '18px',
        card: '16px',
        control: '10px',
      },
      maxWidth: {
        conversation: '768px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'mshauri-rise': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'mshauri-pulse-dot': {
          '0%, 60%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-2px)' },
        },
        'mshauri-drawer-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'mshauri-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        rise: 'mshauri-rise 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-dot': 'mshauri-pulse-dot 1.3s ease-in-out infinite',
        'drawer-in': 'mshauri-drawer-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'mshauri-fade-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
}
