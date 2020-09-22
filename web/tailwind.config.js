module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
  },
  purge: ["pages/**/*.[jt]sx", "components/**/*.[jt]sx", "utils/**/*.[jt]sx"],
  theme: {
    extend: {
      container: {
        padding: "2rem",
      },
    },
  },
  variants: {
    opacity: ["responsive", "hover", "focus", "disabled"],
    cursor: ["responsive", "disabled"],
  },
  plugins: [],
};
