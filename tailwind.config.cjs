/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1"
        },
        prayer: {
          bomdod: { light: "#8b5cf6", dark: "#a78bfa" },
          peshin: { light: "#3b82f6", dark: "#60a5fa" },
          asr: { light: "#10b981", dark: "#34d399" },
          shom: { light: "#f59e0b", dark: "#fbbf24" },
          xufton: { light: "#6366f1", dark: "#818cf8" },
          vitr: { light: "#ec4899", dark: "#f472b6" }
        }
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
