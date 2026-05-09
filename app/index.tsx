import React, { useCallback, useState } from "react";
import { Text, TextInput, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { MorphingText } from "@/morphing-text";
import { PressableScale } from "@/shared/ui/pressable-scale";

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

type SettingRowProps = {
  readonly label: string;
  readonly rowHeight: number;
  readonly labelFontSize: number;
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
};

const SettingRow = React.memo(function SettingRow({
  label,
  rowHeight,
  labelFontSize,
  children,
  onPress,
}: SettingRowProps) {
  const content = (
    <View
      style={{
        minHeight: rowHeight,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: rowHeight * 0.33,
      }}
    >
      <Text
        style={{
          color: "#989898",
          fontFamily: "Sf-regular",
          fontSize: labelFontSize,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );

  if (onPress) {
    return <PressableScale onPress={onPress}>{content}</PressableScale>;
  }

  return content;
});

export default function Index() {
  const { height, width } = useWindowDimensions();
  const [previewWord, setPreviewWord] = useState("Craft");
  const [textValue, setTextValue] = useState("Creative");
  const [returnWord, setReturnWord] = useState("Craft");
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [fontWeightIndex, setFontWeightIndex] = useState(1);

  const fontSize = fontSizes[fontSizeIndex];
  const fontWeight = fontWeights[fontWeightIndex];
  const horizontalInset = Math.max(12, width * 0.027);
  const rowHeight = Math.max(48, Math.min(58, height * 0.085));
  const labelFontSize = Math.max(17, Math.min(20, width * 0.044));
  const valueFontSize = Math.max(17, Math.min(20, width * 0.044));
  const panelPaddingX = Math.max(22, width * 0.062);
  const panelRadius = Math.max(28, Math.min(36, width * 0.075));
  const buttonHeight = Math.max(52, Math.min(58, height * 0.086));
  const buttonGap = Math.max(16, width * 0.044);

  const morph = useCallback(() => {
    const targetWord = textValue.trim() || " ";

    if (previewWord === targetWord) {
      setPreviewWord(returnWord);
      return;
    }

    setReturnWord(previewWord);
    setPreviewWord(targetWord);
  }, [previewWord, returnWord, textValue]);

  const reverse = useCallback(() => {
    const targetWord = textValue.trim() || " ";

    if (previewWord === targetWord && returnWord !== previewWord) {
      setPreviewWord(returnWord);
      setTextValue(previewWord);
      setReturnWord(previewWord);
      return;
    }

    setPreviewWord(targetWord);
    setTextValue(previewWord);
    setReturnWord(targetWord);
  }, [previewWord, returnWord, textValue]);

  const cycleFontSize = useCallback(() => {
    setFontSizeIndex((index) => (index + 1) % fontSizes.length);
  }, []);

  const cycleFontWeight = useCallback(() => {
    setFontWeightIndex((index) => (index + 1) % fontWeights.length);
  }, []);

  return (
    <KeyboardAwareScrollView
      bottomOffset={height * 0.04}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
      }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: horizontalInset,
        paddingTop: Math.max(height * 0.18, fontSize * 2.2),
        paddingBottom: Math.max(height * 0.03, buttonHeight * 0.35),
      }}
    >
      <View
        style={{
          width: "100%",
          minHeight: fontSize * 1.7,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MorphingText
          text={previewWord}
          animationPreset="default"
          fontSize={fontSize}
          clipToBounds={false}
          containerStyle={{
            alignSelf: "center",
          }}
          style={{
            color: "#000000",
            fontFamily: fontWeight.fontFamily,
            fontSize,
            textAlign: "center",
          }}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View>
        <View
          style={{
            width: "100%",
            alignSelf: "center",
            backgroundColor: "#f8f8f8",
            borderRadius: panelRadius,
            paddingHorizontal: panelPaddingX,
            paddingVertical: rowHeight * 0.14,
          }}
        >
          <SettingRow
            label="Text"
            rowHeight={rowHeight}
            labelFontSize={labelFontSize}
          >
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setTextValue}
              placeholder="Text"
              placeholderTextColor="#c2c2c2"
              returnKeyType="done"
              selectionColor="#1f54ff"
              value={textValue}
              style={{
                flex: 1,
                color: "#000000",
                fontFamily: "Sf-regular",
                fontSize: valueFontSize,
                paddingVertical: 0,
                textAlign: "right",
              }}
            />
          </SettingRow>

          <View
            style={{
              height: 1,
              backgroundColor: "#dddddd",
            }}
          />

          <SettingRow
            label="Font Size"
            rowHeight={rowHeight}
            labelFontSize={labelFontSize}
            onPress={cycleFontSize}
          >
            <Text
              style={{
                color: "#007aff",
                fontFamily: "Sf-regular",
                fontSize: valueFontSize,
              }}
            >
              {fontSize}pt
            </Text>
          </SettingRow>

          <View
            style={{
              height: 1,
              backgroundColor: "#dddddd",
            }}
          />

          <SettingRow
            label="Font Weight"
            rowHeight={rowHeight}
            labelFontSize={labelFontSize}
            onPress={cycleFontWeight}
          >
            <Text
              style={{
                color: "#007aff",
                fontFamily: "Sf-regular",
                fontSize: valueFontSize,
              }}
            >
              {fontWeight.label}
            </Text>
          </SettingRow>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            gap: buttonGap,
            marginTop: buttonHeight * 0.32,
          }}
        >
          <PressableScale
            onPress={reverse}
            style={{
              flex: 1,
              height: buttonHeight,
              borderRadius: buttonHeight / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Text
              style={{
                color: "#252525",
                fontFamily: "Sf-bold",
                fontSize: Math.max(20, buttonHeight * 0.38),
              }}
            >
              Reverse
            </Text>
          </PressableScale>

          <PressableScale
            onPress={morph}
            style={{
              flex: 1,
              height: buttonHeight,
              borderRadius: buttonHeight / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000000",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Sf-bold",
                fontSize: Math.max(20, buttonHeight * 0.38),
              }}
            >
              Morph
            </Text>
          </PressableScale>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
