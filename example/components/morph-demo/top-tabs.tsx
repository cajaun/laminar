import React, { FC } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { type SharedValue, useSharedValue } from "react-native-reanimated";
import { useDemoTheme } from "./demo-theme";
import { TabIndicator } from "./tab-indicator";
import { TabItem } from "./tab-item";

export type TopTab = { label: string; value: number };

type Props = {
  tabs: readonly TopTab[];
  indexDecimal: SharedValue<number>;
  isPagerScrolling: SharedValue<boolean>;
  hasPagerInteraction: SharedValue<boolean>;
  onTabPress: (index: number) => void;
};

const TAB_BAR_OUTER_PADDING = 20;

export const TopTabs: FC<Props> = ({
  tabs,
  indexDecimal,
  isPagerScrolling,
  hasPagerInteraction,
  onTabPress,
}) => {
  const theme = useDemoTheme();
  const tabWidths = useSharedValue<number[]>(new Array(tabs.length).fill(0));
  const tabHeights = useSharedValue<number[]>(new Array(tabs.length).fill(0));
  const tabOffsets = useSharedValue<number[]>(new Array(tabs.length).fill(0));
  const measurementsReady = useSharedValue(false);
  const measuredTabs = React.useRef(new Set<number>());

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { width: tabWidth, height: tabHeight, x: tabX } =
      event.nativeEvent.layout;

    tabWidths.modify((value) => {
      "worklet";
      value[index] = tabWidth;
      return value;
    });
    tabHeights.modify((value) => {
      "worklet";
      value[index] = tabHeight;
      return value;
    });
    tabOffsets.modify((value) => {
      "worklet";
      value[index] = tabX;
      return value;
    });

    measuredTabs.current.add(index);
    if (measuredTabs.current.size === tabs.length) {
      measurementsReady.value = true;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: theme.catalogPanel,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.listBackground,
            { backgroundColor: theme.catalogPanel },
          ]}
        />
        <TabIndicator
          indexDecimal={indexDecimal}
          tabWidths={tabWidths}
          tabHeights={tabHeights}
          tabOffsets={tabOffsets}
          inputRange={tabs.map((_, index) => index)}
          measurementsReady={measurementsReady}
          isPagerScrolling={isPagerScrolling}
          hasPagerInteraction={hasPagerInteraction}
          backgroundColor={theme.isDark ? theme.buttonSurface : theme.surface}
          shadowColor={theme.shadow}
        />
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.value}
            index={index}
            tabName={tab.label}
            indexDecimal={indexDecimal}
            activeColor={theme.primary}
            inactiveColor={theme.secondary}
            onPress={() => onTabPress(tab.value)}
            onLayout={(event) => handleTabLayout(index, event)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: TAB_BAR_OUTER_PADDING,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    padding: 3,
    borderRadius: 24,
    borderCurve: "continuous",
  },
  listBackground: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 24,
    overflow: "hidden" as const,
  },
});
