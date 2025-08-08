import * as AppleColors from "@bacons/apple-colors";
import { Href, LinkProps, Link as RouterLink, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { forwardRef, useContext } from "react";
import {
  ActivityIndicator,
  Button,
  OpaqueColorValue,
  RefreshControl,
  Text as RNText,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  SwitchProps,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableHighlight,
  useColorScheme,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { HeaderButton } from "./header";

import Animated from "react-native-reanimated";
import { BodyScrollView } from "@/components/ui/utils/body-scroll-view"
import { SFSymbol, SymbolView } from "expo-symbols";
import { Switch } from "react-native";

type ListStyle = "grouped" | "auto";

const ListStyleContext = React.createContext<ListStyle>("auto");

type RefreshCallback = () => Promise<void>;

const RefreshContext = React.createContext<{
  subscribe: (cb: RefreshCallback) => () => void;
  hasSubscribers: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
}>({
  subscribe: () => () => {},
  hasSubscribers: false,
  refresh: async () => {},
  refreshing: false,
});

export const RefreshContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const subscribersRef = React.useRef<Set<RefreshCallback>>(new Set());
  const [subscriberCount, setSubscriberCount] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const subscribe = (cb: RefreshCallback) => {
    subscribersRef.current.add(cb);
    setSubscriberCount((count) => count + 1);

    return () => {
      subscribersRef.current.delete(cb);
      setSubscriberCount((count) => count - 1);
    };
  };

  const refresh = async () => {
    const subscribers = Array.from(subscribersRef.current);
    if (subscribers.length === 0) return;

    setRefreshing(true);
    try {
      await Promise.all(subscribers.map((cb) => cb()));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <RefreshContext.Provider
      value={{
        subscribe,
        refresh,
        refreshing,
        hasSubscribers: subscriberCount > 0,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
};

export function usePullRefresh(callback?: () => Promise<void>) {
  const { subscribe, refresh } = React.useContext(RefreshContext);

  React.useEffect(() => {
    if (callback) {
      const unsubscribe = subscribe(callback);
      return unsubscribe;
    }
  }, [callback, subscribe]);

  return refresh;
}

type ListProps = ScrollViewProps & {
  /** Set the Expo Router `<Stack />` title when mounted. */
  navigationTitle?: string;
  listStyle?: ListStyle;
};
export function List(props: ListProps) {
  return (
    <RefreshContextProvider>
      <InnerList {...props} />
    </RefreshContextProvider>
  );
}

function InnerList({ contentContainerStyle, ...props }: ListProps) {
  const { hasSubscribers, refreshing, refresh } =
    React.useContext(RefreshContext);

  return (
    <>
      {props.navigationTitle && (
        <Stack.Screen options={{ title: props.navigationTitle }} />
      )}
      <ListStyleContext.Provider value={props.listStyle ?? "auto"}>
        <BodyScrollView
          contentContainerStyle={mergedStyleProp(
            {
              paddingVertical: 16,
              gap: 24,
            },
            contentContainerStyle
          )}
          style={{
            maxWidth: 768,
            width: process.env.EXPO_OS === "web" ? "100%" : undefined,
            marginHorizontal:
              process.env.EXPO_OS === "web" ? "auto" : undefined,
          }}
          refreshControl={
            hasSubscribers ? (
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            ) : undefined
          }
          {...props}
        />
      </ListStyleContext.Provider>
    </>
  );
}

if (__DEV__) List.displayName = "FormList";

export function HStack(props: ViewProps) {
  return (
    <View
      {...props}
      style={mergedStyles(
        {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          wordWrap: "break-word",
          // flexWrap: "wrap",
        },
        props
      )}
    />
  );
}

const minItemHeight = 20;

const styles = StyleSheet.create({
  itemPadding: {
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
});

function getFlatChildren(children: React.ReactNode) {
  const allChildren: React.ReactNode[] = [];

  React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // If the child is a fragment, unwrap it and add the children to the list
    if (
      child.type === React.Fragment &&
      typeof child.props === "object" &&
      child.props != null &&
      "key" in child.props &&
      child.props?.key == null &&
      "children" in child.props
    ) {
      React.Children.forEach(child.props?.children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        allChildren.push(child);
      });
      return;
    }

    allChildren.push(child);
  });
  return allChildren;
}

const SectionStyleContext = React.createContext<{
  style: StyleProp<ViewStyle>;
}>({
  style: styles.itemPadding,
});

export const FormItem = forwardRef<
  View,
  {
    children: React.ReactNode;
    href?: Href;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: ViewStyle;
    hStyle?: ViewStyle;
  }
>(({ children, href, onPress, onLongPress, style, hStyle }, ref) => {
  const itemStyle =
    useContext(SectionStyleContext)?.style ?? styles.itemPadding;
  const resolvedStyle = [itemStyle, style];

  if (href == null) {
    if (onPress == null && onLongPress == null) {
      const childrenCount = getFlatChildren(children).length;

      // If there's only one child, avoid the HStack. This ensures that TextInput doesn't jitter horizontally when typing.
      if (childrenCount === 1) {
        return (
          <View style={resolvedStyle}>
            <View style={{ minHeight: minItemHeight }}>{children}</View>
          </View>
        );
      }

      return (
        <View style={resolvedStyle}>
          <HStack style={[{ minHeight: minItemHeight }, hStyle]}>
            {children}
          </HStack>
        </View>
      );
    }

    return (
      <TouchableHighlight
        ref={ref}
        underlayColor={AppleColors.systemGray4}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={resolvedStyle}>
          <HStack style={[{ minHeight: minItemHeight }, hStyle]}>
            {children}
          </HStack>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <Link asChild href={href} onPress={onPress} onLongPress={onLongPress}>
      <TouchableHighlight ref={ref} underlayColor={AppleColors.systemGray4}>
        <View style={resolvedStyle}>
          <HStack style={[{ minHeight: minItemHeight }, hStyle]}>
            {children}
          </HStack>
        </View>
      </TouchableHighlight>
    </Link>
  );
});

type FormTextProps = TextProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** A true/false value for the hint. */
  hintBoolean?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text */
  systemImage?: SystemImageProps | React.ReactNode;

  bold?: boolean;
};

export function TextField({
  hint,
  ...props
}: TextInputProps & { hint?: string }) {
  const font: TextStyle = {
    ...FormFont.default,
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {/* Hint on the left */}
      {hint && (
        <RNText
          style={{
            ...FormFont.default,
            flex: 1,
          }}
        >
          {hint}
        </RNText>
      )}

      {/* TextInput on the right */}
      <TextInput
        placeholderTextColor={AppleColors.placeholderText}
        {...props}
        style={mergedStyleProp(font, [
          props.style,
          {
            flex: 1.5,
          },
        ])}
      />
    </View>
  );
}

if (__DEV__) TextField.displayName = "FormTextField";

export function Text({
  bold,
  systemImage,
  hint,
  ...props
}: FormTextProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text */
  systemImage?: SystemImageProps | React.ReactNode;
  bold?: boolean;
}) {
  const font: TextStyle = {
    ...FormFont.default,
    flexShrink: 0,
    fontWeight: bold ? "600" : "normal",
  };

  return (
    <RNText
      dynamicTypeRamp="body"
      {...props}
      style={mergedStyleProp(font, props.style)}
    />
  );
}

export function Toggle({
  value,
  onValueChange,
  ...props
}: FormTextProps & Required<Pick<SwitchProps, "value" | "onValueChange">>) {
  return <Text {...props} />;
}

if (__DEV__) Toggle.displayName = "FormToggle";

const Colors = {
  systemGray4: AppleColors.systemGray4, // "rgba(209, 209, 214, 1)",
  secondarySystemGroupedBackground:
    AppleColors.secondarySystemGroupedBackground, // "rgba(255, 255, 255, 1)",
  separator: "rgba(198.9, 198.9, 198.9, 1)", // "rgba(61.2, 61.2, 66, 0.29)",
};

type SystemImageProps =
  | SFSymbol
  | {
      name: SFSymbol;
      color?: OpaqueColorValue;
      size?: number;
    };

if (__DEV__) Text.displayName = "FormText";

export function Link({
  bold,
  children,
  headerRight,
  hintImage,
  onPress, // Added onPress here
  ...props
}: LinkProps & {
  /** Value displayed on the right side of the form item. */
  hint?: React.ReactNode;
  /** Adds a prefix SF Symbol image to the left of the text. */
  systemImage?: SystemImageProps | React.ReactNode;

  /** Changes the right icon. */
  hintImage?: SystemImageProps | React.ReactNode;

  // TODO: Automatically detect this somehow.
  /** Is the link inside a header. */
  headerRight?: boolean;

  bold?: boolean;

  /** Added onPress prop */
  onPress?: () => void;
}) {
  const font: TextStyle = {
    ...FormFont.default,
    fontWeight: bold ? "600" : "normal",
  };

  const resolvedChildren = (() => {
    if (headerRight) {
      if (process.env.EXPO_OS === "web") {
        return <div style={{ paddingRight: 16 }}>{children}</div>;
      }
      const wrappedTextChildren = React.Children.map(children, (child) => {
        if (!child) return null;
        if (typeof child === "string") {
          return (
            <RNText
              style={mergedStyleProp<TextStyle>(
                { ...font, color: AppleColors.link },
                props.style
              )}
            >
              {child}
            </RNText>
          );
        }
        return child;
      });

      return (
        <HeaderButton
          pressOpacity={0.7}
          style={{
            marginRight: -8,
          }}
        >
          {wrappedTextChildren}
        </HeaderButton>
      );
    }
    return children;
  })();

  return (
    <RouterLink
      dynamicTypeRamp="body"
      {...props}
      asChild={props.asChild ?? (process.env.EXPO_OS === "web" ? false : headerRight)}
      style={mergedStyleProp<TextStyle>(font, props.style)}
      onPress={onPress} // Pass the onPress directly here
    >
      {resolvedChildren}
    </RouterLink>
  );
}


if (__DEV__) Link.displayName = "FormLink";

export const FormFont = {
  // From inspecting SwiftUI `List { Text("Foo") }` in Xcode.
  default: {
    color: AppleColors.label,
    // 17.00pt is the default font size for a Text in a List.
    // fontSize: 17,
    // UICTFontTextStyleBody is the default fontFamily.
  },
  secondary: {
    color: AppleColors.secondaryLabel,
    // fontSize: 17,
  },
  caption: {
    color: AppleColors.secondaryLabel,
    fontSize: 12,
  },
  title: {
    color: AppleColors.label,
    // fontSize: 17,
    fontWeight: "600",
  },
};

export function Loading({ title }: { title?: string }) {
  return (
    <Section title={title}>
      <View>
        <ActivityIndicator />
      </View>
    </Section>
  );
}

function flattenChildren(children: React.ReactNode): React.ReactElement[] {
  const result: React.ReactElement[] = [];

  function recurse(nodes: React.ReactNode) {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;

      if (child.type === React.Fragment && child.key == null) {
        recurse(child.props.children); // 🌟 recurse here
      } else {
        result.push(child);
      }
    });
  }

  recurse(children);
  return result;
}

