import { ThemedText, ThemedTextProps } from "@/components/Themed";

export function MonoText(props: ThemedTextProps) {
  return (
    <ThemedText {...props} style={[props.style, { fontFamily: "SpaceMono" }]} />
  );
}
