import * as React from "react";
import Svg, { Path, Ellipse, SvgProps } from "react-native-svg";
import Animated from "react-native-reanimated";
import { ColorValue } from "react-native";

type StrippedSvgProps = Omit<SvgProps, "width" | "height">;

/** Makes it so that either height or width can be set, but not both at the same time */
type ExclusiveDimensionsSvgProps = StrippedSvgProps &
  ({ width: number; height?: never } | { height: number; width?: never });

type PlateIconProps = ExclusiveDimensionsSvgProps & {
  innerColor?: ColorValue;
  outerColor?: ColorValue;
};

const baseWidth = 37;
const baseHeight = 65;
function PlateIcon({
  innerColor,
  outerColor,
  height,
  width,
  ...props
}: PlateIconProps) {
  return (
    <Svg
      viewBox="0 0 37 65"
      height={height ?? (width as number) * (baseHeight / baseWidth)}
      width={width ?? (height as number) * (baseWidth / baseHeight)}
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={1.5}
      {...props}
    >
      <Path
        d="M21.931.3c8.084 0 14.648 14.339 14.648 32 0 17.662-6.564 32.001-14.648 32.001-8.085 0-14.648-14.339-14.648-32.001 0-17.661 6.563-32 14.648-32zm-6.983 64.001C6.863 64.301.3 49.962.3 32.3.3 14.639 6.863.3 14.948.3h6.983c-1.203 0-2.373.318-3.492.916C12.038 4.641 7.283 17.267 7.283 32.3c0 15.034 4.755 27.659 11.156 31.084 1.119.599 2.289.917 3.492.917h-6.983z"
        fill={outerColor ?? "#2f2f2f"}
        stroke="#000"
        strokeWidth="1px"
      />
      <Ellipse
        cx={21.931}
        cy={32.3}
        rx={1.625}
        ry={3.55}
        fill={innerColor ?? "#454545"}
        stroke="#000"
        strokeWidth="1px"
      />
    </Svg>
  );
}

export default PlateIcon;
