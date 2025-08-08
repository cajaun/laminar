import React, { FC } from "react";
import { Pressable, Alert, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { SETTINGS_CONTAINER_WIDTH } from "../../../lib/providers/home-animation";

// raycast-home-search-transition-animation 🔽

export const SettingsButton: FC = () => {
  return (
    <Pressable
      onPress={() => Alert.alert("Settings")}
      className="items-center justify-center"
      style={styles.imageContainer}
    >
      <Image placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }} style={styles.image} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: SETTINGS_CONTAINER_WIDTH,
  },
  image: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "white",
  },
});

// raycast-home-search-transition-animation 🔼
