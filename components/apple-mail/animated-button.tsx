import { SFSymbol, SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

interface AnimatedButtonProps {
  active: boolean;
  label: string;
  color: string;
  onPress: () => void;
  defaultIcon: SFSymbol;
  activeIcon: SFSymbol;
}


const MIN_WIDTH = 50
const MAX_WIDTH = Dimensions.get("screen").width * 0.49;

const INNER_BOX_PADDING_LEFT = 16;
const Icon_SIZE = 18;
const TEXT_PADDING = 6;
const TEXT_TRANSLATE_X = 12;

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ active, onPress, label, defaultIcon, activeIcon, color }) => {
  const [textWidth, setTextWidth] = useState(0)

  const width = useSharedValue(active ? MAX_WIDTH : MIN_WIDTH);
  const padding = useSharedValue(0);
  const defaultIconOpacity = useSharedValue(active ? 0 : 1);
  const activeIconOpacity = useSharedValue(active ? 1 : 0);
  const boxPadding = useSharedValue(active ? ((MAX_WIDTH - (textWidth + Icon_SIZE + TEXT_PADDING)) / 2) - INNER_BOX_PADDING_LEFT : 0);

  useEffect(() => {
    if (textWidth) {
      width.value = withTiming(active ? MAX_WIDTH : MIN_WIDTH, { duration: 300 });
      padding.value = withTiming(active ? -TEXT_TRANSLATE_X : 0, { duration: 300 });
      defaultIconOpacity.value = withTiming(active ? 0 : 1, { duration: 300 });
      activeIconOpacity.value = withTiming(active ? 1 : 0, { duration: 300 });
      // we calculate the padding from left to make the Icon and text stay in the center after animation
      boxPadding.value = withTiming(active ? ((MAX_WIDTH - (textWidth + Icon_SIZE + TEXT_PADDING)) / 2) - INNER_BOX_PADDING_LEFT : 0)
    }
  }, [active, textWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: interpolateColor(width.value, [MIN_WIDTH, MAX_WIDTH], ['#E9E9E9', color]),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: padding.value }],
  }));
  const animatedBoxStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: boxPadding.value }],
  }));

  const animatedDefaultIconStyle = useAnimatedStyle(() => ({
    opacity: defaultIconOpacity.value,
  }));

  const animatedActiveIconStyle = useAnimatedStyle(() => ({
    opacity: activeIconOpacity.value,
  }));

  return (
    <Pressable onPressIn={onPress}>
      <Animated.View style={[styles.animatedBox, animatedStyle]}>
        <Animated.View style={[styles.innerBox, animatedBoxStyle]}>
          <View style={styles.iconContainer}>
          <Animated.View style={[styles.iconWrapper, animatedDefaultIconStyle]}>
              <SymbolView name={defaultIcon} type="palette" size={Icon_SIZE} tintColor="#A3A6AC" />
            </Animated.View>
            <Animated.View style={[styles.iconWrapper, animatedActiveIconStyle]}>
              <SymbolView name={activeIcon} type="palette" size={Icon_SIZE}   tintColor="white"/>
            </Animated.View>
          </View>
          <Animated.Text
            numberOfLines={1}
            style={[styles.text, animatedTextStyle]}
            onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  animatedBox: {
    height: 44,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    paddingLeft: INNER_BOX_PADDING_LEFT,
  },
  iconContainer: {
    width: Icon_SIZE,
    height: Icon_SIZE,
  },
  iconWrapper: {
    width: Icon_SIZE,
    height: Icon_SIZE,
    position: 'absolute',
  },
  text: {
    flex: 1,
    overflow: 'hidden',
    position: 'absolute',
    color: 'white',
    fontWeight: '500',
    left: INNER_BOX_PADDING_LEFT + Icon_SIZE + TEXT_PADDING + TEXT_TRANSLATE_X,
  },
});

export default AnimatedButton;