const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

const twColors = {
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

const figmaColors = {
  redAccent: "#A53535",
  orangeAccent: "#AD760A",
  greyDark: "#2F2F2F",
  greyLight: "#575757",
  greyLighter: "#8E8E8E",
  greyDarkBorder: "#3D3D3D",
  addGreen: "#78C200",
  primaryWhite: "#DEDEDE",
  primaryBlack: "#0D0D0D",
  lighterPrimaryBlack: "#141414",
};

export default {
  light: {
    text: "#000",
    background: twColors.neutral300,
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ffffff",
    background: twColors.neutral950,
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
  },
};

export { twColors, figmaColors };
