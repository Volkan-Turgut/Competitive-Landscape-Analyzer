/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "15%": { transform: "translateY(0)", opacity: "1" },
          "85%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        slideUp: "slideUp 2.4s ease-in-out forwards",
        glowPulse: "glowPulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
