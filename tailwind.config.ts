import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#111118',
        'surface-2': '#1A1A24',
        border: '#1E1E2E',
        accent: '#00FF88',
        'accent-2': '#00D9FF',
        'accent-3': '#9D4EDD',
        danger: '#FF3B3B',
        warning: '#FFD700',
      },
      fontFamily: {
        display: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
        code: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        shake: 'shake 0.4s ease-in-out',
        glitch: 'glitch-1 3s infinite linear',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
