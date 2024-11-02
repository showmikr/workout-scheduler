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
  stoneGrey000: "#fafafa",
  stoneGrey100: "#e2e1e1",
  stoneGrey200: "#cac8c8",
  stoneGrey300: "#b2afaf",
  stoneGrey400: "#9a9797",
  stoneGrey500: "#827f7f",
  stoneGrey600: "#6a6867",
  stoneGrey700: "#525050",
  stoneGrey800: "#3a3938",
  stoneGrey850: "#2e2d2d",
  stoneGrey900: "#222121",
  stoneGrey950: "#161616",
  stoneGrey1000: "#0a0a0a",

  blue000: "#e1f4f7",
  blue100: "#a8d5e1",
  blue200: "#76b5cb",
  blue300: "#4f97b6",
  blue400: "#337ba0",
  blue500: "#1f638a",
  blue600: "#124e74",
  blue700: "#093c5e",
  blue800: "#042c48",
  blue900: "#021e32",
  blue950: "#011727",
  blue1000: "#01111c",

  green000: "#f4fae1",
  green100: "#d2e4a8",
  green200: "#b0ce77",
  green300: "#8fb851",
  green400: "#71a234",
  green500: "#598c20",
  green600: "#447613",
  green700: "#33600a",
  green800: "#254a05",
  green900: "#193502",
  green950: "#142a02",
  green1000: "#0e1f01",

  red000: "#f7dfdf",
  red100: "#e2a6a6",
  red200: "#ce7575",
  red300: "#b9504e",
  red400: "#a43431",
  red500: "#8f221d",
  red600: "#7a1710",
  red700: "#651008",
  red800: "#500c03",
  red900: "#3b0901",
  red950: "#310800",
  red1000: "#260600",

  orangeAccent000: "#fae7cc",
  orangeAccent100: "#e4be88",
  orangeAccent200: "#ce9a4f",
  orangeAccent300: "#b87b24",
  orangeAccent400: "#a26306",
  orangeAccent500: "#8c5500",
  orangeAccent600: "#764900",
  orangeAccent700: "#603c00",
  orangeAccent800: "#4a3000",
  orangeAccent900: "#352200",
  orangeAccent950: "#2a1b00",
  orangeAccent1000: "#1f1400",
};

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
    border: colorBox.stoneGrey800, // for the border on the tabs and headers
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
    border: colorBox.stoneGrey200, // for the border on the tabs and headers
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
