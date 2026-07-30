import React from "react";
import { StyleSheet, Text as RNText, TextInput } from "react-native";
import type { TextInputProps } from "react-native";
import { formColors } from "./colors";
import type { FormTextProps } from "./types";

export function Text({
  bold,
  style,
  hint: _hint,
  hintBoolean: _hintBoolean,
  systemImage: _systemImage,
  imageClassName: _imageClassName,
  ...props
}: FormTextProps) {
  return (
    <RNText
      dynamicTypeRamp="body"
      {...props}
      style={[styles.text, bold && styles.bold, style]}
    />
  );
}

if (__DEV__) Text.displayName = "FormText";

export function TextField({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={formColors.placeholder}
      {...props}
      style={[styles.textField, style]}
    />
  );
}

if (__DEV__) TextField.displayName = "FormTextField";

const styles = StyleSheet.create({
  text: {
    flexShrink: 0,
    color: formColors.text,
    fontFamily: "Sf-regular",
    fontSize: 17,
    lineHeight: 22,
  },
  bold: {
    fontFamily: "Sf-semibold",
  },
  textField: {
    color: formColors.text,
    fontFamily: "Sf-regular",
    fontSize: 17,
    lineHeight: 22,
  },
});
