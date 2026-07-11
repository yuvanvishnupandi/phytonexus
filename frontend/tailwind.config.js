export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        surface: "var(--color-surface)",
        panel: "var(--color-panel)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        clay: "var(--color-clay)",
        moss: "var(--color-moss)",
        sage: "var(--color-sage)",
        mist: "var(--color-mist)",
        line: "var(--color-line)"
      },
      boxShadow: {
        soft: "0 18px 70px rgba(0, 0, 0, 0.32)"
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
