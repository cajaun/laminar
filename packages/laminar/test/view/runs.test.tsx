import React from "react";
import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import type { MotionRecipe } from "../../src/types";
import { NumberRun } from "../../src/view/number-run";
import { SlotsRun } from "../../src/view/slots-run";
import { TextRun } from "../../src/view/text-run";

const enterTransition = jest.fn(() => ({
  initialValues: {},
  animations: {},
}));
const exitTransition = jest.fn(() => ({
  initialValues: {},
  animations: {},
}));
const driveNumber = jest.fn((value: number) => value);
const motionRecipe: MotionRecipe = {
  durationMs: 120,
  easing: ((value: number) => value) as never,
  layoutTransition: {} as never,
  enterTransition,
  exitTransition,
  driveNumber,
};

describe("rendered run contracts", () => {
  test("RUN-ST-001 TextRun suppresses enter on mount and enables it after change", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <TextRun
          value="AB"
          motionRecipe={motionRecipe}
          align="left"
        />
      );
    });
    expect(
      renderer.root.findAllByType(Text).every((text) => !text.props.entering)
    ).toBe(true);

    act(() => {
      renderer.update(
        <TextRun
          value="AC"
          motionRecipe={motionRecipe}
          align="left"
        />
      );
    });
    expect(
      renderer.root.findAllByType(Text).some((text) => text.props.entering)
    ).toBe(true);
  });

  test("RUN-ST-002 NumberRun preserves lead text and staggers lane updates", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <NumberRun
          value="$12"
          motionRecipe={motionRecipe}
          align="right"
          staggerMs={15}
        />
      );
    });

    expect(renderer.root.findAllByType(Text)[0].props.children).toBe("$");
    act(() => {
      renderer.update(
        <NumberRun
          value="$13"
          motionRecipe={motionRecipe}
          align="right"
          staggerMs={15}
        />
      );
    });
    expect(renderer.root.findAllByType(Text).length).toBeGreaterThan(2);
  });

  test("RUN-DT-001 SlotsRun renders lead and punctuation without slot reels", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <SlotsRun
          value="$1.2"
          motionRecipe={motionRecipe}
          align="center"
          staggerMs={10}
        />
      );
    });
    const contents = renderer.root.findAllByType(Text).map((node) => node.props.children);

    expect(contents).toContain("$");
    expect(contents).toContain(".");
    expect(
      contents.some(
        (value) => typeof value === "string" && value.includes("\n")
      )
    ).toBe(false);
    expect(contents.filter((value) => value === 0).length).toBeGreaterThan(2);
  });

  test("RUN-BVA-001 SlotsRun derives bounded height from font inputs", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <SlotsRun
          value="0"
          motionRecipe={motionRecipe}
          align="left"
          fontSize={1}
          textStyle={{ lineHeight: 8 }}
          staggerMs={0}
        />
      );
    });
    const probe = renderer.root
      .findAllByType(Text)
      .find((node) => node.props.children === "0");

    expect(probe).toBeDefined();
    expect(probe!.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ lineHeight: 12 })])
    );
  });

  test("RUN-ST-003 SlotsRun drives changed digits and cleanup through recipe", () => {
    driveNumber.mockClear();
    let renderer!: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <SlotsRun
          value="8"
          motionRecipe={motionRecipe}
          align="left"
          staggerMs={0}
        />
      );
    });
    act(() => {
      renderer.update(
        <SlotsRun
          value="9"
          motionRecipe={motionRecipe}
          align="left"
          staggerMs={0}
        />
      );
    });
    expect(driveNumber).toHaveBeenCalledWith(expect.any(Number), 0);

    act(() => renderer.unmount());
    expect(driveNumber.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  test("RUN-PERF-001 SlotsRun reuses reels across equivalent style objects", () => {
    let renderer!: TestRenderer.ReactTestRenderer;
    const renderSlots = (fontSize: number) => (
      <SlotsRun
        value="12"
        motionRecipe={motionRecipe}
        align="left"
        textStyle={{
          fontSize,
          fontVariant: ["tabular-nums"],
        }}
        staggerMs={0}
      />
    );

    act(() => {
      renderer = TestRenderer.create(renderSlots(20));
    });
    act(() => {
      renderer.update(renderSlots(20));
    });
    act(() => {
      renderer.update(renderSlots(24));
    });

    expect(renderer.root.findAllByType(Text).length).toBeGreaterThan(60);
  });
});
