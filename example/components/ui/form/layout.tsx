import React from "react";
import { StyleSheet, View } from "react-native";
import type { ViewProps } from "react-native";
import { formColors } from "./colors";

export function HStack(props: ViewProps) {
  return (
    <View {...props} style={[styles.hStack, props.style]}>
      {props.children}
    </View>
  );
}

export function VStack(props: ViewProps) {
  return (
    <View {...props} style={[styles.vStack, props.style]}>
      {props.children}
    </View>
  );
}

export function Spacer(props: ViewProps) {
  return <View {...props} style={[styles.spacer, props.style]} />;
}

export function Separator(props: ViewProps) {
  return <View {...props} style={[styles.separator, props.style]} />;
}

const styles = StyleSheet.create({
  hStack: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vStack: {
    flex: 1,
    flexDirection: "column",
  },
  spacer: {
    flex: 1,
  },
  separator: {
    marginTop: -0.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: formColors.separator,
  },
});
