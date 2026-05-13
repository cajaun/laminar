# Laminar

React Native morphing text and number animation.

```tsx
import { Laminar } from "react-native-laminar";
```

`Laminar` animates changes to a string or number value. Matching characters hold position across transitions. New characters enter. Removed characters exit. Numbers align from the right so place-value columns stay in stable lanes.

---

## Installation

```bash
npm install react-native-laminar
```

Laminar requires [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/). Follow its installation guide before using this package.

---

## Quick Start

### Text

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function Example() {
  const [word, setWord] = useState("Laminar");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Laminar
        text={word}
        fontSize={40}
        style={{ color: "#000000", fontFamily: "System" }}
      />
      <Button
        title="Morph"
        onPress={() => setWord((w) => (w === "Laminar" ? "Linear" : "Laminar"))}
      />
    </View>
  );
}
```

### Number

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function Counter() {
  const [value, setValue] = useState("$1,234");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Laminar
        text={value}
        variant="number"
        fontSize={40}
        animationPreset="snappy"
        style={{ color: "#000000", fontVariant: ["tabular-nums"] }}
      />
      <Button title="Change" onPress={() => setValue("$12,345")} />
    </View>
  );
}
```

### Inside a button with auto-sizing

```tsx
<Pressable style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 36, backgroundColor: "#007aff" }}>
  <Laminar
    text={label}
    autoSize
    fontSize={18}
    style={{ color: "#ffffff" }}
  />
</Pressable>
```

### Centered text in a fixed-width container

Use `align` when the parent owns the width and Laminar should place the animated row inside that space.

```tsx
<Pressable
  style={{
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: "#000000",
  }}
>
  <Laminar
    text={isFinished ? "Continue and Finish" : "Continue"}
    align="center"
    autoSize={false}
    containerStyle={{ width: "100%" }}
    style={{ color: "#ffffff", fontSize: 24, fontWeight: "700" }}
  />
</Pressable>
```

`autoSize` (default `true`) animates the outer container width toward the measured final text width. The button grows and shrinks without layout feedback loops.

### Standalone word without auto-sizing

```tsx
<Laminar
  text={word}
  align="center"
  autoSize={false}
  fontSize={40}
  style={{ color: "#000000" }}
/>
```

Use `autoSize={false}` when the parent already defines the space and you only want the glyph animation.

---

## Props

```ts
type LaminarProps = {
  text: string | number;
  variant?: "text" | "number";
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fontStyle?: StyleProp<TextStyle>;
  animationDuration?: number;
  animationPreset?: "default" | "smooth" | "snappy" | "bouncy";
  stagger?: number;
  autoSize?: boolean;
  clipToBounds?: boolean;
};
```

| Prop                | Default                                     | Description                                                                        |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `text`              | Required                                    | The value to display. Numbers are converted to strings internally.                 |
| `variant`           | `"text"`                                    | `"text"` uses LCS glyph reconciliation. `"number"` uses right-aligned digit lanes. |
| `fontSize`          | Undefined                                   | Convenience prop merged into the text style.                                       |
| `color`             | Undefined                                   | Convenience prop merged into the text style.                                       |
| `align`             | `"left"`                                    | Visual alignment for Laminar's viewport and animated glyph row.                    |
| `style`             | Undefined                                   | Text style applied after `fontSize` and `color`.                                   |
| `containerStyle`    | Undefined                                   | Advanced style override for the outer viewport shell.                              |
| `fontStyle`         | Undefined                                   | Additional text style merged before `style`.                                       |
| `animationDuration` | Preset default                              | Duration override in milliseconds.                                                 |
| `animationPreset`   | `"default"` for text, `"snappy"` for number | Named motion recipe.                                                               |
| `stagger`           | `0.02`                                      | Delay in seconds between numeric lane animations.                                  |
| `autoSize`          | `true`                                      | Animate the outer width to the measured final text width.                          |
| `clipToBounds`      | `false`                                     | Clip animated overflow to the viewport bounds.                                     |

---

## Animation Presets

| Preset    | Character                  | Default Duration |
| --------- | -------------------------- | ---------------- |
| `default` | Smooth cubic-bezier timing | 380ms            |
| `smooth`  | Spring with no bounce      | 400ms            |
| `snappy`  | Spring with light bounce   | 350ms            |
| `bouncy`  | Spring with more bounce    | 500ms            |

```tsx
<Laminar text={word} animationPreset="smooth" />
<Laminar text={count} variant="number" animationPreset="snappy" />

// Override duration
<Laminar text={word} animationPreset="default" animationDuration={520} />
```

---

## Best Practices

**Keep `text` stable — don't change `key`.**

```tsx
// Wrong — forces remount, loses glyph identity
<Laminar key={label} text={label} />

// Correct
<Laminar text={label} />
```

**Choose `autoSize` based on layout role.**

- Buttons, chips, badges → `autoSize={true}`
- Standalone centered words → `autoSize={false}`
- Fixed-width counters → `autoSize={false}`

**Use `align` for visual alignment.**

```tsx
<Laminar text={word} align="center" autoSize={false} />
<Laminar text={price} variant="number" align="right" autoSize={false} />
```

Use `containerStyle` only when you need lower-level control over the outer viewport.

**Match formatting across renders for numbers.**

Switching between `$1,234` and `1234` mid-session breaks lane alignment. Keep the format consistent.

```tsx
// Consistent formatting keeps lanes stable
<Laminar text={`$${value.toLocaleString()}`} variant="number" />
```

**Duration guidelines.**

| Range         | Best for                        |
| ------------- | ------------------------------- |
| 180ms – 260ms | Rapid counters, live data       |
| 300ms – 450ms | Normal labels, button text      |
| 500ms – 700ms | Expressive or teaching moments  |

---

## Troubleshooting

**Animations not playing.**
1. Verify Reanimated is installed and configured.
2. Check that the component is not remounting due to a changing `key`.
3. Check that updates are not arriving faster than the animation duration.

**Glyphs clipped.**
1. Set `clipToBounds={false}` if overflow should be visible.
2. Verify the parent does not have `overflow: "hidden"` set.

**Numbers misaligned or jumpy.**
1. Use `variant="number"`.
2. Keep formatting consistent between renders.
3. Add `fontVariant: ["tabular-nums"]` if your font supports it.

**Auto-sizing not working.**
1. Check that `autoSize` is not explicitly set to `false`.
2. Verify the parent allows its child to define the width — a fixed-width parent overrides the animated child width.

---

## License

See the repository root for license information.
