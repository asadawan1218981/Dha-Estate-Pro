/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C8102E", // Crimson Red
          light: "#E32636",
          dark: "#8B0000",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          light: "#2B2B2B",
          dark: "#0F0F0F",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F3E5AB",
          dark: "#AA7C11",
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Montserrat", "Inter", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        luxury: "0 10px 30px -15px rgba(200, 16, 46, 0.15)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        glassRed: "0 8px 32px 0 rgba(200, 16, 46, 0.08)",
      }
    },
  },
  plugins: [],
}
