import React, { useCallback, useMemo, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { MorphingText } from "@/morphing-text";
import { PressableScale } from "@/shared/ui/pressable-scale";

const screenStyle = {
  flex: 1,
  backgroundColor: "#ffffff",
  paddingHorizontal: 12,
};

const previewWrapStyle = {
  position: "absolute" as const,
  left: 12,
  right: 12,
};

const controlsWrapStyle = {
  position: "absolute" as const,
  left: 12,
  right: 12,
};

const panelStyle = {
  width: "100%" as const,
  maxWidth: 424,
  alignSelf: "center" as const,
  backgroundColor: "#f8f8f8",
  borderRadius: 34,
  paddingHorizontal: 28,
  paddingVertical: 8,
};

const rowStyle = {
  minHeight: 55,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  gap: 18,
};

const dividerStyle = {
  height: 1,
  backgroundColor: "#dddddd",
};

const labelStyle = {
  color: "#989898",
  fontFamily: "Sf-regular",
  fontSize: 20,
};

const valueStyle = {
  color: "#007aff",
  fontFamily: "Sf-regular",
  fontSize: 20,
};

const textValueStyle = {
  color: "#000000",
  fontFamily: "Sf-regular",
  fontSize: 20,
};

const textValueWrapStyle = {
  minWidth: 122,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "flex-end" as const,
};

const caretStyle = {
  width: 2,
  height: 30,
  marginLeft: 1,
  backgroundColor: "#1f54ff",
};

const actionRowStyle = {
  width: "100%" as const,
  maxWidth: 424,
  alignSelf: "center" as const,
  flexDirection: "row" as const,
  gap: 20,
  marginTop: 18,
};

const buttonStyle = {
  flex: 1,
  height: 56,
  borderRadius: 28,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const reverseButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#f5f5f5",
};

const morphButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#000000",
};

const buttonTextStyle = {
  fontFamily: "Sf-bold",
  fontSize: 22,
};

const fontSizes = [32, 40, 48] as const;

const fontWeights = [
  {
    label: "Regular",
    fontFamily: "Sf-regular",
  },
  {
    label: "Semibold",
    fontFamily: "Sf-semibold",
  },
  {
    label: "Bold",
    fontFamily: "Sf-bold",
  },
] as const;

const textAlignments = [
  {
    label: "Left",
    alignSelf: "flex-start" as const,
    textAlign: "left" as const,
  },
  {
    label: "Center",
    alignSelf: "center" as const,
    textAlign: "center" as const,
  },
  {
    label: "Right",
    alignSelf: "flex-end" as const,
    textAlign: "right" as const,
  },
] as const;

type SettingRowProps = {
  readonly label: string;
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
};

const SettingRow = React.memo(function SettingRow({
  label,
  children,
  onPress,
}: SettingRowProps) {
  const content = (
    <View style={rowStyle}>
      <Text style={labelStyle}>{label}</Text>
      {children}
    </View>
  );

  if (onPress) {
    return <PressableScale onPress={onPress}>{content}</PressableScale>;
  }

  return content;
});

export default function Index() {
  const { height } = useWindowDimensions();
  const [previewWord, setPreviewWord] = useState("Craft");
  const [targetWord, setTargetWord] = useState("Creative");
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [fontWeightIndex, setFontWeightIndex] = useState(1);
  const [alignmentIndex, setAlignmentIndex] = useState(1);

  const fontSize = fontSizes[fontSizeIndex];
  const fontWeight = fontWeights[fontWeightIndex];
  const textAlignment = textAlignments[alignmentIndex];

  const previewPositionStyle = useMemo(
    () => ({
      top: Math.max(108, Math.round(height * 0.22)),
    }),
    [height]
  );

  const controlsPositionStyle = useMemo(
    () => ({
      bottom: Math.max(20, Math.round(height * 0.03)),
    }),
    [height]
  );

  const swapWords = useCallback(() => {
    setPreviewWord(targetWord);
    setTargetWord(previewWord);
  }, [previewWord, targetWord]);

  const cycleFontSize = useCallback(() => {
    setFontSizeIndex((index) => (index + 1) % fontSizes.length);
  }, []);

  const cycleFontWeight = useCallback(() => {
    setFontWeightIndex((index) => (index + 1) % fontWeights.length);
  }, []);

  const cycleAlignment = useCallback(() => {
    setAlignmentIndex((index) => (index + 1) % textAlignments.length);
  }, []);

  const previewContainerStyle = useMemo(
    () => ({
      alignSelf: textAlignment.alignSelf,
    }),
    [textAlignment.alignSelf]
  );

  const previewTextStyle = useMemo(
    () => ({
      color: "#000000",
      fontFamily: fontWeight.fontFamily,
      fontSize,
      textAlign: textAlignment.textAlign,
    }),
    [fontSize, fontWeight.fontFamily, textAlignment.textAlign]
  );

  return (
    <View style={screenStyle}>
      <View style={[previewWrapStyle, previewPositionStyle]}>
        <MorphingText
          text={previewWord}
          animationPreset="default"
          fontSize={fontSize}
          clipToBounds={false}
          containerStyle={previewContainerStyle}
          style={previewTextStyle}
        />
      </View>

      <View style={[controlsWrapStyle, controlsPositionStyle]}>
        <View style={panelStyle}>
          <SettingRow label="Text">
            <View style={textValueWrapStyle}>
              <Text style={textValueStyle}>{targetWord}</Text>
              <View style={caretStyle} />
            </View>
          </SettingRow>

          <View style={dividerStyle} />

          <SettingRow label="Font Size" onPress={cycleFontSize}>
            <Text style={valueStyle}>{fontSize}pt</Text>
          </SettingRow>

          <View style={dividerStyle} />

          <SettingRow label="Font Weight" onPress={cycleFontWeight}>
            <Text style={valueStyle}>{fontWeight.label}</Text>
          </SettingRow>

          <View style={dividerStyle} />

          <SettingRow label="Text Alignment" onPress={cycleAlignment}>
            <Text style={valueStyle}>{textAlignment.label}</Text>
          </SettingRow>
        </View>

        <View style={actionRowStyle}>
          <PressableScale onPress={swapWords} style={reverseButtonStyle}>
            <Text style={[buttonTextStyle, { color: "#252525" }]}>Reverse</Text>
          </PressableScale>

          <PressableScale onPress={swapWords} style={morphButtonStyle}>
            <Text style={[buttonTextStyle, { color: "#ffffff" }]}>Morph</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
}