export function Section({
  children,
  title,
  titleView,
  footer,
  ...props
}: ViewProps & {
  title?: string | React.ReactNode;
  titleView?: boolean;
  footer?: string | React.ReactNode;
}) {
  const listStyle = React.useContext(ListStyleContext) ?? "auto";

  const allChildren: React.ReactNode[] = flattenChildren(children);

  const childrenWithSeparator = allChildren.map((child, index) => {
    if (!React.isValidElement(child)) return child;

    const isLastChild = index === allChildren.length - 1;

    const resolvedProps = {
      ...child.props,
    };

    const isToggle = child.type === Toggle;
    const isTextInput = child.type === TextInput || child.type === TextField;

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

    if (isTextInput) {
      const hintView = resolvedProps.hint ? (
        <RNText
          dynamicTypeRamp="body"
          style={{
            ...FormFont.secondary,
            textAlign: "right",
            flexShrink: 1,
          }}
        >
          {resolvedProps.hint}
        </RNText>
      ) : null;

      child = (
        <FormItem
          key={child.key}
          onPress={resolvedProps.onPress}
          onLongPress={resolvedProps.onLongPress}
          style={{ paddingVertical: 0, paddingHorizontal: 0 }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {React.cloneElement(child, {
              placeholderTextColor: AppleColors.placeholderText,
              ...resolvedProps,
              style: mergedStyleProp(FormFont.default, [
                { outline: "none" },
                styles.itemPadding,
                resolvedProps.style,
              ]),
            })}
            {hintView}
          </View>
        </FormItem>
      );
    }

    // Extract onPress from child
    const originalOnPress = resolvedProps.onPress;
    const originalOnLongPress = resolvedProps.onLongPress;
    let wrapsFormItem = false;
    if (child.type === Button) {
      const { title, color } = resolvedProps;

      delete resolvedProps.title;
      resolvedProps.style = mergedStyleProp(
        { color: color ?? AppleColors.link },
        resolvedProps.style
      );
      child = (
        <RNText key={child.key} {...resolvedProps}>
          {title}
        </RNText>
      );
    }

    if (
      // If child is type of Text, add default props
      child.type === RNText ||
      child.type === Text ||
      isToggle
    ) {
      child = React.cloneElement(child, {
        key: child.key,
        dynamicTypeRamp: "body",
        numberOfLines: 1,
        adjustsFontSizeToFit: true,
        ...resolvedProps,
        onPress: undefined,
        onLongPress: undefined,
        style: mergedStyleProp(FormFont.default, resolvedProps.style),
      });

      const hintView = (() => {
        if (!resolvedProps.hint) {
          return null;
        }

        return React.Children.map(resolvedProps.hint, (child, index) => {
          // Filter out empty children
          if (!child) {
            return null;
          }
          if (typeof child === "string") {
            return (
              <RNText
                key={String(index)}
                dynamicTypeRamp="body"
                style={{
                  ...FormFont.secondary,
                  textAlign: "right",
                  flexShrink: 1,
                }}
              >
                {child}
              </RNText>
            );
          }
          return child;
        });
      })();

      const symbolView = (() => {
        if (!resolvedProps.systemImage) {
          return null;
        }

        if (
          typeof resolvedProps.systemImage !== "string" &&
          React.isValidElement(resolvedProps.systemImage)
        ) {
          return resolvedProps.systemImage;
        }

        const symbolProps =
          typeof resolvedProps.systemImage === "string"
            ? { name: resolvedProps.systemImage }
            : resolvedProps.systemImage;

        return (
          <SymbolView
            name={symbolProps.name}
            size={symbolProps.size ?? 20}
            style={[{ marginRight: 8 }, symbolProps.style]}
            weight={symbolProps.weight}
            tintColor={
              symbolProps.color ??
              extractStyle(resolvedProps.style, "color") ??
              AppleColors.label
            }
          />
        );
      })();

      if (hintView || symbolView) {
        child = (
          <HStack key={child.key}>
            {symbolView}
            {child}
            {hintView && <View style={{ flex: 1 }} />}
            {hintView}
          </HStack>
        );
      }
    } else if (child.type === RouterLink || child.type === Link) {
      wrapsFormItem = true;

      const wrappedTextChildren = React.Children.map(
        resolvedProps.children,
        (linkChild) => {
          // Filter out empty children
          if (!linkChild) {
            return null;
          }
          if (typeof linkChild === "string") {
            return (
              <RNText
                key={String(index)}
                dynamicTypeRamp="body"
                style={mergedStyles(FormFont.default, resolvedProps)}
              >
                {linkChild}
              </RNText>
            );
          }
          return linkChild;
        }
      );

      const hintView = (() => {
        if (!resolvedProps.hint) {
          return null;
        }

        return React.Children.map(resolvedProps.hint, (child) => {
          // Filter out empty children
          if (!child) {
            return null;
          }
          if (typeof child === "string") {
            return <Text style={FormFont.secondary}>{child}</Text>;
          }
          return child;
        });
      })();

      const symbolView = (() => {
        if (!resolvedProps.systemImage) {
          return null;
        }

        if (
          typeof resolvedProps.systemImage !== "string" &&
          React.isValidElement(resolvedProps.systemImage)
        ) {
          return resolvedProps.systemImage;
        }

        const symbolProps =
          typeof resolvedProps.systemImage === "string"
            ? { name: resolvedProps.systemImage }
            : resolvedProps.systemImage;

        return (
          <SymbolView
            name={symbolProps.name}
            size={symbolProps.size ?? 20}
            style={[{ marginRight: 8 }, symbolProps.style]}
            weight={symbolProps.weight}
            tintColor={
              symbolProps.color ??
              extractStyle(resolvedProps.style, "color") ??
              AppleColors.label
            }
          />
        );
      })();

      child = React.cloneElement(child, {
        key: child.key,
        style: [FormFont.default, resolvedProps.style],
        dynamicTypeRamp: "body",
        numberOfLines: 1,
        adjustsFontSizeToFit: true,
        // TODO: This causes issues with ref in React 19.
        asChild: process.env.EXPO_OS !== "web",
        children: (
          <FormItem key={String(index)}>
            <HStack>
              {symbolView}
              {wrappedTextChildren}
              <View style={{ flex: 1 }} />
              {hintView}
              <View style={{ paddingLeft: 12 }}>
                <LinkChevronIcon
                  href={resolvedProps.href}
                  systemImage={resolvedProps.hintImage}
                />
              </View>
            </HStack>
          </FormItem>
        ),
      });
    } else if (child.type === TextInput || child.type === TextField) {
      wrapsFormItem = true;
      child = (
        <FormItem
          onPress={originalOnPress}
          onLongPress={originalOnLongPress}
          style={{ paddingVertical: 0, paddingHorizontal: 0 }}
        >
          {React.cloneElement(child, {
            placeholderTextColor: AppleColors.placeholderText,
            ...resolvedProps,
            onPress: undefined,
            onLongPress: undefined,
            style: mergedStyleProp(FormFont.default, [
              { outline: "none" },
              styles.itemPadding,
              resolvedProps.style,
            ]),
          })}
        </FormItem>
      );
    }

    // Ensure child is a FormItem otherwise wrap it in a FormItem
    if (!wrapsFormItem && !child.props.custom && child.type !== FormItem) {
      const reducedPadding = isToggle
        ? {
            paddingVertical: 8,
          }
        : undefined;
      child = (
        <FormItem
          key={child.key ?? String(index)}
          onPress={originalOnPress}
          onLongPress={originalOnLongPress}
          style={reducedPadding}
        >
          {child}
        </FormItem>
      );
    }

    const hasSystemImage =
      resolvedProps?.systemImage != null && resolvedProps.systemImage !== false;

    return (
      <React.Fragment key={`child-${index}`}>
        {child}
        {!isLastChild && <Separator hasSystemImage={hasSystemImage} />}
      </React.Fragment>
    );
  });

  const contents = (
    <Animated.View
      {...props}
      style={[
        listStyle === "grouped"
          ? {
              backgroundColor: Colors.secondarySystemGroupedBackground,
              borderTopWidth: 0.5,
              borderBottomWidth: 0.5,
              borderColor: Colors.separator,
            }
          : {
              borderCurve: "continuous",
              overflow: "hidden",
              borderRadius: 10,
              backgroundColor: Colors.secondarySystemGroupedBackground,
            },
        props.style,
      ]}
    >
      {childrenWithSeparator}
    </Animated.View>
  );

  const padding = listStyle === "grouped" ? 0 : 16;

  if (!title && !footer) {
    return (
      <View
        style={{
          paddingHorizontal: padding,
        }}
      >
        {contents}
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: padding,
      }}
    >
      {title &&
        (titleView ? (
          title
        ) : (
          <RNText
            dynamicTypeRamp="footnote"
            style={{
              textTransform: "uppercase",
              color: AppleColors.secondaryLabel,
              paddingHorizontal: 20,
              paddingVertical: 8,
              fontSize: 11,
              // use Apple condensed font
              // fontVariant: ["small-caps"],
            }}
          >
            {title}
          </RNText>
        ))}
      {contents}
      {footer && (
        <RNText
          dynamicTypeRamp="footnote"
          style={{
            color: AppleColors.secondaryLabel,
            paddingHorizontal: 20,
            paddingTop: 8,

            fontSize: 11,
          }}
        >
          {footer}
        </RNText>
      )}
    </View>
  );
}

