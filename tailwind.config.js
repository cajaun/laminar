/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./packages/laminar/src/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sf: {
          text: "#111111",
          "text-2": "#6e6e73",
          "text-3": "#8e8e93",
          "grouped-bg": "#f2f2f7",
          "grouped-bg-2": "#ffffff",
          bg: "#ffffff",
          "bg-2": "#f7f7f7",
          fill: "rgba(120, 120, 128, 0.12)",
          "fill-2": "rgba(120, 120, 128, 0.16)",
          border: "rgba(60, 60, 67, 0.18)",
          link: "#007aff",
          green: "#34c759",
          gray: "#8e8e93",
        },
      },
      fontFamily: {
        "sf-black": ["Sf-black", "sans-serif"],
        "sf-bold": ["Sf-bold", "sans-serif"],
        "sf-semibold": ["Sf-semibold", "sans-serif"],
        "sf-medium": ["Sf-medium", "sans-serif"],
        "sf-regular": ["Sf-regular", "sans-serif"],
        "sf-light": ["Sf-light", "sans-serif"],
        "sf-thin": ["Sf-thin", "sans-serif"],
      },
    },
  },
  plugins: [],
};
