import { twColors } from "@/constants/Colors";
import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";

const TableContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: "column" }}>{children}</View>
);

const TableCell = ({
  style,
  children,
}: {
  style?: ViewProps["style"];
  children?: ViewProps["children"];
}) => {
  return <View style={style ?? styles.tableItemWrapper}>{children}</View>;
};

const TableRow = ({
  children,
  overrideStyles = false,
  style,
}: {
  style?: ViewProps["style"];
  overrideStyles?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <View style={[!overrideStyles && styles.tableRow, style]}>{children}</View>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flex: 1,
    alignItems: "baseline",
    flexDirection: "row",
  },
  tableItemWrapper: {
    borderWidth: 1,
    borderColor: "blue",
    flex: 1,
  },
  tableInputItem: {
    fontWeight: "normal",
    flex: 1,
    alignSelf: "flex-start",
    minWidth: 3 * 14,
    backgroundColor: twColors.neutral600,
    borderRadius: 0.5 * 14,
    borderWidth: 0.2,
    borderColor: twColors.neutral600,
  },
});

export { TableRow };
