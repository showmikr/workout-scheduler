import fs from "fs";
import Color from "colorjs.io";

type ColorData = Record<string, Array<{ shadeNumber: string; color: Color }>>;

const INPUT_FILE = "color-pallete.json";
const OUTPUT_FILE = "colors.codegen.ts";

function colorsCodegen({
  colorData,
  outputObjectName,
  commentString,
}: {
  colorData: ColorData;
  outputObjectName: string;
  commentString?: string;
}) {
  const colorCount = Object.keys(colorData).length;
  const objectDeclaration = `export const ${outputObjectName} = {\n`;
  const commentOutput = commentString ? `// ${commentString}\n` : "";
  let output = commentOutput + objectDeclaration;
  // Process each color
  Object.entries(colorData).forEach(([parentColor, shades], colorIndex) => {
    output += `  // ${parentColor}\n`;
    // Process each shade
    shades.forEach(({ shadeNumber, color }) => {
      const hexColor = color.to("srgb").toString({ format: "hex" });
      output += `  ${parentColor}${shadeNumber}: "${hexColor}",\n`;
    });
    if (colorIndex < colorCount - 1) output += "\n";
  });
  output += `} as const;\n\n`;
  return output;
}

function writeBaseShades(colorMap: ColorData) {
  const commentString = "base colors";
  const outputObjectName = "atmos";
  const output = colorsCodegen({
    colorData: colorMap,
    outputObjectName,
    commentString,
  });
  fs.appendFileSync(OUTPUT_FILE, output);
}

function blendOklchWithWhite(color: Color, opacity = 0.7) {
  const result = color.clone().set({
    "oklch.l": (l) => l * opacity + (1 - opacity),
    "oklch.c": (c) => c * opacity,
  });
  return result;
}

function blendOklchWithBlack(color: Color, opacity = 0.7) {
  const result = color.clone().set({
    "oklch.l": (l) => l * opacity,
    "oklch.c": (l) => l * opacity,
  });
  return result;
}

function pressedStateColors(
  colorData: ColorData,
  whitenThreshold: number = 0.7
): ColorData {
  const transformedShades = Object.fromEntries(
    Object.entries(colorData).map(([parentColor, shades]) => [
      parentColor,
      shades.map(({ shadeNumber, color }) => {
        return {
          shadeNumber,
          color:
            color.oklch.l <= whitenThreshold ?
              blendOklchWithWhite(color)
            : blendOklchWithBlack(color),
        };
      }),
    ])
  );
  return transformedShades;
}

function writePressedShades(colorMap: ColorData) {
  // Start building our output
  const outputObjectName = "atmosPressed";
  const commentString =
    "represents pressed state shade of colors (bright colors darkened, dark colors brightened)";
  const output = colorsCodegen({
    colorData: colorMap,
    outputObjectName,
    commentString,
  });
  fs.appendFileSync(OUTPUT_FILE, output);
}

function main() {
  const colorJSON: Record<string, Record<string, string>> = JSON.parse(
    fs.readFileSync(INPUT_FILE, "utf8")
  );

  const colorData = Object.fromEntries(
    Object.entries(colorJSON).map(([parentColor, shadesObj]) => [
      parentColor,
      Object.entries(shadesObj).map(([shadeNumber, colorString]) => ({
        shadeNumber,
        color: new Color(colorString),
      })),
    ])
  );

  let startingLines = `// Generated on ${new Date().toISOString()}\n// Do not edit directly\n\n`;
  fs.writeFileSync(OUTPUT_FILE, startingLines);

  writeBaseShades(colorData);
  // writePressedShades(pressedStateColors(colorData, 0.7));
  console.log("colors finished generating");
}

// Script Entry Point
main();
