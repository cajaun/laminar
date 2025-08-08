import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";

export const ProfileImageBase: FC = () => {
  return (
    <Image
      placeholder={{ blurhash: "LIJu4L-;F|IU00W=tlRj?^t6rX%2" }}
      style={StyleSheet.absoluteFill}
    />
  );
};
