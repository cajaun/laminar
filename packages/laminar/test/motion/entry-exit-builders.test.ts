import {
  createLeadingEnterTransition,
  createLeadingExitTransition,
  createShiftTransition,
} from "../../src/motion/entry-exit-builders";

const easing = ((value: number) => value) as never;

describe("shift transition builder", () => {
  test("ET-DT-004 leading elements scale in", () => {
    const transition = createLeadingEnterTransition({
      durationMs: 380,
      easing,
    });

    expect(transition({} as never)).toMatchObject({
      initialValues: {
        opacity: 0,
        transform: [{ scale: 0.5 }],
      },
      animations: {
        opacity: expect.anything(),
        transform: [{ scale: expect.anything() }],
      },
    });
  });

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

  test("ET-DT-003 leading element exits left while fading", () => {
    const transition = createLeadingExitTransition({
      durationMs: 380,
      easing,
      leadingGap: 4,
    });

    expect(
      transition({ currentOriginX: 40, currentWidth: 18 } as never)
    ).toMatchObject({
      initialValues: {
        opacity: 1,
        originX: 40,
      },
      animations: {
        opacity: expect.anything(),
        originX: expect.objectContaining({ toValue: 18 }),
      },
    });
  });

  test("ET-DT-005 leading replacement also scales the outgoing element", () => {
    const transition = createLeadingExitTransition({
      durationMs: 380,
      easing,
      leadingGap: 4,
      scale: true,
    });

    expect(
      transition({ currentOriginX: 40, currentWidth: 18 } as never)
    ).toMatchObject({
      initialValues: { transform: [{ scale: 1 }] },
      animations: { transform: [{ scale: expect.anything() }] },
    });
  });
});
