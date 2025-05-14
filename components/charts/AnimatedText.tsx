import { StyleSheet, TextProps } from "react-native";
import React, { useMemo } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

interface CharacterObject {
  id: string;
  char: string;
}

const springConfig = {
  damping: 16,
  mass: 0.8,
  stiffness: 180,
};

const AnimatedText = (props: TextProps) => {
  const { children, ...rest } = props;

  const splitText: CharacterObject[] = useMemo(() => {
    if (typeof children !== "string" && typeof children !== "number") {
      return [];
    }

    let commaCount = 0;
    return children
      .toString()
      .split("")
      .map((char, index) => ({
        id: char === "," ? `comma-${++commaCount}` : `${index}`,
        char,
      }));
  }, [children]);

  return (
    <Animated.View
      layout={LinearTransition.springify()
        .damping(springConfig.damping)
        .mass(springConfig.mass)
        .stiffness(springConfig.stiffness)}
      style={styles.container}
    >
      {splitText.map(({ char, id }, index) => (
        <Animated.View
          entering={FadeIn.duration(100)}
          exiting={FadeOut.duration(100)}
          key={id}
          layout={LinearTransition.springify()
            .damping(springConfig.damping)
            .mass(springConfig.mass)
            .stiffness(springConfig.stiffness)}
        >
          <Animated.Text {...rest} style={rest.style}>
            {char}
          </Animated.Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default React.memo(AnimatedText);
