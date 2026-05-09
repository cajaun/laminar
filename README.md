# Laminar

Laminar is a React Native animation system for morphing text and numeric strings. It is built around one exported component, `MorphingText`, which can animate ordinary text or digit-aware numeric values.

The goal is simple: when a value changes, the user should be able to understand the change without seeing a hard swap, a layout jump, or a clipped intermediate state.

**Replace abrupt content swaps with motion that explains what changed.**

## Demo

https://github.com/user-attachments/assets/d77553b3-0052-4a53-981f-7a954c0a04ac

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture & How It Works](#architecture--how-it-works)
  - [First Principles](#first-principles)
  - [Grapheme-Safe Segmentation](#grapheme-safe-segmentation)
  - [LCS-Based Reconciliation](#lcs-based-reconciliation)
  - [Digit Lane System](#digit-lane-system)
  - [Auto-Sizing](#auto-sizing)
  - [Motion Control & Presets](#motion-control--presets)
  - [UI Thread Performance](#ui-thread-performance)
- [API Reference](#api-reference)
  - [MorphingText](#morphingtext)
  - [Animation Presets](#animation-presets)
  - [Customization Options](#customization-options)
- [Core Concepts](#core-concepts)
  - [Text Morphing](#text-morphing)
  - [Numeric Morphing](#numeric-morphing)
  - [Layout Stability](#layout-stability)
  - [Clipping & Containment](#clipping--containment)
- [Usage Examples](#usage-examples)
  - [Basic Text Animation](#basic-text-animation)
  - [Numeric Counter](#numeric-counter)
  - [Auto-Sizing Inside a Button](#auto-sizing-inside-a-button)
  - [Standalone Text Without Auto-Sizing](#standalone-text-without-auto-sizing)
  - [Custom Motion Controls](#custom-motion-controls)
- [Advanced Topics](#advanced-topics)
  - [Performance Optimization](#performance-optimization)
  - [Measuring & Layout Computation](#measuring--layout-computation)
  - [Handling Rapid Updates](#handling-rapid-updates)
  - [Emoji & Complex Characters](#emoji--complex-characters)
- [Best Practices](#best-practices)
  - [When to Use Laminar](#when-to-use-laminar)
  - [Container Sizing](#container-sizing)
  - [Animation Timing](#animation-timing)
  - [Memory Efficiency](#memory-efficiency)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## Overview

Every changing label has two jobs:

1. Show the next value.
2. Preserve enough visual continuity that the user can understand how the old value became the new one.

A normal React render only solves the first job. If the string changes from `Craft` to `Creative`, React can render `Creative`, but it does not know that `C`, `r`, `a`, `t` should feel stable while `i`, `v`, and `e` enter.

Laminar adds the missing layer:

1. Split the value into visible units.
2. Decide which units are the same across renders.
3. Give stable units stable keys.
4. Animate entering, exiting, and repositioning units.
5. Optionally animate the width reserved by the component.

### What Makes Laminar Different

- **One component, two modes**: `MorphingText` handles both `variant="text"` and `variant="number"`.
- **Grapheme-aware text**: emoji, accents, and combined Unicode characters are treated as visible units, not raw code units.
- **Stable identity**: unchanged glyphs keep their keys through LCS reconciliation.
- **Digit-aware numbers**: numeric strings are aligned by lanes so place values stay understandable.
- **Auto-size by measurement**: layout width is driven by a hidden final-text probe, not by the live animated glyph row.
- **UI-thread animation**: Reanimated drives layout, opacity, transforms, and width animation.
- **Composable styling**: text styles, container styles, class names, presets, and clipping are exposed through props.

---

## Key Features

### Text Morphing

Text morphing answers a first-principles question:

> Which visual pieces are still the same, and which pieces need to enter or leave?

Laminar uses this answer to:

- keep matching letters mounted;
- fade new letters in;
- fade removed letters out;
- animate kept letters into their new positions;
- avoid animating the whole string as one opaque block.

### Numeric Morphing

Numeric morphing starts from a different constraint:

> A digit is not just a character. Its position in the number gives it meaning.

For example, in `148.21`, the `4` means forty. In `43.21`, the `4` means forty too, even though the string is shorter. The number renderer therefore aligns the right side of the numeric body so matching place-value lanes can stay stable.

### Layout Stability

Changing text can change width. Width changes are dangerous if they are measured from animated content, because animated content can report intermediate sizes.

Laminar separates the jobs:

- the hidden measurement text reports the final width;
- the visible glyph row performs the morph animation;
- the outer viewport animates to the measured width.

This prevents the autosize system from chasing its own animated children.

### Motion Customization

Motion is controlled through presets and duration overrides:

- `default`
- `smooth`
- `snappy`
- `bouncy`

The component also accepts `animationDuration` and `stagger`.

### Performance

Laminar uses React Native Reanimated so animation work can run on the UI thread.

The JavaScript side decides the next glyph model. The UI side animates layout, opacity, transforms, and width.

### Clip Management

`clipToBounds` controls whether the animated viewport hides overflow.

- Use `clipToBounds={true}` when a pill, badge, or compact surface should contain the animation.
- Use `clipToBounds={false}` when entering or exiting glyphs should be allowed to breathe outside the current bounds.

---

## Installation

### Prerequisites

This repository is an Expo / React Native project. The morphing component relies on:

- React Native
- React Native Reanimated
- React

The current app also uses Expo Router, Gesture Handler, Keyboard Controller, and Uniwind, but the morphing text component itself is centered on React Native and Reanimated.

### Project Setup

```bash
npm install
```

For iOS native builds, install pods after dependencies if your workflow requires it:

```bash
cd ios
pod install
```

### Import Path In This Repository

```tsx
import { MorphingText } from "@/morphing-text";
```

If you extract `morphing-text` into a package, export the same `MorphingText` component from your package entrypoint and import from that package name instead.

### Reanimated Setup

Reanimated must be configured for the app. In a normal React Native project, follow the Reanimated installation guide for your platform:

https://docs.swmansion.com/react-native-reanimated/

---

## Quick Start

### Basic Text Animation

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { MorphingText } from "@/morphing-text";

export default function Example() {
  const [word, setWord] = useState("Craft");

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <MorphingText
        text={word}
        fontSize={40}
        style={{ color: "#000000", fontWeight: "600" }}
      />

      <Button
        title="Morph"
        onPress={() => setWord((value) => value === "Craft" ? "Creative" : "Craft")}
      />
    </View>
  );
}
```

### Numeric Counter

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { MorphingText } from "@/morphing-text";

export default function Counter() {
  const [count, setCount] = useState(148.21);

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <MorphingText
        text={count.toLocaleString()}
        variant="number"
        fontSize={40}
        animationPreset="snappy"
        style={{ color: "#000000", fontVariant: ["tabular-nums"] }}
      />

      <Button title="Change" onPress={() => setCount(43.21)} />
    </View>
  );
}
```

### With Auto-Sizing

```tsx
<MorphingText
  text={word}
  autoSize
  fontSize={40}
  style={{ color: "#ffffff", fontWeight: "600" }}
/>
```

`autoSize` defaults to `true`. It is written explicitly above because it is an important layout decision.

---

## Architecture & How It Works

Laminar is easiest to understand if each topic starts from the same first-principles pattern:

1. What is the physical UI problem?
2. What information is needed to solve it?
3. What can be inferred from the previous and next values?
4. What must be animated, and what must stay stable?
5. What does the implementation do with that answer?

### First Principles

#### 1. A text string is not the same thing as visible text

JavaScript strings are sequences of code units. Users see glyphs and grapheme clusters. Those are not always the same thing.

Deduction:

- If animation uses raw string indexes, complex characters can split incorrectly.
- Therefore, Laminar must split by visible display units before it assigns animation identity.

Implementation:

```ts
const units = splitDisplayUnits(value);
```

#### 2. A changing value has old identity and new layout

React can tell that props changed. It cannot automatically tell which glyphs should keep their identity.

Deduction:

- If every glyph gets a new key, everything remounts.
- If matching glyphs keep their keys, unchanged pieces can stay visually stable.
- Therefore, Laminar reconciles old units against new units before rendering.

#### 3. Measurement and animation should not be the same job

A live animated row can have unstable intermediate sizes.

Deduction:

- If autosize measures the live animated row, width can feed back into layout.
- Feedback loops create jitter.
- Therefore, autosize should measure a stable final representation and animate the outer width toward that value.

### Grapheme-Safe Segmentation

Problem:

Text is not always one visible glyph per JavaScript character.

Example:

```ts
"Cafe\u0301" // visually "Cafe" with an accent on e
```

The final accented character may be represented by multiple code points. Emoji sequences can be even more complex.

Implementation:

```ts
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
```

Breakdown:

- `Intl.Segmenter` is used when available.
- The granularity is `grapheme`, which means visible text units.
- If `Intl.Segmenter` is unavailable, the fallback is `Array.from(input)`.
- Plain spaces are normalized to non-breaking spaces when measuring/rendering units so they keep width.

Practical result:

```tsx
<MorphingText text="Café" />
```

The accented character is treated as one display unit during reconciliation and animation.

### LCS-Based Reconciliation

Problem:

When `Craft` becomes `Creative`, not every letter is new. The animation should preserve what the user can recognize.

Inductive observation:

Across many text transitions, the best-looking morphs usually keep the longest shared sequence stable.

Deduction:

- The longest shared ordered sequence is the Longest Common Subsequence.
- If those shared units keep their keys, React and Reanimated can animate only the actual differences.

Example:

```txt
previous: Craft
next:     Creative

shared units: C r a t
new units:        e i v e
removed units:      f
```

Implementation shape:

```ts
const matches = computeLcsPairs(previousUnits, nextUnits);
```

Render consequence:

- shared units reuse previous keys;
- new units receive new keys;
- removed units exit because their previous keys disappear from the next render.

Visual consequence:

- stable letters feel anchored;
- new letters fade in;
- removed letters fade out;
- kept letters move through layout transitions instead of blinking.

### Digit Lane System

Problem:

Numbers carry meaning through place value.

`148.21 -> 43.21` is not only a text change. The rightmost digits, decimal point, and fractional values should remain understandable.

Deduction:

- Prefix text before the first digit should be treated separately.
- The numeric body should align from the right so place values keep stable lanes.
- The direction of the numeric change can be inferred by parsing the numeric magnitude.

Implementation:

```ts
const direction = Math.sign(nextNumber - previousNumber);
```

Lane model:

```txt
previous: 1 4 8 . 2 1
next:       4 3 . 2 1

right side aligns so decimal/fractional lanes can remain stable
```

Rendering:

- `NumberRun` splits the value into units.
- `useNumericLanes` returns lane keys, direction, and prefix length.
- `NumberLane` renders a hidden probe for lane layout and an animated token on top.
- Digit tokens shift vertically according to direction.

Practical result:

```tsx
<MorphingText
  text="$148.21"
  variant="number"
  animationPreset="snappy"
/>
```

The string may include currency symbols and separators. Direction is inferred by stripping non-numeric characters and comparing the parsed values.

### Auto-Sizing

Problem:

Sometimes the text sits inside a container that should size to the word, such as a button, badge, or pill.

If the word changes from `Craft` to `Creative`, the reserved width must change too.

Naive implementation:

```tsx
<Animated.View style={{ width }}>
  <View onLayout={measureLiveAnimatedGlyphRow}>
    <TextRun />
  </View>
</Animated.View>
```

Why that can jitter:

1. The glyph row is animating.
2. Entering letters and exiting letters can affect measured layout.
3. The parent width animates based on that measurement.
4. The parent width can affect child layout.
5. The child layout reports another intermediate measurement.

That is a feedback loop:

```txt
animated glyph row -> measured width -> animated parent width -> child layout -> measured width
```

Current implementation:

```tsx
<View style={hiddenMeasurementStyle}>
  <Text onLayout={captureLayout}>{finalText}</Text>
</View>

<Animated.View style={animatedWidthStyle}>
  <TextRun />
</Animated.View>
```

Breakdown:

- The hidden `Text` is plain final text.
- It is absolute, transparent, ignored by pointer events, and hidden from accessibility.
- It reports the final width through `onLayout`.
- `useInlineAutoWidth` animates the outer width to that measured value.
- The visible glyph row is no longer the measurement source.

Why it does not jitter anymore:

- The autosize target is stable.
- The target comes from final text, not intermediate animated glyphs.
- Width animation no longer chases the live row while the live row is changing.

Practical rule:

```tsx
// A button, badge, chip, or pill should usually autosize.
<MorphingText text={label} autoSize />

// Standalone text can disable autosize for the purest glyph flow.
<MorphingText text={label} autoSize={false} />
```

Important distinction:

`autoSize=true` and `autoSize=false` do not have to feel identical. They solve different layout problems.

- `autoSize=true` is layout-aware. The outside surface can grow and shrink with the value.
- `autoSize=false` is pure text morphing. The text does not reserve animated width for a parent.

### Motion Control & Presets

Problem:

Different UI moments need different motion.

Deduction:

- A counter should usually feel quick.
- A label morph can feel smoother.
- A playful surface may tolerate bounce.
- The component should expose named presets instead of forcing every callsite to define timing.

Available presets:

| Preset | Meaning | Default Duration |
| --- | --- | --- |
| `default` | Smooth cubic-bezier timing for text | `380ms` |
| `smooth` | Spring with no bounce | `400ms` |
| `snappy` | Spring with light bounce | `350ms` |
| `bouncy` | Spring with more bounce | `500ms` |

Usage:

```tsx
<MorphingText text={word} animationPreset="smooth" />
<MorphingText text={count} variant="number" animationPreset="snappy" />
```

Override duration:

```tsx
<MorphingText
  text={word}
  animationPreset="default"
  animationDuration={520}
/>
```

`animationDuration` is in milliseconds.

### UI Thread Performance

Problem:

React renders on the JavaScript thread, but animation should not pause every time JavaScript is busy.

Deduction:

- JavaScript should decide what changed.
- The UI thread should drive the animation frames.

Laminar uses Reanimated for:

- layout transitions;
- entering and exiting transitions;
- width animation;
- opacity and transform animation.

Flow:

```txt
React state changes
-> Laminar reconciles glyph identity
-> Reanimated receives layout/enter/exit work
-> UI thread animates frames
```

---

## API Reference

### MorphingText

`MorphingText` is the exported component.

```tsx
import { MorphingText } from "@/morphing-text";
```

#### Props

```ts
type MorphingTextProps = {
  text: string | number;
  variant?: "text" | "number";
  fontSize?: number;
  color?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  fontStyle?: StyleProp<TextStyle>;
  animationDuration?: number;
  animationPreset?: "default" | "smooth" | "snappy" | "bouncy";
  stagger?: number;
  autoSize?: boolean;
  clipToBounds?: boolean;
};
```

#### Prop Breakdown

| Prop | Default | Meaning |
| --- | --- | --- |
| `text` | Required | The value to render and animate. Numbers are converted to strings. |
| `variant` | `"text"` | Use `"text"` for LCS glyph morphing and `"number"` for digit lanes. |
| `fontSize` | Undefined | Convenience text size merged into the text style. |
| `color` | Undefined | Convenience color merged into the text style. |
| `className` | Undefined | Class name passed to rendered text nodes. |
| `style` | Undefined | Text style applied after base `fontSize` and `color`. |
| `containerClassName` | Undefined | Class name for the outer viewport shell. |
| `containerStyle` | Undefined | Style for the outer viewport shell. |
| `fontStyle` | Undefined | Additional text style merged before `style`. |
| `animationDuration` | Preset duration | Duration override in milliseconds. |
| `animationPreset` | `"default"` for text, `"snappy"` for number | Named motion recipe. |
| `stagger` | `0.02` | Seconds between numeric lane delays. Currently used by number rendering. |
| `autoSize` | `true` | Animate reserved width to the measured final text width. |
| `clipToBounds` | `false` | Hide overflow from the animated viewport when true. |

#### Text Example

```tsx
<MorphingText
  text="Creative"
  fontSize={40}
  animationPreset="default"
  style={{
    color: "#000000",
    fontFamily: "Sf-semibold",
  }}
/>
```

#### Number Example

```tsx
<MorphingText
  text="$148.21"
  variant="number"
  fontSize={32}
  animationPreset="snappy"
  style={{
    color: "#000000",
    fontVariant: ["tabular-nums"],
  }}
/>
```

### Animation Presets

The preset decides three related things:

1. the default duration;
2. the easing or spring behavior;
3. how `driveNumber` animates measured widths.

```tsx
<MorphingText text={word} animationPreset="default" />
<MorphingText text={word} animationPreset="smooth" />
<MorphingText text={word} animationPreset="snappy" />
<MorphingText text={word} animationPreset="bouncy" />
```

### Customization Options

#### Text Styling

```tsx
<MorphingText
  text={label}
  fontSize={28}
  color="#111111"
  fontStyle={{ fontFamily: "Sf-semibold" }}
  style={{ letterSpacing: 0 }}
/>
```

Style merge order:

1. internal base style, including `includeFontPadding: false`;
2. `fontSize` and `color`;
3. `fontStyle`;
4. `style`.

#### Container Styling

```tsx
<MorphingText
  text={label}
  containerStyle={{ alignSelf: "center" }}
  style={{ color: "#ffffff", fontSize: 24 }}
/>
```

Use `containerStyle` for placement. Use `style` for text appearance.

---

## Core Concepts

### Text Morphing

First principle:

> A morph is understandable when stable visual units stay stable.

Breakdown:

1. The incoming `text` is converted to a string.
2. The string is split into display units.
3. The new units are reconciled with the previous units.
4. Shared units reuse keys.
5. New units receive new keys and enter.
6. Missing old units exit.
7. Reanimated layout transitions move kept units into place.

Example:

```txt
Craft -> Creative

C stays
r stays
a stays
f exits
t stays but moves
e enters
i enters
v enters
e enters
```

### Numeric Morphing

First principle:

> A number should preserve place-value meaning while it changes.

Breakdown:

1. The value is converted to a string.
2. The first digit is found.
3. Prefix content before the first digit is handled as lead content.
4. The remaining numeric body is right-aligned against the previous body.
5. Matching lanes keep their keys.
6. Changed lanes get new token keys.
7. Direction is inferred from numeric magnitude.
8. Digit tokens enter and exit vertically.

Example:

```txt
$148.21 -> $43.21

prefix: "$"
numeric body aligns from the right
direction: down, because 43.21 < 148.21
```

### Layout Stability

First principle:

> Layout should be driven by stable information, not by animated intermediates.

Laminar uses:

- stable glyph keys for text;
- stable lane keys for numbers;
- hidden measurement text for autosize;
- an animated viewport width for layout reservation.

This means the visible animation can be expressive while the parent layout receives predictable width updates.

### Clipping & Containment

First principle:

> Overflow is either part of the visual design or a bug.

Use clipping when the surface should contain the animation:

```tsx
<MorphingText text={label} clipToBounds />
```

Allow overflow when the animation should be visible outside the current measured width:

```tsx
<MorphingText text={label} clipToBounds={false} />
```

---

## Usage Examples

### Basic Text Animation

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { MorphingText } from "@/morphing-text";

export default function BasicTextAnimation() {
  const [word, setWord] = useState("Craft");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <MorphingText
        text={word}
        fontSize={40}
        style={{ color: "#000000", fontFamily: "Sf-semibold" }}
      />

      <Button
        title="Morph"
        onPress={() => {
          setWord((current) => current === "Craft" ? "Creative" : "Craft");
        }}
      />
    </View>
  );
}
```

### Numeric Counter

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { MorphingText } from "@/morphing-text";

export default function NumericCounter() {
  const [value, setValue] = useState(148.21);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <MorphingText
        text={value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        variant="number"
        fontSize={40}
        animationPreset="snappy"
        style={{ color: "#000000", fontVariant: ["tabular-nums"] }}
      />

      <Button title="Change" onPress={() => setValue(43.21)} />
    </View>
  );
}
```

### Auto-Sizing Inside a Button

Use this when the button should grow and shrink with the text.

```tsx
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { MorphingText } from "@/morphing-text";

export default function MorphButton() {
  const [word, setWord] = useState("Craft");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Pressable
        onPress={() => setWord((value) => value === "Craft" ? "Creative" : "Craft")}
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          borderRadius: 36,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <MorphingText
          text={word}
          autoSize
          fontSize={40}
          style={{ color: "#ffffff", fontFamily: "Sf-semibold" }}
        />
      </Pressable>
    </View>
  );
}
```

### Standalone Text Without Auto-Sizing

Use this when the word is not responsible for sizing a parent surface.

```tsx
<MorphingText
  text={word}
  autoSize={false}
  fontSize={40}
  style={{ color: "#000000", fontFamily: "Sf-semibold" }}
/>
```

Practical difference:

- `autoSize=true`: the component reserves animated width for its parent.
- `autoSize=false`: the glyph animation runs without an animated width wrapper.

### Custom Motion Controls

```tsx
<MorphingText
  text={status}
  animationPreset="bouncy"
  animationDuration={520}
  fontSize={24}
  style={{
    color: "#007aff",
    fontFamily: "Sf-semibold",
  }}
/>
```

---

## Advanced Topics

### Performance Optimization

First principle:

> Optimize the thing that is actually repeated.

Laminar already keeps animation work on the UI thread. Most performance issues come from too many React state updates, too many simultaneous morphing components, or values changing faster than the animation can be understood.

Use shorter durations for rapid values:

```tsx
<MorphingText
  text={liveValue}
  variant="number"
  animationDuration={220}
/>
```

Disable autosize when a parent already has fixed width:

```tsx
<View style={{ width: 120 }}>
  <MorphingText text={price} variant="number" autoSize={false} />
</View>
```

Memoize expensive formatting:

```tsx
const label = React.useMemo(
  () => value.toLocaleString("en-US"),
  [value]
);

<MorphingText text={label} variant="number" />
```

### Measuring & Layout Computation

Autosize has two independent layers.

Measurement layer:

```txt
hidden final Text -> onLayout -> measured width
```

Visible layer:

```txt
TextRun or NumberRun -> animated glyphs
```

Reservation layer:

```txt
Animated.View width -> parent layout can grow or shrink
```

The hidden layer exists because the visible layer is not a stable measuring instrument while it animates.

### Handling Rapid Updates

First principle:

> If updates arrive faster than users can perceive the transition, animation becomes noise.

For frequent updates:

- reduce `animationDuration`;
- reduce numeric `stagger`;
- debounce the displayed value;
- disable autosize when width changes are not important.

Example:

```tsx
<MorphingText
  text={quote}
  variant="number"
  animationPreset="snappy"
  animationDuration={180}
  stagger={0.01}
/>
```

### Emoji & Complex Characters

Laminar segments by grapheme when possible:

```tsx
<MorphingText text="Café" />
<MorphingText text="👋 Hello" />
<MorphingText text="👩‍💻" />
```

Breakdown:

- accented letters should move as one visible unit;
- emoji modifiers should stay attached to their base emoji;
- zero-width-joiner sequences should not be split into broken pieces.

---

## Best Practices

### When to Use Laminar

Good use cases:

- button labels that morph between actions;
- badge text;
- status labels;
- counters;
- prices;
- compact metrics;
- short strings where continuity helps comprehension.

Poor use cases:

- long paragraphs;
- static copy that does not change;
- text that must update instantly with no motion;
- values changing so quickly that animation hides the current state.

### Container Sizing

Use `autoSize=true` when the text is responsible for sizing its parent.

```tsx
<Pressable style={buttonStyle}>
  <MorphingText text={label} autoSize />
</Pressable>
```

Use `autoSize=false` when the parent already defines the space.

```tsx
<View style={{ width: 220, alignItems: "center" }}>
  <MorphingText text={label} autoSize={false} />
</View>
```

Practical rule:

- Buttons, chips, badges: start with `autoSize=true`.
- Standalone centered words: consider `autoSize=false`.
- Fixed-width counters: use `autoSize=false`.
- Dynamic inline labels: use `autoSize=true`.

### Animation Timing

Use timing based on the user's task:

| Duration | Best For |
| --- | --- |
| `180ms - 260ms` | rapid counters or live data |
| `300ms - 450ms` | normal labels and buttons |
| `500ms - 700ms` | expressive UI moments |

Examples:

```tsx
<MorphingText text={label} animationDuration={380} />
<MorphingText text={price} variant="number" animationDuration={220} />
```

### Memory Efficiency

Keep inputs stable and small.

Good:

```tsx
const formattedPrice = React.useMemo(
  () => `$${price.toFixed(2)}`,
  [price]
);

<MorphingText text={formattedPrice} variant="number" />
```

Avoid using a changing `key` on `MorphingText`:

```tsx
// Avoid this. It forces a remount and loses previous glyph identity.
<MorphingText key={label} text={label} />
```

Use this instead:

```tsx
<MorphingText text={label} />
```

---

## Troubleshooting

### Animations Not Playing

Symptom:

The text changes instantly.

Check:

1. Reanimated is installed and configured.
2. The component is not being remounted with a changing `key`.
3. The parent is not conditionally unmounting `MorphingText`.
4. Updates are not arriving so quickly that each animation is interrupted.

### Content Clipping

Symptom:

Entering or exiting glyphs are cut off.

Check:

1. If overflow should be visible, set `clipToBounds={false}`.
2. If the parent has fixed width, make sure the expected text can fit.
3. If the text sits inside a pill or button, decide whether clipping is part of the design.

### Numbers Misaligned

Symptom:

Digits feel jumpy or hard to read.

Check:

1. Use `variant="number"`.
2. Keep formatting consistent between renders.
3. Prefer tabular numbers when your font supports them:

   ```tsx
   <MorphingText
     text={value}
     variant="number"
     style={{ fontVariant: ["tabular-nums"] }}
   />
   ```

### Performance Drops

Symptom:

Animations stutter or feel delayed.

Check:

1. Too many morphing components may be updating at once.
2. The JavaScript thread may be doing expensive formatting each render.
3. Animation duration may be too long for the update frequency.
4. Reanimated may not be configured correctly.

### Auto-Sizing Not Working

Symptom:

The parent does not resize with the text.

Check:

1. `autoSize` is not set to `false`.
2. The parent allows its child to define width.
3. The parent does not force a fixed width that hides the autosize effect.

Example:

```tsx
// The button can grow because the child controls width.
<Pressable style={{ paddingHorizontal: 24 }}>
  <MorphingText text={label} autoSize />
</Pressable>
```

---

## Contributing

### Development Setup

```bash
git clone https://github.com/yourusername/laminar.git
cd laminar
npm install
```

### Running The App

```bash
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Code Quality

- Keep docs aligned with the actual public props.
- Preserve glyph identity when changing rendering code.
- Avoid measuring live animated rows for autosize.
- Add examples when changing behavior that affects layout or motion.

---

## License

No license file is currently present in this workspace. Add a license file before distributing or publishing the package.

---

## Resources

- **Reanimated Docs**: https://docs.swmansion.com/react-native-reanimated/
- **React Native Performance**: https://reactnative.dev/docs/performance
- **Unicode Grapheme Clusters**: https://www.unicode.org/reports/tr29/
- **Longest Common Subsequence**: https://en.wikipedia.org/wiki/Longest_common_subsequence

---

**Built with care for smooth, understandable animation.**
