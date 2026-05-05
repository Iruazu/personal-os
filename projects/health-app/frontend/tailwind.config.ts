import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          base:   '#121212',
          card:   '#1a1a1a',
          input:  '#1e1e1e',
          border: '#2a2a2a',
        },
        accent: {
          sage:       '#8FAF8F',
          terracotta: '#C4785A',
          dustyBlue:  '#6B8CAE',
          sand:       '#C9B99A',
          lavender:   '#9B8EC4',
        },
      },
    },
  },
  plugins: [],
};

export default config;
