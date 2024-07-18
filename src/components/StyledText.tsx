import { ThemedText, TextProps } from "@/components/Themed";

export function MonoText(props: TextProps) {
  return (
    <ThemedText {...props} style={[props.style, { fontFamily: "SpaceMono" }]} />
  );
}
