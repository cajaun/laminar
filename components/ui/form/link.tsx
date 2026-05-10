import React from "react";
import { Share, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Link as RouterLink } from "expo-router";
import type { LinkProps as RouterLinkProps } from "expo-router";
import { formColors } from "./colors";
import type { FormTextProps, SystemImageProps } from "./types";
import { isExternalHref } from "./utils";

export type FormLinkProps = Omit<RouterLinkProps, "target"> &
  Pick<FormTextProps, "hint" | "systemImage" | "imageClassName"> & {
    readonly hintImage?: SystemImageProps;
    readonly bold?: boolean;
    readonly target?: RouterLinkProps["target"] | "share";
  };

export function Link({
  bold,
  target,
  onPress,
  style,
  hint: _hint,
  systemImage: _systemImage,
  imageClassName: _imageClassName,
  hintImage: _hintImage,
  ...props
}: FormLinkProps) {
  return (
    <RouterLink
      dynamicTypeRamp="body"
      {...props}
      target={target === "share" ? undefined : target}
      asChild={props.asChild ?? false}
      style={[styles.link, bold && styles.bold, style]}
      onPress={(event) => {
        const href = RouterLink.resolveHref(props.href);
        const opensExternally = isExternalHref(href);

        if (process.env.EXPO_OS !== "web" && target === "_blank" && opensExternally) {
          event.preventDefault();
          WebBrowser.openBrowserAsync(href, {
            presentationStyle:
              WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
          });
          return;
        }

        if (process.env.EXPO_OS !== "web" && target === "share" && opensExternally) {
          event.preventDefault();
          Share.share({ url: href });
          return;
        }

        onPress?.(event);
      }}
    />
  );
}

if (__DEV__) Link.displayName = "FormLink";

const styles = StyleSheet.create({
  link: {
    color: formColors.text,
    fontFamily: "Sf-regular",
    fontSize: 17,
    lineHeight: 22,
  },
  bold: {
    fontFamily: "Sf-semibold",
  },
});
