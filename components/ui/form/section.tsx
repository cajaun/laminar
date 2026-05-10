import React from "react";
import {
  Button,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link as RouterLink } from "expo-router";
import { Switch } from "@/components/ui/switch";
import { formColors } from "./colors";
import {
  defaultItemPadding,
  defaultMinRowHeight,
  CardStyleContext,
  ListStyleContext,
  SectionStyleContext,
} from "./contexts";
import { DatePicker, Toggle } from "./controls";
import { FormItem } from "./item";
import { HStack, Separator, Spacer } from "./layout";
import { Link } from "./link";
import { SystemImage, LinkChevronIcon } from "./symbol";
import { Text, TextField } from "./text";
import type { FormTextProps, SeparatorInset, SystemImageProps } from "./types";
import { getFlatChildren, isStringishNode } from "./utils";

type SectionProps = ViewProps & {
  readonly title?: string | React.ReactNode;
  readonly titleHint?: string | React.ReactNode;
  readonly footer?: string | React.ReactNode;
  readonly outerStyle?: StyleProp<ViewStyle>;
  readonly itemPadding?: {
    readonly paddingVertical: number;
    readonly paddingHorizontal: number;
  };
  readonly minRowHeight?: number;
  readonly separatorInset?: SeparatorInset;
};

export function Section({
  children,
  title,
  titleHint,
  footer,
  style,
  outerStyle,
  itemPadding = defaultItemPadding,
  minRowHeight = defaultMinRowHeight,
  separatorInset = "automatic",
  ...props
}: SectionProps) {
  const listStyle = React.useContext(ListStyleContext) ?? "auto";
  const { sheet } = React.useContext(CardStyleContext);
  const allChildren = getFlatChildren(children);
  const isGrouped = listStyle === "grouped";

  const childrenWithSeparator = allChildren.map((child, index) => (
    <React.Fragment key={index}>
      {renderSectionChild(child)}
      {index < allChildren.length - 1 ? (
        <Separator
          style={separatorStyleForChild({
            child,
            separatorInset,
            horizontalInset: itemPadding.paddingHorizontal,
          })}
        />
      ) : null}
    </React.Fragment>
  ));

  const contents = (
    <SectionStyleContext.Provider value={{ itemPadding, minRowHeight }}>
      <View
        {...props}
        collapsable={false}
        style={[
          styles.contents,
          {
            backgroundColor: sheet
              ? formColors.sheetCard
              : formColors.groupedCard,
          },
          isGrouped ? styles.groupedContents : styles.cardContents,
          style,
        ]}
      >
        {childrenWithSeparator}
      </View>
    </SectionStyleContext.Provider>
  );

  if (!title && !footer) {
    return (
      <View
        style={[isGrouped ? styles.groupedOuter : styles.cardOuter, outerStyle]}
      >
        {contents}
      </View>
    );
  }

  return (
    <View
      style={[isGrouped ? styles.groupedOuter : styles.cardOuter, outerStyle]}
    >
      {title || titleHint ? (
        <View style={styles.titleRow}>
          {title ? <SectionLabel>{title}</SectionLabel> : null}
          {titleHint ? <SectionHint>{titleHint}</SectionHint> : null}
        </View>
      ) : null}

      {contents}

      {footer ? <SectionFooter>{footer}</SectionFooter> : null}
    </View>
  );
}

if (__DEV__) Section.displayName = "FormSection";

