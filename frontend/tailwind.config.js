/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(222.2 47.4% 11.2%)",
        secondary: "hsl(210 40% 96.1%)",
        accent: "hsl(210 40% 96.1%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222.2 47.4% 11.2%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
