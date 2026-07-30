import { createShiftTransition } from "../../src/motion/entry-exit-builders";

const easing = ((value: number) => value) as never;

describe("shift transition builder", () => {
  test.each([
    ["ET-DT-001 immediate", 0],
    ["ET-DT-002 delayed", 25],
  ])("%s maps all initial and target values", (_id, delayMs) => {
    const transition = createShiftTransition({
      delayMs,
      durationMs: 180,
      easing,
      fromOpacity: 0.2,
      toOpacity: 0.9,
      fromTranslateY: -12,
      toTranslateY: 3,
      fromScale: 0.5,
      toScale: 1.1,
    });

    expect(transition({} as never)).toMatchObject({
      initialValues: {
        opacity: 0.2,
        transform: [{ translateY: -12 }, { scale: 0.5 }],
      },
      animations: {
        opacity: expect.anything(),
        transform: [
          { translateY: expect.anything() },
          { scale: expect.anything() },
        ],
      },
    });
  });

  test("ET-BVA-001 omitted delay follows the immediate branch", () => {
    const transition = createShiftTransition({
      durationMs: 0,
      easing,
      fromOpacity: 1,
      toOpacity: 0,
      fromTranslateY: 0,
      toTranslateY: 0,
      fromScale: 1,
      toScale: 1,
    });

    expect(transition({} as never).initialValues).toEqual({
      opacity: 1,
      transform: [{ translateY: 0 }, { scale: 1 }],
    });
  });
});
