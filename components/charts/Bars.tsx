import {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  LinearTransition,
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Animated from "react-native-reanimated";
import { getBarRadius } from "./utils/getBarRadius";
import { renderXLabel } from "./utils/renderXLabel";
import { MAX_HEIGHT } from "./utils/Chart";
import { useTheme } from "@react-navigation/native";
import { Period } from "./types/ChartTypes";

interface BarsProps {
  item: { value: number; label: string };
  index: number;
  barWidth: number;
  selectedPeriod: Period;
  maxValue: number;
  currentBarIndex: SharedValue<number | null>;
}

export const Bars = ({
  item,
  index,
  barWidth,
  selectedPeriod,
  maxValue,
  currentBarIndex,
}: BarsProps) => {
  const theme = useTheme();


  const primaryWithOpacity = `rgba(0,122,255,0.7)`;

  const animatedBarOpacity = useAnimatedStyle(() => {
    return {
      backgroundColor:
        currentBarIndex.value === index
          ? primaryWithOpacity
          : theme.colors.primary,
      transform: [
        {
          translateY: withSpring(currentBarIndex.value === index ? -5 : 0, {
            stiffness: 250,
            damping: 10,
          }),
        },
      ],
    };
  }, [currentBarIndex, index]);

  return (
    <Animated.View
      entering={
        index % 2 === 0
          ? FadeInRight.springify().damping(25).mass(1).stiffness(200)
          : FadeInLeft.springify().damping(25).mass(1).stiffness(200)
      }
      exiting={
        index % 2 === 0
          ? FadeOutLeft.springify().damping(25).mass(1).stiffness(200)
          : FadeOutRight.springify().damping(25).mass(1).stiffness(200)
      }
      layout={LinearTransition.springify().damping(25).mass(1).stiffness(200)}
      style={[styles.barWrapper, { width: barWidth }]}
    >
      <Animated.View
        layout={LinearTransition.springify().damping(25).mass(1).stiffness(200)}
        style={styles.barContainer}
      >
        <Animated.View
          layout={LinearTransition.springify()
            .damping(25)
            .mass(1)
            .stiffness(200)}
          style={[
            animatedBarOpacity,
            {
              height: (item.value / maxValue) * MAX_HEIGHT,
              width: barWidth,
              borderRadius: getBarRadius(selectedPeriod, barWidth),
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </Animated.View>
      <View style={styles.xAxisLabelWrapper}>
        <Text style={[styles.xAxisLabel, { color: theme.colors.text }]}>
          {renderXLabel(item.label, index, selectedPeriod)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  barWrapper: {
    
    alignItems: "center",
  },
  barContainer: {

    height: MAX_HEIGHT,
    justifyContent: "flex-end",
  },
  xAxisLabel: {
    marginTop: 5,
    fontSize: 12,
  },
  xAxisLabelWrapper: {
    position: "absolute",
    bottom: -20,
    width: 100,
    alignItems: "center",
  },
});
