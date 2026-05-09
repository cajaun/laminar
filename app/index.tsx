import React, { useCallback, useState } from "react";
import {
  type ListRenderItem,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { MorphingText } from "@/morphing-text";
import { PressableScale } from "@/shared/ui/pressable-scale";
import {
  Carousel,
  CarouselContent,
  CarouselPagination,
  type CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";

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

const editorWords = ["Craft", "Creative"] as const;
const standaloneWords = ["Calligraph", "Craft", "Creative", "Create"] as const;
const buttonWords = ["Back Up Now", "Backing Up", "Backed Up!"] as const;
const numericValues = ["$35.99", "$24.89", "$17.38", "$3.15"] as const;

const examplePages = [
  { id: "editor", label: "Editor" },
  { id: "words", label: "Words" },
  { id: "button", label: "Button" },
  { id: "numbers", label: "Numbers" },
] as const;

const carouselItems: CarouselItem[] = examplePages.map((_, i) => i);

const stepForward = (index: number, length: number) => (index + 1) % length;
const stepBackward = (index: number, length: number) =>
  (index - 1 + length) % length;

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

type IndexInnerProps = {
  height: number;
  width: number;
};

function IndexInner({ height, width }: IndexInnerProps) {
  const { currentIndex } = useCarousel();
  const activePageIndex = currentIndex;

  const [editorWordIndex, setEditorWordIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [fontWeightIndex, setFontWeightIndex] = useState(1);
  const [standaloneWordIndex, setStandaloneWordIndex] = useState(0);
  const [buttonWordIndex, setButtonWordIndex] = useState(0);
  const [numberIndex, setNumberIndex] = useState(0);

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
  const footerPaddingBottom = Math.max(16, height * 0.026);
  const pageTopPadding = Math.max(height * 0.14, fontSize * 2);
  const previewMinHeight = Math.max(height * 0.24, fontSize * 2.1);

  const cycleFontSize = useCallback(() => {
    setFontSizeIndex((index) => stepForward(index, fontSizes.length));
  }, []);

  const cycleFontWeight = useCallback(() => {
    setFontWeightIndex((index) => stepForward(index, fontWeights.length));
  }, []);

  const morph = useCallback(() => {
    const page = examplePages[activePageIndex]?.id;

    if (page === "editor") {
      setEditorWordIndex((index) => stepForward(index, editorWords.length));
      return;
    }

    if (page === "words") {
      setStandaloneWordIndex((index) =>
        stepForward(index, standaloneWords.length)
      );
      return;
    }

    if (page === "button") {
      setButtonWordIndex((index) => stepForward(index, buttonWords.length));
      return;
    }

    setNumberIndex((index) => stepForward(index, numericValues.length));
  }, [activePageIndex]);

  const reverse = useCallback(() => {
    const page = examplePages[activePageIndex]?.id;

    if (page === "editor") {
      setEditorWordIndex((index) => stepBackward(index, editorWords.length));
      return;
    }

    if (page === "words") {
      setStandaloneWordIndex((index) =>
        stepBackward(index, standaloneWords.length)
      );
      return;
    }

    if (page === "button") {
      setButtonWordIndex((index) => stepBackward(index, buttonWords.length));
      return;
    }

    setNumberIndex((index) => stepBackward(index, numericValues.length));
  }, [activePageIndex]);

  const renderDivider = () => (
    <View
      style={{
        height: 1,
        backgroundColor: "#dddddd",
      }}
    />
  );

  const renderValueText = (value: string) => (
    <Text
      style={{
        color: "#007aff",
        fontFamily: "Sf-regular",
        fontSize: valueFontSize,
        textAlign: "right",
      }}
    >
      {value}
    </Text>
  );

  const renderPanel = (children: React.ReactNode) => (
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
      {children}
    </View>
  );

  const renderEditorPage = () => {
    const word = editorWords[editorWordIndex];

    return (
      <>
        <View
          style={{
            width: "100%",
            minHeight: previewMinHeight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MorphingText
            text={word}
            autoSize={false}
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

        {renderPanel(
          <>
            <SettingRow
              label="Word"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
              onPress={() =>
                setEditorWordIndex((index) =>
                  stepForward(index, editorWords.length)
                )
              }
            >
              {renderValueText(word)}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Font Size"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
              onPress={cycleFontSize}
            >
              {renderValueText(`${fontSize}pt`)}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Font Weight"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
              onPress={cycleFontWeight}
            >
              {renderValueText(fontWeight.label)}
            </SettingRow>
          </>
        )}
      </>
    );
  };

  const renderWordsPage = () => {
    const word = standaloneWords[standaloneWordIndex];

    return (
      <>
        <View
          style={{
            width: "100%",
            minHeight: previewMinHeight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MorphingText
            text={word}
            autoSize={false}
            animationPreset="smooth"
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

        {renderPanel(
          <>
            <SettingRow
              label="Word"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
              onPress={() =>
                setStandaloneWordIndex((index) =>
                  stepForward(index, standaloneWords.length)
                )
              }
            >
              {renderValueText(word)}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Variant"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
            >
              {renderValueText("Text")}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Auto Size"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
            >
              {renderValueText("Off")}
            </SettingRow>
          </>
        )}
      </>
    );
  };

  const renderButtonPage = () => {
    const word = buttonWords[buttonWordIndex];

    return (
      <>
        <View
          style={{
            width: "100%",
            minHeight: previewMinHeight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PressableScale
            onPress={() =>
              setButtonWordIndex((index) =>
                stepForward(index, buttonWords.length)
              )
            }
            style={{
              alignSelf: "center",
              minHeight: fontSize * 1.42,
              borderRadius: 36,
              backgroundColor: "#7ce2fe",
              paddingHorizontal: fontSize * 0.72,
              paddingVertical: fontSize * 0.22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MorphingText
              text={word}
              autoSize
              animationPreset="default"
              fontSize={fontSize}
              clipToBounds={false}
              containerStyle={{
                alignSelf: "center",
              }}
              style={{
                color: "#ffffff",
                fontFamily: "Sf-semibold",
                fontSize,
                textAlign: "center",
              }}
            />
          </PressableScale>
        </View>

        <View style={{ flex: 1 }} />

        {renderPanel(
          <>
            <SettingRow
              label="Button Text"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
              onPress={() =>
                setButtonWordIndex((index) =>
                  stepForward(index, buttonWords.length)
                )
              }
            >
              {renderValueText(word)}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Surface"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
            >
              {renderValueText("Pressable")}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Auto Size"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
            >
              {renderValueText("On")}
            </SettingRow>
          </>
        )}
      </>
    );
  };

  const renderNumbersPage = () => {
    const value = numericValues[numberIndex];
    const previousValue =
      numericValues[stepBackward(numberIndex, numericValues.length)];
    const nextValue = numericValues[stepForward(numberIndex, numericValues.length)];

    return (
      <>
        <View
          style={{
            width: "100%",
            minHeight: previewMinHeight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MorphingText
            text={value}
            variant="number"
            animationPreset="snappy"
            fontSize={fontSize}
            clipToBounds={false}
            containerStyle={{
              alignSelf: "center",
            }}
            style={{
              color: "#000000",
              fontFamily: "Sf-semibold",
              fontSize,
              fontVariant: ["tabular-nums"],
              textAlign: "center",
            }}
          />
        </View>

        <View style={{ flex: 1 }} />

        {renderPanel(
          <>
            <SettingRow
              label="Number"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
              onPress={() =>
                setNumberIndex((index) => stepForward(index, numericValues.length))
              }
            >
              {renderValueText(value)}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Reverse"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
            >
              {renderValueText(previousValue)}
            </SettingRow>
            {renderDivider()}
            <SettingRow
              label="Morph"
              rowHeight={rowHeight}
              labelFontSize={labelFontSize}
            >
              {renderValueText(nextValue)}
            </SettingRow>
          </>
        )}
      </>
    );
  };

  const renderExamplePage: ListRenderItem<CarouselItem> = ({ item }) => {
    const page = examplePages[item];
    const content =
      page?.id === "editor"
        ? renderEditorPage()
        : page?.id === "words"
          ? renderWordsPage()
          : page?.id === "button"
            ? renderButtonPage()
            : renderNumbersPage();

    return (
      <KeyboardAwareScrollView
        bottomOffset={height * 0.04}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={{
          width,
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: horizontalInset,
          paddingTop: pageTopPadding,
          paddingBottom: Math.max(height * 0.025, buttonHeight * 0.4),
        }}
      >
        {content}
      </KeyboardAwareScrollView>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
      }}
    >
      <CarouselContent renderItem={renderExamplePage} width={width} />

      <View
        style={{
          width: "100%",
          paddingHorizontal: horizontalInset,
          paddingTop: buttonHeight * 0.08,
          paddingBottom: footerPaddingBottom,
          backgroundColor: "#ffffff",
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: buttonHeight * 0.14,
          }}
        >
          <CarouselPagination
            defaultDotColor="#d7d7d7"
            activeDotColor="#000000"
          />
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            gap: buttonGap,
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
    </View>
  );
}

export default function Index() {
  const { width, height } = useWindowDimensions();

  return (
    <Carousel items={carouselItems} style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <IndexInner width={width} height={height} />
    </Carousel>
  );
}