function renderSectionChild(node: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(node)) {
    return (
      <FormItem>
        <Text>{node}</Text>
      </FormItem>
    );
  }

  let child = node as React.ReactElement<any>;
  const resolvedProps = { ...child.props };
  const originalOnPress = resolvedProps.onPress;
  const originalOnLongPress = resolvedProps.onLongPress;
  let wrapsFormItem = false;

  const isToggle = child.type === Toggle;
  const isDatePicker = child.type === DatePicker;

  if (isToggle) {
    resolvedProps.hint = (
      <Switch
        thumbColor={resolvedProps.thumbColor}
        trackColor={resolvedProps.trackColor}
        ios_backgroundColor={resolvedProps.ios_backgroundColor}
        onChange={resolvedProps.onChange}
        disabled={resolvedProps.disabled}
        value={resolvedProps.value}
        onValueChange={resolvedProps.onValueChange}
      />
    );
  }

  if (isDatePicker && resolvedProps.value) {
    resolvedProps.hint = React.createElement(
      DateTimePicker as React.ComponentType<any>,
      {
        ...nativeDatePickerProps(resolvedProps),
        accentColor: resolvedProps.accentColor ?? formColors.link,
      }
    );
  }

  if (resolvedProps.hintBoolean != null) {
    resolvedProps.hint = resolvedProps.hintBoolean ? (
      <SystemImage
        systemImage={{
          name: "checkmark.circle.fill",
          color: formColors.green,
          size: 20,
        }}
      />
    ) : (
      <SystemImage
        systemImage={{
          name: "slash.circle",
          color: formColors.gray,
          size: 20,
        }}
      />
    );
  }

  if (child.type === Button) {
    child = (
      <RNText
        style={[
          styles.text,
          styles.linkText,
          { color: resolvedProps.color ?? formColors.link },
          resolvedProps.style,
        ]}
      >
        {resolvedProps.title}
      </RNText>
    );
  } else if (isTextElement(child) || isToggle || isDatePicker) {
    child = renderTextElement(child, resolvedProps);
  } else if (child.type === RouterLink || child.type === Link) {
    wrapsFormItem = true;
    child = renderLinkElement(child, resolvedProps);
  } else if (child.type === TextInput || child.type === TextField) {
    wrapsFormItem = true;
    child = (
      <FormItem
        onPress={originalOnPress}
        onLongPress={originalOnLongPress}
        style={styles.textFieldItem}
      >
        {React.cloneElement(child, {
          placeholderTextColor: formColors.placeholder,
          ...resolvedProps,
          onPress: undefined,
          onLongPress: undefined,
          style: [styles.textField, resolvedProps.style],
        })}
      </FormItem>
    );
  }

  if (!wrapsFormItem && child.type !== FormItem && !resolvedProps.custom) {
    child = (
      <FormItem
        onPress={originalOnPress}
        onLongPress={originalOnLongPress}
        style={isToggle || isDatePicker ? styles.compactItem : undefined}
      >
        {child}
      </FormItem>
    );
  }

  return child;
}

function renderTextElement(
  child: React.ReactElement<any>,
  resolvedProps: FormTextProps
) {
  const hintView = renderHint(resolvedProps.hint);
  const textProps = nativeTextProps(resolvedProps);
  const mainText = React.cloneElement(child, {
    dynamicTypeRamp: "body",
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    ...textProps,
    onPress: undefined,
    onLongPress: undefined,
    hint: undefined,
    hintBoolean: undefined,
    systemImage: undefined,
    imageClassName: undefined,
    bold: undefined,
    custom: undefined,
    style: [
      styles.text,
      resolvedProps.bold && styles.boldText,
      resolvedProps.style,
    ],
  });

  if (!hintView && !resolvedProps.systemImage) {
    return mainText;
  }

  return (
    <HStack>
      <SystemImage systemImage={resolvedProps.systemImage} />
      {mainText}
      {hintView ? <Spacer /> : null}
      {hintView}
    </HStack>
  );
}

function renderLinkElement(
  child: React.ReactElement<any>,
  resolvedProps: FormTextProps & {
    readonly href?: unknown;
    readonly children?: React.ReactNode;
    readonly hintImage?: React.ReactNode;
  }
) {
  const wrappedTextChildren = React.Children.map(
    resolvedProps.children,
    (linkChild) => {
      if (!linkChild) {
        return null;
      }

      if (typeof linkChild === "string") {
        return <RNText style={styles.text}>{linkChild}</RNText>;
      }

      return linkChild;
    }
  );
  const hintView = renderHint(resolvedProps.hint);

  return React.cloneElement(child, {
    dynamicTypeRamp: "body",
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    hint: undefined,
    systemImage: undefined,
    imageClassName: undefined,
    hintImage: undefined,
    asChild: process.env.EXPO_OS !== "web",
    children: (
      <FormItem>
        <HStack>
          <SystemImage systemImage={resolvedProps.systemImage} />
          {wrappedTextChildren}
          <Spacer />
          {hintView}
          <View>
            <LinkChevronIcon
              href={resolvedProps.href}
              systemImage={resolvedProps.hintImage}
            />
          </View>
        </HStack>
      </FormItem>
    ),
  });
}

