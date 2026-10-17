import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import type { ViewProps } from "react-native";

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
  const backgroundColor =
    useColorScheme() === "dark" ? "#3A3D44" : "#D1D1D6";

  return (
    <View
      {...props}
      style={[styles.separator, { backgroundColor }, props.style]}
    />
  );
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
    height: StyleSheet.hairlineWidth,
  },
});
