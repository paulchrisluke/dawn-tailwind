module.exports = {
  prefix: "x",
  content: ["./**/*.{liquid,css}"],
  theme: {
    extend: {
      fontFamily: {
        heading: "var(--font-heading-family)",
      },
      screens: {
        sm: "750px",
      },
    },
  },
  plugins: [],
};
