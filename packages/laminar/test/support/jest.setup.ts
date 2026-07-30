jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const ReactNative = require("react-native");
  const easing = Object.assign((value: number) => value, {
    factory: () => (value: number) => value,
  });
  const layoutTransition: {
    duration: jest.Mock;
    easing: jest.Mock;
  } = {
    duration: jest.fn(),
    easing: jest.fn(),
  };
  layoutTransition.duration.mockImplementation(() => layoutTransition);
  layoutTransition.easing.mockImplementation(() => layoutTransition);

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
      Text: ReactNative.Text,
    },
    Easing: {
      bezier: jest.fn(() => easing),
    },
    LinearTransition: layoutTransition,
    useAnimatedStyle: jest.fn((factory: () => unknown) => factory()),
    useSharedValue: jest.fn((value: unknown) =>
      React.useRef({ value }).current
    ),
    withDelay: jest.fn((delayMs: number, animation: unknown) => ({
      type: "delay",
      delayMs,
      animation,
    })),
    withSpring: jest.fn((toValue: number, config: unknown) => ({
      type: "spring",
      toValue,
      config,
    })),
    withTiming: jest.fn((toValue: number, config: unknown) => ({
      type: "timing",
      toValue,
      config,
    })),
  };
});

jest.mock("react-native-worklets", () => ({
  createSerializable: jest.fn((value: unknown) => value),
  isSerializableRef: jest.fn(() => false),
  runOnJS: jest.fn((callback: (...args: unknown[]) => unknown) => callback),
  runOnUI: jest.fn((callback: (...args: unknown[]) => unknown) => callback),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
