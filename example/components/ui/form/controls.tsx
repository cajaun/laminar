import React from "react";
import type { SwitchProps } from "react-native";
import type {
  AndroidNativeProps,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";
import { Text } from "./text";
import type { FormTextProps } from "./types";

export type ToggleProps = FormTextProps &
  Required<Pick<SwitchProps, "value" | "onValueChange">> &
  Omit<SwitchProps, "value" | "onValueChange">;

export function Toggle({
  value: _value,
  onValueChange: _onValueChange,
  disabled: _disabled,
  thumbColor: _thumbColor,
  trackColor: _trackColor,
  ios_backgroundColor: _iosBackgroundColor,
  onChange: _onChange,
  ...props
}: ToggleProps) {
  return <Text {...props} />;
}

if (__DEV__) Toggle.displayName = "FormToggle";

export type DatePickerProps = FormTextProps &
  (IOSNativeProps | AndroidNativeProps);

export function DatePicker(props: DatePickerProps) {
  const {
    value: _value,
    mode: _mode,
    disabled: _disabled,
    accentColor: _accentColor,
    onChange: _onChange,
    display: _display,
    locale: _locale,
    minuteInterval: _minuteInterval,
    maximumDate: _maximumDate,
    minimumDate: _minimumDate,
    timeZoneName: _timeZoneName,
    timeZoneOffsetInMinutes: _timeZoneOffsetInMinutes,
    textColor: _textColor,
    themeVariant: _themeVariant,
    is24Hour: _is24Hour,
    positiveButton: _positiveButton,
    neutralButton: _neutralButton,
    negativeButton: _negativeButton,
    firstDayOfWeek: _firstDayOfWeek,
    onError: _onError,
    initialInputMode: _initialInputMode,
    title: _title,
    fullscreen: _fullscreen,
    design: _design,
    ...textProps
  } = props as any;

  return <Text {...(textProps as FormTextProps)} />;
}

if (__DEV__) DatePicker.displayName = "FormDatePicker";
