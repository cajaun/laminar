import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, View, ViewProps } from "react-native";
import { Swipeable } from 'react-native-gesture-handler';

import { SymbolView } from "expo-symbols";

type SLIDE_TO_LEFT_TYPE = {
  onRightPress: () => void;
} & ViewProps;

const SlideToLeft = ({ onRightPress, ...props }: SLIDE_TO_LEFT_TYPE) => {
  const swipeableRowRef = useRef<any>(null);

  const close = () => {
    swipeableRowRef.current?.close();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-150, 0],
      outputRange: [0, 75],
      extrapolate: "clamp",
    });
  

  
    return (
      <View style={styles.actionsContainer}>
    
        < Pressable onPress={() => { console.log("Edit"); close(); }}>
          <Animated.View style={[styles.rightWrapper, { transform: [{ translateX: trans }] }]}>
            <Animated.View style={[styles.iconWrapper, { backgroundColor: '#5E5BE6' }]}>
          
            <SymbolView name = "bell.slash.fill" tintColor={"white"}/>
         
            </Animated.View>
          </Animated.View>
        </Pressable>
  
        {/* Delete Button */}
        <Pressable onPress={() => { onRightPress(); close(); }}>
          <Animated.View style={[styles.rightWrapper, { transform: [{ translateX: trans }] }]}>
            <Animated.View style={[styles.iconWrapper, { backgroundColor: '#F5453A'}]}>
            
            <SymbolView name = "trash.fill" tintColor={"white"}/>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    );
  };
  

  return (
    <Swipeable ref={swipeableRowRef} renderRightActions={renderRightActions}>
      <View {...props} />
    </Swipeable>
  );
};

export default SlideToLeft;

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 10,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  rightWrapper: {
    width: 75,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