function renderHint(hint: React.ReactNode) {
  if (!hint) {
    return null;
  }

  return React.Children.map(hint, (child) => {
    if (!child) {
      return null;
    }

    if (typeof child === "string") {
      return (
        <RNText selectable style={[styles.text, styles.hintText]}>
          {child}
        </RNText>
      );
    }

    return child;
  });
}

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  if (!isStringishNode(children)) {
    return children;
  }

  return <RNText style={styles.sectionLabel}>{children}</RNText>;
}

function SectionHint({ children }: { readonly children: React.ReactNode }) {
  if (!isStringishNode(children)) {
    return children;
  }

  return <RNText style={styles.sectionHint}>{children}</RNText>;
}

function SectionFooter({ children }: { readonly children: React.ReactNode }) {
  if (!isStringishNode(children)) {
    return children;
  }

  return <RNText style={styles.sectionFooter}>{children}</RNText>;
}

function isTextElement(child: React.ReactElement<any>) {
  return child.type === RNText || child.type === Text;
}

function nativeDatePickerProps(props: Record<string, any>) {
  const {
    children: _children,
    hint: _hint,
    hintBoolean: _hintBoolean,
    systemImage: _systemImage,
    imageClassName: _imageClassName,
    bold: _bold,
    onPress: _onPress,
    onLongPress: _onLongPress,
    custom: _custom,
    ...nativeProps
  } = props;

  return nativeProps;
}

function nativeTextProps(props: Record<string, any>) {
  const {
    hint: _hint,
    hintBoolean: _hintBoolean,
    systemImage: _systemImage,
    imageClassName: _imageClassName,
    bold: _bold,
    custom: _custom,
    ...textProps
  } = props;

  return textProps;
}

function separatorStyleForChild({
  child,
  separatorInset,
  horizontalInset,
}: {
  readonly child: React.ReactNode;
  readonly separatorInset: SeparatorInset;
  readonly horizontalInset: number;
}) {
  if (separatorInset === "full") {
    return undefined;
  }

  const leadingInset =
    horizontalInset + leadingSystemImageWidth(getSystemImageFromChild(child));

  if (separatorInset === "content") {
    return {
      marginStart: leadingInset,
      marginEnd: horizontalInset,
    };
  }

  return {
    marginStart: leadingInset,
    marginEnd: 0,
  };
}

function getSystemImageFromChild(child: React.ReactNode) {
  if (!React.isValidElement(child)) {
    return undefined;
  }

  return (child.props as { systemImage?: SystemImageProps }).systemImage;
}

function leadingSystemImageWidth(systemImage?: SystemImageProps) {
  if (!systemImage) {
    return 0;
  }

  if (
    typeof systemImage === "object" &&
    systemImage !== null &&
    "name" in systemImage
  ) {
    return (systemImage.size ?? 20) + 8;
  }

  return 28;
}

const styles = StyleSheet.create({
  groupedOuter: {
    paddingHorizontal: 0,
  },
  cardOuter: {
    paddingHorizontal: 16,
  },
  contents: {
    overflow: "hidden",
  },
  groupedContents: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: formColors.separator,
  },
  cardContents: {
    borderRadius: 28,
  },
  titleRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  sectionLabel: {
    paddingVertical: 8,
    color: formColors.textSecondary,
    fontFamily: "Sf-regular",
    fontSize: 13,
    lineHeight: 18,
    textTransform: "uppercase",
  },
  sectionHint: {
    paddingVertical: 8,
    color: formColors.textSecondary,
    fontFamily: "Sf-regular",
    fontSize: 13,
    lineHeight: 18,
  },
  sectionFooter: {
    paddingTop: 8,
    paddingHorizontal: 20,
    color: formColors.textSecondary,
    fontFamily: "Sf-regular",
    fontSize: 13,
    lineHeight: 18,
  },
  text: {
    color: formColors.text,
    fontFamily: "Sf-regular",
    fontSize: 17,
    lineHeight: 22,
  },
  boldText: {
    fontFamily: "Sf-semibold",
  },
  linkText: {
    fontFamily: "Sf-regular",
  },
  hintText: {
    flexShrink: 1,
    color: formColors.textSecondary,
    textAlign: "right",
  },
  textFieldItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textField: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 11,
    color: formColors.text,
    fontFamily: "Sf-regular",
    fontSize: 17,
    lineHeight: 22,
  } satisfies TextStyle,
  compactItem: {
    paddingVertical: 8,
  },
});
