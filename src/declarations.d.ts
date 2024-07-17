/**
 * This is specific to the react-native-svg-transformer library.
 * Thi is used to make SVG Component imports properly recognized
 * by the typescript LSP as a valid module.
 */
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
