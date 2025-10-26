/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Facebook Blue Theme Colors
        'facebook-blue': {
          50: 'oklch(0.95 0.05 220)',
          100: 'oklch(0.90 0.10 220)',
          200: 'oklch(0.80 0.15 220)',
          300: 'oklch(0.70 0.18 220)',
          400: 'oklch(0.60 0.20 220)',
          500: 'oklch(0.55 0.22 220)', // Main Facebook blue
          600: 'oklch(0.50 0.20 220)',
          700: 'oklch(0.45 0.18 220)',
          800: 'oklch(0.35 0.15 220)',
          900: 'oklch(0.25 0.12 220)',
        },
        'warm-yellow': {
          50: 'oklch(0.95 0.05 60)',
          100: 'oklch(0.90 0.08 60)',
          200: 'oklch(0.85 0.10 60)',
          300: 'oklch(0.80 0.12 60)',
          400: 'oklch(0.75 0.14 60)',
          500: 'oklch(0.70 0.15 60)', // Main yellow
          600: 'oklch(0.65 0.13 60)',
          700: 'oklch(0.55 0.12 60)',
          800: 'oklch(0.45 0.10 60)',
          900: 'oklch(0.35 0.08 60)',
        },
        'warm-red': {
          50: 'oklch(0.95 0.05 25)',
          100: 'oklch(0.90 0.10 25)',
          200: 'oklch(0.80 0.15 25)',
          300: 'oklch(0.70 0.18 25)',
          400: 'oklch(0.65 0.20 25)',
          500: 'oklch(0.60 0.22 25)', // Main red
          600: 'oklch(0.55 0.20 25)',
          700: 'oklch(0.50 0.18 25)',
          800: 'oklch(0.40 0.15 25)',
          900: 'oklch(0.30 0.12 25)',
        },
        'warm-white': {
          50: 'oklch(0.998 0.001 60)',
          100: 'oklch(0.995 0.002 60)',
          200: 'oklch(0.992 0.003 60)',
          300: 'oklch(0.988 0.004 60)',
          400: 'oklch(0.985 0.005 60)',
          500: 'oklch(0.98 0.006 60)',
          600: 'oklch(0.975 0.007 60)',
          700: 'oklch(0.97 0.008 60)',
          800: 'oklch(0.965 0.009 60)',
          900: 'oklch(0.96 0.010 60)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
