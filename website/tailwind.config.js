/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        surface: "#0F172A",
        card: "#131C31",
        "card-hover": "#17233D",
        border: "#1E293B",
        "border-glow": "#334155",
        accent: {
          sky: "#38BDF8",
          indigo: "#6366F1",
          gold: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
          purple: "#8B5CF6",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.08) 35%, transparent 70%)',
        'card-glow': 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
      },
      boxShadow: {
        'glow-sky': '0 0 25px -5px rgba(56, 189, 248, 0.4)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-sm': '0 0 15px -3px rgba(56, 189, 248, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