function LinkChevronIcon({
  href,
  systemImage,
}: {
  href?: any;
  systemImage?: SystemImageProps | React.ReactNode;
}) {
  const isHrefExternal =
    typeof href === "string" && /^([\w\d_+.-]+:)?\/\//.test(href);

  const size = process.env.EXPO_OS === "ios" ? 14 : 24;

  if (systemImage) {
    if (typeof systemImage !== "string") {
      if (React.isValidElement(systemImage)) {
        return systemImage;
      }
      // Narrow to object with name property
      if (typeof systemImage === "object" && "name" in systemImage) {
        return (
          <SymbolView
            name={systemImage.name}
            size={systemImage.size ?? size}
            tintColor={String(systemImage.color ?? AppleColors.tertiaryLabel)}
          />
        );
      }
    }
  }

  const resolvedName =
    typeof systemImage === "string"
      ? systemImage
      : isHrefExternal
      ? "arrow.up.right"
      : "chevron.right";

      const colorScheme = useColorScheme(); 

      const tintColor = colorScheme === 'light' ?  "#9D9DA0" : " #BFBFBF" ;
      
  return (
    <SymbolView
      name={resolvedName as SFSymbol}
      size={size}
      weight="bold"
      tintColor={tintColor}
    />
  );
}

function Separator({ hasSystemImage = false }: { hasSystemImage?: boolean }) {
  return (
    <View
      style={{
        marginStart: hasSystemImage ? 60 : 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginTop: -0.5,
        borderBottomColor: Colors.separator,
      }}
    />
  );
}

function mergedStyles(style: ViewStyle | TextStyle, props: any) {
  return mergedStyleProp(style, props.style);
}

export function mergedStyleProp<TStyle extends ViewStyle | TextStyle>(
  style: TStyle,
  styleProps?: StyleProp<TStyle> | null
): StyleProp<TStyle> {
  if (styleProps == null) {
    return style;
  } else if (Array.isArray(styleProps)) {
    return [style, ...styleProps];
  }
  return [style, styleProps];
}

function extractStyle(styleProp: any, key: string) {
  if (styleProp == null) {
    return undefined;
  } else if (Array.isArray(styleProp)) {
    return styleProp.find((style) => {
      return style[key] != null;
    })?.[key];
  } else if (typeof styleProp === "object") {
    return styleProp?.[key];
  }
  return null;
}
