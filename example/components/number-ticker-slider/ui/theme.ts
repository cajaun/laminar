const SCREEN = {
  primary: "#101114",
  secondary: "#818184",
  violet: "#9188FF",
} as const;

export function getNumberTickerSliderColors(
  isDark: boolean,
  background: string,
) {
  return {
    background,
    primary: isDark ? "#FFFFFF" : SCREEN.primary,
    secondary: isDark ? "#838596" : SCREEN.secondary,
    accent: isDark ? "#9896F8" : SCREEN.violet,
    track: isDark ? "#29283F" : "#F0EFFF",
  };
}

export function getClockIconColor(isDark: boolean) {
  return isDark ? "#FFFFFF" : SCREEN.primary;
}
