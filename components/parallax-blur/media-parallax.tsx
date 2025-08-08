import React, { forwardRef } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import Animated, { AnimatedProps, AnimatedRef } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";
import { BlurView } from "expo-blur";
import { PressableScale } from "../ui/utils/pressable-scale";
import { SymbolView } from "expo-symbols";
import { useToast } from "../toast/hooks/use-toast";
import { Octicons } from "@expo/vector-icons";

type MediaParallaxBlurProps = AnimatedProps<{
  onLayout?: (event: LayoutChangeEvent) => void;
  triggerRef?: AnimatedRef<React.Component<{}, {}, any>>
}>;

const MediaParallaxBlur = forwardRef<Animated.View, MediaParallaxBlurProps>(
  ({ onLayout, triggerRef }, ref) => {
    const { colors, locations } = easeGradient({
      colorStops: {
        0: { color: "transparent" },
        0.5: { color: "rgba(0,0,0,0.99)" },
        1: { color: "black" },
      },
    }) as {
      colors: [string, string, ...string[]];
      locations: [number, number, ...number[]];
    };

    const genres = [
      { id: 10751, name: "Family" },
      { id: 14, name: "Fantasy" },
    ];

    const { showToast } = useToast();

    const handlePress = () => {
      showToast({
        title: 'Hello from Toast!',
        iconName: 'rocket', 
        trailing: (
          <Octicons name="x" size={16} color="#fff" style={{ marginLeft: 10 }} />
        ),
      });
    };


    return (
      <Animated.View
        ref={ref}
        style={[
          {
            position: "absolute",
            top: 535 - 300,
            left: 0,
            right: 0,
            zIndex: 0,
            height: 300,
          },
        ]}
        onLayout={onLayout}
      >
        <View style={[{ position: "absolute", bottom: 0, zIndex: 2 }, { width: "100%", height: "100%" }]}>
          <MaskedView
            maskElement={
              <LinearGradient
                locations={locations}
                colors={colors}
                style={StyleSheet.absoluteFill}
              />
            }
            style={StyleSheet.absoluteFill}
          >
            <BlurView
              intensity={90}
              tint={"systemChromeMaterialDark"}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
          <View className="flex-1 justify-end px-4 gap-y-4 mb-4">
            <Animated.View  ref={ref as React.LegacyRef<Animated.View>} onLayout={onLayout}>
              <Text className="text-xl font-bold text-white mx-auto">Snow White</Text>
            </Animated.View>
            <PressableScale
              className="h-[50px] bg-white flex-row gap-x-[6px] justify-center items-center w-[85%] rounded-xl mx-auto"
              onPress={handlePress}
            >
              <SymbolView name="play.fill" tintColor="black" size={18} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Play
              </Text>
            </PressableScale>
            <Text numberOfLines={3} className="text-white">
              Following the benevolent King's disappearance, the Evil Queen dominated the once fair land...
            </Text>
            <Text numberOfLines={3} className="text-white/60">
              {genres.map((g) => g.name).join(" • ")}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }
);

export default MediaParallaxBlur;
