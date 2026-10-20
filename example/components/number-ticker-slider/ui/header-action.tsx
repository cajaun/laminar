import React from "react";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";
import { getClockIconColor } from "./theme";

export const NumberTickerSliderHeaderAction = React.memo(
  function NumberTickerSliderHeaderAction() {
    const theme = useDemoTheme();

    return (
      <PressableScale
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView
          name="clock"
          tintColor={getClockIconColor(theme.isDark)}
          weight="medium"
          size={30}
        />
      </PressableScale>
    );
  },
);
