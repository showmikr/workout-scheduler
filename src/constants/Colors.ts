import { Theme } from "@react-navigation/native";

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
  lighterPrimaryBlack: "#2B2B2B",
  addGreen: "#67AD0B",
  addGreenButtonFill: "#2E5200",
  addGreenButtonText: "#E3F4CD",
  primaryWhite: "#DEDEDE",
  primaryBlack: "#0D0D0D",
};

// Based on ColorBox Color Palette
const colorBox = {
  grey000: "#E6E6E6",
  grey100: "#D0CECE",
  grey200: "#BAB7B7",
  grey300: "#A4A1A0",
  grey400: "#8F8B8A",
  grey500: "#797574",
  grey600: "#63605F",
  grey700: "#4E4B4A",
  grey800: "#383635",
  grey900: "#222121",
  grey1000: "#0D0C0C",

  green000: "#EFF2E4",
  green100: "#CDDCA8",
  green200: "#A9C576",
  green300: "#88AF4E",
  green400: "#6B9831",
  green500: "#52821D",
  green600: "#3D6C10",
  green700: "#2D5508",
  green800: "#1F3F03",
  green900: "#132801",
  green950: "#081200",
} as const;

/**
 * Most of the components provided by Expo Router (Tabs, Stacks, Slots, etc)
 * are using the React Navigation Library under the hood which means that the only (convenient)
 * way to style them (change background colors based on color scheme) is to supply a set of Theme
 * objects to the React Navigation Library's ThemeProvider component. React Navigation has some default
 * themes for both dark and light color schemes. We're going to go ahead and provide our own color schemes
 * here.
 */
const customDarkTheme: Theme = {
  // Some values are sourced from the Default DarkTheme in "@react-navigation/native"
  dark: true,
  colors: {
    primary: "rgb(0, 122, 255)", // (default) for the back buttons text on the top bar
    // primary: colorBox.green400,
    background: figmaColors.primaryBlack,
    card: figmaColors.primaryBlack, // background color for tab bar
    text: figmaColors.primaryWhite,
    border: colorBox.grey800, // for the border on the tabs and headers
    notification: "rgb(255, 69, 58)", // idk yet
  },
};

/**
 * Same idea as custom dark theme. Controls the color styling for the react navigation components
 */
const customLightTheme: Theme = {
  // Some values are sourced from the DefaultTheme in "@react-navigation/native"
  dark: false,
  colors: {
    primary: "rgb(0, 122, 255)", // (default) for the back buttons text on the top bar
    // primary: colorBox.green400,
    background: figmaColors.primaryWhite,
    card: figmaColors.primaryWhite, // background color for tab bar
    text: figmaColors.primaryBlack,
    border: colorBox.grey200, // for the border on the tabs and headers
    notification: "rgb(255, 59, 48)", //idk yet
  },
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

export { twColors, figmaColors, colorBox, customDarkTheme, customLightTheme };
