import { useMorphMotion } from "../../src/hooks/use-morph-motion";
import type {
  MorphAnimationPresetName,
  MorphContentVariant,
} from "../../src/types";
import { renderHook } from "../support/render-hook";

type Props = {
  variant: MorphContentVariant;
  animationPreset?: MorphAnimationPresetName;
  animationDuration?: number;
  stagger: number;
};

describe("useMorphMotion", () => {
  test.each([
    ["HMM-DT-001 text default", "text", undefined, 380],
    ["HMM-DT-002 number default", "number", undefined, 350],
    ["HMM-DT-003 slots default", "slots", undefined, 350],
    ["HMM-DT-004 explicit override", "number", "smooth", 400],
  ] as const)(
    "%s selects the expected preset",
    (_id, variant, animationPreset, expectedDuration) => {
      const hook = renderHook(
        (props: Props) => useMorphMotion(props),
        { variant, animationPreset, stagger: 0.02 }
      );

      expect(hook.result.motionRecipe.durationMs).toBe(expectedDuration);
    }
  );

  test.each([
    ["HMM-BVA-001 negative stagger", -0.001, -1],
    ["HMM-BVA-002 zero stagger", 0, 0],
    ["HMM-BVA-003 fractional rounding", 0.0015, 2],
  ])("%s converts seconds to rounded milliseconds", (_id, stagger, expected) => {
    const hook = renderHook(
      (props: Props) => useMorphMotion(props),
      { variant: "text", stagger }
    );

    expect(hook.result.staggerMs).toBe(expected);
  });

  test("HMM-ST-001 updates duration when override changes", () => {
    const hook = renderHook(
      (props: Props) => useMorphMotion(props),
      { variant: "text", animationDuration: 100, stagger: 0 }
    );
    const firstRecipe = hook.result.motionRecipe;

    hook.rerender({
      variant: "text",
      animationDuration: 200,
      stagger: 0,
    });

    expect(hook.result.motionRecipe.durationMs).toBe(200);
    expect(hook.result.motionRecipe).not.toBe(firstRecipe);
  });
});
