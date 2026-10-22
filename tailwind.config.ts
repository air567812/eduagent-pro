import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#36a6f7",
          500: "#0c8ce9",
          600: "#026fc7",
          700: "#0358a1",
          800: "#074b85",
          900: "#0c3f6e",
          950: "#082849",
        },
        cosmic: {
          950: "#080B16",
          900: "#0D1127",
          850: "#121735",
          800: "#1A2148",
          700: "#252E63",
          600: "#374288"
        },
        slate: {
          850: "#152033",
          950: "#070d18"
        }
      },
      boxShadow: {
        'glow-ai': '0 0 25px rgba(168,85,247,0.45)',
        'glow-cyan': '0 0 25px rgba(6,182,212,0.45)',
        'glow-pink': '0 0 25px rgba(236,72,153,0.45)',
        'glow-amber': '0 0 25px rgba(245,158,11,0.45)',
        'glow-gold': '0 0 30px rgba(251,191,36,0.55)',
        'glass-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)'
      },
      keyframes: {
        'laser-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        'shimmer-sweep': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      animation: {
        'laser-scan': 'laser-scan 2.5s ease-in-out infinite',
        'shimmer-sweep': 'shimmer-sweep 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite'
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
