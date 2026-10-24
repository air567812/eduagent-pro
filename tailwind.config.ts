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
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb", // Royal Sapphire
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        indigo: {
          600: "#4f46e5",
          700: "#4338ca",
        },
        teal: {
          600: "#0d9488",
        },
        obsidian: {
          950: "#090D16", // Deep Obsidian Slate
          900: "#0c111d",
          800: "#111827", // Elevated Navy-Slate
        },
        slate: {
          850: "#152033",
          950: "#070d18"
        }
      },
      boxShadow: {
        'enterprise-card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'enterprise-hover': '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
        'enterprise-dark': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'brand-focus': '0 0 0 3px rgba(37, 99, 235, 0.25)',
        'glass-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)'
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
