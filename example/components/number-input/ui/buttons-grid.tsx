import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";
import { InputButton } from "./input-button";

const items = [
  { label: 1 },
  { label: 2 },
  { label: 3 },
  { label: 4 },
  { label: 5 },
  { label: 6 },
  { label: 7 },
  { label: 8 },
  { label: 9 },
  { label: "." },
  { label: 0 },
  { label: "backspace" },
] as const;

type ButtonsGridProps = {
  readonly input: string;
  readonly onUpdate: (value: string) => void;
  readonly onBackspace?: (value: string) => void;
  readonly onReset?: () => void;
  readonly onMaxReached?: () => void;
};

export const ButtonsGrid = React.memo(function ButtonsGrid({
  input,
  onReset,
  onUpdate,
  onBackspace,
  onMaxReached,
}: ButtonsGridProps) {
  const theme = useDemoTheme();

  return (
    <View style={styles.container}>
      {items.map(({ label }) => {
        return (
          <InputButton
            key={label}
            style={styles.input}
            onLongPress={() => {
              if (label === "backspace") {
                onReset?.();
              }
            }}
            onPress={() => {
              if (typeof label === "number") {
                const nextValue =
                  input === "0" ? String(label) : `${input}${label}`;
                if (nextValue.replace(/\D/g, "").length > 11) {
                  onMaxReached?.();
                  return;
                }
                onUpdate(nextValue);
                return;
              }

              if (label === ".") {
                if (!input.includes(".")) {
                  onUpdate(`${input}.`);
                }
                return;
              }

              if (label === "backspace") {
                onBackspace?.(input.length === 1 ? "0" : input.slice(0, -1));
              }
            }}
          >
            {typeof label === "number" ? (
              <Text
                className="font-sf-bold text-center text-[30px]"
                style={{ color: theme.primary }}
              >
                {label}
              </Text>
            ) : label === "." ? (
              <Text
                className="font-sf-bold text-center text-[30px]"
                style={{ color: theme.primary }}
              >
                .
              </Text>
            ) : (
              <SymbolView
                name="chevron.backward"
                size={24}
                tintColor={theme.primary}
              />
            )}
          </InputButton>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  input: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    width: "30%",
  },
});
