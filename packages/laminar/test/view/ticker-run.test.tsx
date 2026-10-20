import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import type { LaminarAnimatedText, MotionRecipe } from "../../src/types";
import { TickerRun } from "../../src/view/ticker-run";

const enterTransition = jest.fn(() => ({ initialValues: {}, animations: {} }));
const exitTransition = jest.fn(() => ({ initialValues: {}, animations: {} }));
const motionRecipe: MotionRecipe = {
  durationMs: 120,
  easing: ((value: number) => value) as never,
  layoutTransition: {} as never,
  enterTransition,
  exitTransition,
  driveNumber: (value) => value,
};

const animatedText = (
  values: readonly string[],
  index = 0,
): LaminarAnimatedText =>
  ({ index: { value: index }, values }) as unknown as LaminarAnimatedText;

const renderTicker = (props: React.ComponentProps<typeof TickerRun>) => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<TickerRun {...props} />);
  });
  return renderer;
};

describe("ticker run", () => {
  beforeEach(() => {
    enterTransition.mockClear();
    exitTransition.mockClear();
  });

  test("TICKER-ST-001 renders flow lanes and animates value structure changes", () => {
    const textStyle = { fontSize: 20, lineHeight: 24, letterSpacing: 1 };
    const leading = <Text>coin</Text>;
    const renderer = renderTicker({
      value: "$40.24",
      motionRecipe,
      align: "center",
      fontSize: 20,
      fractionScale: 0.6,
      textStyle,
      leading,
      leadingKey: "coin",
      leadingGap: 4,
      className: "amount",
    });

    const fraction = renderer.root
      .findAllByType(Text)
      .find((node) => node.props.children === "2");
    expect(StyleSheet.flatten(fraction?.props.style)).toMatchObject({
      fontSize: 12,
      letterSpacing: 0,
    });
    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "coin"),
    ).toBe(true);

    act(() => {
      renderer.update(
        <TickerRun
          value="$1,000"
          motionRecipe={motionRecipe}
          align="center"
          fontSize={20}
          fractionScale={0.6}
          textStyle={textStyle}
          leading={<Text>wallet</Text>}
          leadingKey="wallet"
          leadingGap={4}
          className="amount"
        />,
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "wallet"),
    ).toBe(true);
    expect(
      renderer.root
        .findAllByType(View)
        .some((node) => node.props.entering === enterTransition),
    ).toBe(true);
    expect(
      renderer.root
        .findAllByType(View)
        .some((node) => node.props.exiting === exitTransition),
    ).toBe(true);
  });

  test("TICKER-ST-002 keeps stable lanes and handles decimal-free text", () => {
    const textStyle = { fontSize: 18, letterSpacing: 2 };
    const renderer = renderTicker({
      value: "12",
      motionRecipe,
      align: "left",
      textStyle,
    });
    const firstDigit = renderer.root
      .findAllByType(Text)
      .find((node) => node.props.children === "1");

    act(() => {
      renderer.update(
        <TickerRun
          value="13"
          motionRecipe={motionRecipe}
          align="left"
          textStyle={textStyle}
        />,
      );
    });

    expect(firstDigit).toBeDefined();
    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "3"),
    ).toBe(true);
    expect(enterTransition).not.toHaveBeenCalled();
    expect(
      renderer.root.findAllByType(Text).every((node) => node.props.className === undefined),
    ).toBe(true);
  });

  test("TICKER-ST-003 compares equivalent style objects and updates changed styles", () => {
    const renderer = renderTicker({
      value: "123",
      motionRecipe,
      align: "right",
      textStyle: { fontSize: 20, color: "red" },
    });

    act(() => {
      renderer.update(
        <TickerRun
          value="124"
          motionRecipe={motionRecipe}
          align="right"
          textStyle={{ fontSize: 20, color: "red" }}
        />,
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "4"),
    ).toBe(true);

    act(() => {
      renderer.update(
        <TickerRun
          value="125"
          motionRecipe={motionRecipe}
          align="right"
          textStyle={{ fontSize: 20, color: "blue" }}
          className="changed"
        />,
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.className === "changed"),
    ).toBe(true);

    act(() => {
      renderer.update(
        <TickerRun
          value="126"
          motionRecipe={motionRecipe}
          align="right"
          textStyle={{ fontSize: 20, color: "blue" }}
          className="changed"
        />,
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "6"),
    ).toBe(true);
  });

  test("TICKER-ST-004 holds the last displayed flow value until ready", () => {
    const renderer = renderTicker({ value: "40", motionRecipe, align: "left" });

    act(() => {
      renderer.update(
        <TickerRun value="100" motionRecipe={motionRecipe} align="left" ready={false} />,
      );
    });

    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "4"),
    ).toBe(true);
    expect(
      renderer.root.findAllByType(Text).some((node) => node.props.children === "1"),
    ).toBe(false);
  });

  test("TICKER-DT-001 lays out native lanes from every supplied frame", () => {
    const values = ["$9.50", "12", "€1.2", "word", "longprefix123456", "12345678"];
    const ticker = animatedText(values, 2);
    const renderer = renderTicker({
      value: "$9.50",
      animatedText: ticker,
      motionRecipe,
      align: "right",
      fontSize: 20,
      fractionScale: 0.6,
      textStyle: { fontSize: 20, lineHeight: 24, letterSpacing: 1 },
      leading: <Text>coin</Text>,
      leadingKey: "coin",
      leadingGap: 3,
      className: "native-amount",
    });

    const lanes = renderer.root.findAllByType(TextInput);
    expect(lanes.length).toBeGreaterThan(8);
    expect(lanes.every((lane) => lane.props.pointerEvents === "none")).toBe(true);
    expect(lanes.every((lane) => lane.props.editable === false)).toBe(true);
    expect(lanes.some((lane) => lane.props.animatedProps?.text === "€")).toBe(true);
    expect(renderer.root.findAllByType(Text).some((node) => node.props.children === "coin")).toBe(
      true,
    );

    const measureNodes = renderer.root
      .findAllByType(Text)
      .filter((node) => typeof node.props.onLayout === "function");
    expect(measureNodes.length).toBeGreaterThan(0);
    const staleMeasurement = measureNodes[0];

    act(() => {
      measureNodes.forEach((node, index) =>
        node.props.onLayout({ nativeEvent: { layout: { width: index + 5 } } }),
      );
      measureNodes[0].props.onLayout({ nativeEvent: { layout: { width: 5 } } });
    });

    const measuredLanes = renderer.root.findAllByType(TextInput);
    expect(
      measuredLanes.some((lane) => StyleSheet.flatten(lane.props.style)?.width !== undefined),
    ).toBe(true);

    act(() => {
      renderer.update(
        <TickerRun
          value="$9.50"
          animatedText={animatedText([...values, "£2.45"], 5)}
          motionRecipe={motionRecipe}
          align="right"
          fontSize={20}
          fractionScale={0.6}
          textStyle={{ fontSize: 20, lineHeight: 24, letterSpacing: 1 }}
          leading={<Text>coin</Text>}
          leadingKey="coin"
          leadingGap={3}
          className="native-amount"
        />,
      );
    });

    act(() => {
      staleMeasurement.props.onLayout({ nativeEvent: { layout: { width: 99 } } });
    });

    const newMeasureNodes = renderer.root
      .findAllByType(Text)
      .filter((node) => typeof node.props.onLayout === "function");
    act(() => {
      newMeasureNodes.forEach((node, index) =>
        node.props.onLayout({ nativeEvent: { layout: { width: index + 10 } } }),
      );
    });
    expect(renderer.root.findAllByType(TextInput).length).toBeGreaterThan(8);
  });

  test("TICKER-BVA-001 handles empty native frames and clamps the lane index", () => {
    const renderer = renderTicker({
      value: "word",
      animatedText: animatedText([], 10),
      motionRecipe,
      align: "center",
      fractionScale: 0.5,
    });

    const lanes = renderer.root.findAllByType(TextInput);
    expect(lanes).toHaveLength(4);
    expect(lanes.map((lane) => lane.props.defaultValue).join("")).toBe("word");

    const measurements = renderer.root
      .findAllByType(Text)
      .filter((node) => typeof node.props.onLayout === "function");
    act(() => {
      measurements.forEach((node, index) =>
        node.props.onLayout({ nativeEvent: { layout: { width: index + 1 } } }),
      );
    });
    expect(renderer.root.findAllByType(TextInput)).toHaveLength(4);
  });
});
