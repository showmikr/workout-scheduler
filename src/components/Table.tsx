import { ThemedText, TextProps } from "@/components/Themed";
import { twColors } from "@/constants/Colors";
import React from "react";
import { View } from "react-native";

const TableContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: "column" }}>{children}</View>
);

const TableRow = ({
  children,
  marginBottom,
}: {
  children: React.ReactNode;
  marginBottom?: number;
}) => (
  <View
    style={{
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginBottom: marginBottom ?? 0.5 * 14,
    }}
  >
    {children}
  </View>
);

export { TableRow };
