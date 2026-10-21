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

### Slots

Use `variant="slots"` when each digit should roll through a vertical reel.
In standard mode, prefixes and separators remain ordinary text content.

The default `slotMode="standard"` keeps the current right-aligned place-value
behavior. Set `slotMode="reelStep"` for a full reel roll on the leading digit
and one-slot motion for following digits and separators. Growing values shift
left and scale down to fit their container.

Set `slotMode="input"` for formatted values updated by input edits. It treats
the decimal as a pivot, rematches grouping separators when the integer gains or
loses digits, and recognizes locale-specific separators. Without a locale, a
unique final comma or period is treated as the decimal; pass one for ambiguous
values such as `1,234`. Pass `caretIndex` as the UTF-16 offset in the rendered
string when edits can happen away from the end.

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function SlotCounter() {
  const [value, setValue] = useState("07:42");

  return (
    <View style={{ alignItems: "center", gap: 16 }}>
      <Laminar
        text={value}
        variant="slots"
        fontSize={48}
        animationPreset="snappy"
        shadow
        clipToBounds
        style={{ color: "#000000", fontVariant: ["tabular-nums"] }}
      />
      <Button title="Change" onPress={() => setValue("08:15")} />
    </View>
  );
}
```

```tsx
<Laminar
  text="$288,888"
  variant="slots"
  slotMode="input"
  locale="en-US"
  align="center"
  containerStyle={{ width: "100%" }}
  fontSize={72}
/>
```

The `shadow` prop requires the app to provide the
`@react-native-masked-view/masked-view` and `expo-linear-gradient` peer
dependencies.

### Number ticker

Use `numberMode="ticker"` with `variant="number"` for a clean live-number ticker.
Changed digits refresh in place while unchanged digits remain perfectly still;
this mode deliberately has no vertical reel or viewport mask:

```tsx
<Laminar
  text="$2,459.70"
  variant="number"
  numberMode="ticker"
  fractionScale={0.66}
  style={{ color: "#000000" }}
/>
```

Prefixes, grouping separators, decimals, and unchanged digits stay crisp. The
`shadow` prop applies to slot rendering, including `variant="slots"` and
`numberMode="slots"`.

Pass formatted strings to preserve display details such as trailing zeros:

```tsx
<Laminar text="12.34000000" variant="number" numberMode="ticker" />
```

Use `numberMode="slots"` to render the `number` variant with slot reels. The
`slotMode` prop applies to both `variant="slots"` and `numberMode="slots"`:

```tsx
<Laminar
  text="$2,459.70"
  variant="number"
  numberMode="slots"
  slotMode="reelStep"
/>
```

For UI-driven ticker updates, provide preformatted frames and a Reanimated
shared index. Laminar rounds the index to the nearest zero-based frame and
clamps it to the available range:

```tsx
import { useSharedValue } from "react-native-reanimated";
import { Laminar } from "react-native-laminar";

function AnimatedTicker() {
  const values = ["$1.00", "$12.00", "$120.00"];
  const index = useSharedValue(0);

  return (
    <Laminar
      text={values[0]}
      variant="number"
      numberMode="ticker"
      animatedText={{ index, values }}
    />
  );
}
```

Update `index` from a gesture or animation to select a frame. Keep formatting
in `values`; Laminar displays each string as provided, including decimal zeros.

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

### Auto-sized button with leading icons

Pass a value-keyed `leading` map when the button changes between visual states.
Laminar selects the matching entry and animates icon-to-icon replacements.

```tsx
import { ActivityIndicator, Pressable, Text } from "react-native";
import { Laminar } from "react-native-laminar";

const leading = {
  "Sending Request": <ActivityIndicator color="#ffffff" />,
  "Request Sent!": <Text style={{ color: "#ffffff", fontSize: 20 }}>✓</Text>,
};

<Pressable
  style={{
    alignItems: "center",
    backgroundColor: "#007aff",
    borderRadius: 36,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  }}
