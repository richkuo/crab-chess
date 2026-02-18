import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'crab-red': '#FF6B6B',
        'crab-orange': '#FF8C42',
        'ocean-blue': '#1E3A8A',
        'sand': '#F4E5D3',
      },
    },
  },
  plugins: [],
};

export default config;
