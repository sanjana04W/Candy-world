/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        candy: {
          purple: {
            light: "#A78BFA",
            DEFAULT: "#8B5CF6",
            dark: "#6D28D9",
          },
          pink: {
            light: "#FDA4AF",
            DEFAULT: "#F43F5E",
            dark: "#E11D48",
          },
          yellow: {
            light: "#FEF08A",
            DEFAULT: "#FACC15",
            dark: "#EAB308",
          },
        },
        cosmetics: {
          gold: {
            light: "#E5D5C5",
            DEFAULT: "#C5A880",
            dark: "#A3805B",
          },
          cream: "#FAF6F0",
          dark: "#2C2520",
        },
      },
      animation: {
        'fade-out-up': 'fadeOutUp 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeOutUp: {
          '0%': { opacity: '1', transform: 'translate(-50%, -50%) scale(0.5)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -200%) scale(1.2)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
