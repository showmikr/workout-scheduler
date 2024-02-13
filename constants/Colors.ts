const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

const twNeutralColors = {
  neutral50: "rgb(250 250 250)",
  neutral100: "rgb(245 245 245)",
  neutral200: "rgb(229 229 229)",
  neutral300: "rgb(212 212 212)",
  neutral400: "rgb(163 163 163)",
  neutral500: "rgb(115 115 115)",
  neutral600: "rgb(82 82 82)",
  neutral700: "rgb(64 64 64)",
  neutral800: "rgb(38 38 38)",
  neutral900: "rgb(23 23 23)",
  neutral950: "rgb(10 10 10)",
};

export default {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};

export { twNeutralColors };
