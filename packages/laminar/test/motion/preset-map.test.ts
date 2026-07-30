import {
  MOTION_PRESETS,
  resolveMotionRecipe,
} from "../../src/motion/preset-map";

describe("motion recipe resolution", () => {
  test.each([
    ["MP-EP-001 default", "default", 380],
    ["MP-EP-002 smooth", "smooth", 400],
    ["MP-EP-003 snappy", "snappy", 350],
    ["MP-EP-004 bouncy", "bouncy", 500],
  ] as const)("%s resolves documented preset duration", (_id, preset, duration) => {
    expect(resolveMotionRecipe(preset).durationMs).toBe(duration);
  });

  test("MP-BVA-001 accepts a zero duration override without falling back", () => {
    expect(resolveMotionRecipe("default", 0).durationMs).toBe(0);
  });

  test("MP-BVA-002 preserves an explicit fractional millisecond override", () => {
    expect(resolveMotionRecipe("snappy", 16.5).durationMs).toBe(16.5);
  });

  test.each(["default", "smooth", "snappy", "bouncy"] as const)(
    "MP-DT-001 %s supplies every motion contract member",
    (preset) => {
      const recipe = resolveMotionRecipe(preset, 120);

      expect(recipe.layoutTransition).toBeDefined();
      expect(typeof recipe.enterTransition).toBe("function");
      expect(typeof recipe.exitTransition).toBe("function");
      expect(typeof recipe.driveNumber).toBe("function");
      expect(recipe.driveNumber(42)).toBeDefined();
      expect(recipe.driveNumber(42, 20)).toBeDefined();
    }
  );

  test("MP-DT-002 timing enter and exit transitions invert opacity", () => {
    const recipe = resolveMotionRecipe("default", 100);

    expect(recipe.enterTransition({} as never)).toMatchObject({
      initialValues: { opacity: 0 },
      animations: { opacity: expect.anything() },
    });
    expect(recipe.exitTransition({} as never)).toMatchObject({
      initialValues: { opacity: 1 },
      animations: { opacity: expect.anything() },
    });
  });

  test("MP-REG-001 preset catalogue remains complete and bounded", () => {
    expect(Object.keys(MOTION_PRESETS).sort()).toEqual([
      "bouncy",
      "default",
      "smooth",
      "snappy",
    ]);

    for (const preset of Object.values(MOTION_PRESETS)) {
      expect(preset.duration).toBeGreaterThan(0);
      if ("bounce" in preset) {
        expect(preset.bounce).toBeGreaterThanOrEqual(0);
        expect(preset.bounce).toBeLessThanOrEqual(1);
      }
    }
  });
});