>
  <Laminar
    text={status}
    leading={leading}
    leadingGap={5}
    autoSize
    style={{ color: "#ffffff", fontSize: 18, fontWeight: "700" }}
  />
</Pressable>
```

The map key must match the current `text` value. A missing entry means no
leading element, so the icon fades out when the value returns to a plain label.

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

The package exports `LaminarProps` and the supporting public types:

```tsx
import type {
  LaminarAlign,
  LaminarAnimatedText,
  LaminarLeadingMap,
  LaminarProps,
  LaminarShadow,
  LaminarShadowOptions,
  MorphAnimationPresetName,
  MorphContentVariant,
  MorphNumberMode,
  MorphingTextProps,
  SlotMode,
} from "react-native-laminar";
```

```ts
type LaminarProps = MorphingTextProps;
```

| Prop                | Default                                     | Description                                                                        |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `text`              | Required                                    | The value to display. Numbers are converted to strings internally.                 |
| `variant`           | `"text"`                                    | `"text"` uses LCS glyph reconciliation. `"number"` uses right-aligned digit lanes. `"slots"` rolls digits through slot columns using the same lanes. |
| `slotMode`          | `"standard"`                                | With `variant="slots"` or `numberMode="slots"`, `"reelStep"` keeps the full-reel/step motion, while `"input"` matches edited formatted input by glyph role. |
| `locale`            | Undefined                                   | Identifies decimal and grouping separators in `slotMode="input"`; pass it when punctuation could be ambiguous. |
| `caretIndex`        | Undefined                                   | UTF-16 caret offset in the rendered string for edits in `slotMode="input"`. |
| `numberMode`        | `"morph"`                                   | With `variant="number"`, selects digit morphing, the in-place `"ticker"`, or slot reels with `"slots"`. |
| `fractionScale`     | `1`                                          | In ticker mode, scales the decimal separator and fractional digits relative to the main digits. |
| `animatedText`      | Undefined                                   | In ticker mode, selects preformatted values with a shared, zero-based index. |
| `fromValue`         | Undefined                                   | Seeds slot reels with the previously displayed formatted value during a renderer handoff. |
| `preloadValue`      | Undefined                                   | In ticker mode, mounts a hidden slot renderer at this value for a later handoff. |
| `fontSize`          | Undefined                                   | Convenience prop merged into the text style.                                       |
| `color`             | Undefined                                   | Convenience prop merged into the text style.                                       |
| `align`             | `"left"`                                    | Visual alignment for Laminar's viewport and animated glyph row.                    |
| `className`          | Undefined                                   | Utility classes passed to visible text.                                             |
| `leading`           | Undefined                                   | Optional inline element, or value-keyed leading content, rendered by every variant. |
| `leadingKey`        | Undefined                                   | Advanced identity override for a direct leading element.                          |
| `leadingGap`        | `0`                                         | Spacing between the leading element and the first text glyph.                      |
| `shadow`            | `false`                                     | Adds persistent top and bottom alpha fades to slot digit viewports. Accepts `true` or `{ color, size }`. |
| `style`             | Undefined                                   | Text style applied after `fontSize` and `color`.                                   |
| `containerStyle`    | Undefined                                   | Advanced style override for the outer viewport shell.                              |
| `fontStyle`         | Undefined                                   | Additional text style merged before `style`.                                       |
| `animationDuration` | Preset default                              | Duration override in milliseconds.                                                 |
| `animationPreset`   | `"default"` for text, `"snappy"` for number | Named motion recipe; ticker mode defaults to the `ticker` preset.                |
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
| `ticker`  | In-place number ticker timing | 300ms            |

```tsx
<Laminar text={word} animationPreset="smooth" />
<Laminar text={count} variant="number" animationPreset="snappy" />
<Laminar text={count} variant="slots" animationPreset="snappy" />
<Laminar text={count} variant="number" numberMode="slots" shadow />

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
