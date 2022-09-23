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
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
