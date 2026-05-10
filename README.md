# Laminar

Laminar is a React Native animation system for morphing text and numeric strings. The package exports one component, `Laminar` (also available as `MorphingText`), which handles both ordinary text transitions and digit-aware numeric value changes.

Every changing label has two jobs: show the next value, and preserve enough visual continuity that the user understands how the old value became the new one. A normal React render only solves the first job. If a string changes from `Laminar` to `Linear`, React renders `Linear`, but it has no information about which letters should stay mounted, which should fade out, and which should enter. Laminar adds that layer.

[demo]

---

## Table of Contents

- [Overview](#overview)
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
  - [Laminar](#laminar-1)
  - [Animation Presets](#animation-presets)
  - [Customization Options](#customization-options)
- [Core Concepts](#core-concepts)
  - [Text Morphing](#text-morphing)
  - [Numeric Morphing](#numeric-morphing)
  - [Layout Stability](#layout-stability)
  - [Clipping & Containment](#clipping--containment)
- [Demo App](#demo-app)
  - [Text Identity](#text-identity)
  - [Number Identity](#number-identity)
  - [Animation Layer](#animation-layer)
  - [Auto Size](#auto-size)
  - [Editor](#editor)
  - [Words](#words)
  - [Button](#button)
  - [Numbers](#numbers)
  - [Carousel & Pagination](#carousel--pagination)
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

When a value changes, three things can happen to each visible unit in the string:

- It was present before and is present now. It stays mounted and moves if its position changed.
- It is new. It enters.
- It was present before and is gone. It exits.

React cannot make that distinction on its own. It sees a new string prop and re-renders. Laminar sits between the new prop and the render, computes identity across the transition, and assigns each unit the correct enter, exit, or reposition behavior.

For numbers the constraint is different. A digit's meaning comes from its place value, not its position in the string. `$1,234` becoming `$12,345` should keep the `1`, `2`, `3`, `4` digits in their lanes while new digits enter from the correct direction. Laminar aligns numeric strings from the right so place values stay in stable lanes across changes.

Animation runs on the UI thread through Reanimated, so JavaScript being busy does not drop frames.

---

## Installation

### Prerequisites

Laminar is an Expo / React Native project. The component itself depends on:

- React Native
- React Native Reanimated

The demo app also uses Expo Router, Gesture Handler, Keyboard Controller, and Uniwind, but those are not required to use the component.

### Setup

```bash
npm install
```

For iOS native builds:

```bash
cd ios
pod install
```

### Reanimated

Reanimated must be configured in your project. Follow the installation guide for your platform:

https://docs.swmansion.com/react-native-reanimated/

### Import

The package entrypoint is `packages/laminar/src/index.tsx`. Both names export the same component.

```tsx
import { Laminar } from "react-native-laminar";

// MorphingText is an alias for Laminar
import { MorphingText } from "react-native-laminar";
```

---

## Quick Start

### Basic Text Animation

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function Example() {
  const [word, setWord] = useState("Laminar");

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <Laminar
        text={word}
        fontSize={40}
        style={{ color: "#000000", fontFamily: "Sf-semibold" }}
      />
      <Button
        title="Morph"
        onPress={() => setWord((v) => (v === "Laminar" ? "Linear" : "Laminar"))}
      />
    </View>
  );
}
```

[demo]

### Numeric Counter

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function Counter() {
  const [value, setValue] = useState("$1,234");

  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
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

[demo]

### With Auto-Sizing

```tsx
<Laminar
  text={word}
  autoSize
  fontSize={40}
  style={{ color: "#ffffff", fontFamily: "Sf-semibold" }}
/>
```

`autoSize` defaults to `true`. The component measures the final text with a hidden probe and animates the outer width toward that measurement. The container grows and shrinks without layout feedback loops.

---

## Architecture & How It Works

Each topic below follows the same structure: the physical problem, the information available to solve it, the deduction, and the implementation.

### First Principles

#### 1. A JavaScript string is not the same thing as visible text

JavaScript strings are sequences of UTF-16 code units. Users see grapheme clusters. Those are not always the same.

Deduction:

- Raw string indexes can split complex characters mid-animation.
- Laminar must segment by visible display units before assigning animation identity.

Implementation:

```ts
const units = splitDisplayUnits(value);
```

#### 2. A changing value has old identity and new layout

React sees that props changed. It cannot preserve glyph identity across that change on its own.

Deduction:

- If every glyph gets a new key, everything remounts and nothing feels continuous.
- If matching glyphs keep their keys, React and Reanimated animate only the actual differences.
- Laminar reconciles old units against new units before rendering.

#### 3. Measurement and animation must be separate jobs

A live animated row has unstable intermediate sizes.

Deduction:

- Measuring the live animated row feeds intermediate sizes back into layout.
- Feedback loops create width jitter.
- Autosize must measure a stable final representation and animate toward it.

### Grapheme-Safe Segmentation

A JavaScript character and a visible glyph are not always the same unit.

```ts
"Cafe\u0301"; // visually "Café" — the accented e is two code points
```

Emoji sequences can involve even more code points joined by zero-width joiners.

Implementation:

```ts
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
```

Breakdown:

- `Intl.Segmenter` is used when available, with `granularity: "grapheme"` so each segment is one visible unit.
- When unavailable, the fallback is `Array.from(input)`, which handles basic multi-code-point characters.
- Plain spaces are normalized to non-breaking spaces so they preserve width during measurement.

Practical result:

```tsx
<Laminar text="Café" />
<Laminar text="👩‍💻" />
```

Each accented character and each emoji sequence is one display unit during reconciliation and animation, regardless of how many code points it contains.

### LCS-Based Reconciliation

When `Laminar` becomes `Linear`, not every letter is new. The animation looks best when letters that survive keep their positions and letters that enter or exit animate independently.

Inductive observation: morphs that preserve the longest shared sequence of glyphs feel most continuous to the eye.

Deduction:

- The longest shared ordered sequence is the Longest Common Subsequence.
- Shared units keep their previous React keys.
- React and Reanimated animate only the units whose keys changed.

Example:

```txt
previous: Laminar
next:     Linear

shared:   L i n a r
exiting:  m
entering: e
```

Implementation shape:

```ts
const matches = computeLcsPairs(previousUnits, nextUnits);
```

Render consequence:

- Shared units reuse previous keys and move through layout transitions.
- New units receive new keys and enter with fade and offset.
- Removed units exit because their keys disappear from the next render.

[demo]

### Digit Lane System

Numbers carry meaning through place value. `$1,234` and `$12,345` share digits, but the meaning of each digit depends on its column, not its index in the string.

Deduction:

- Prefix content before the first digit is isolated and handled separately.
- The numeric body aligns from the right so place-value columns stay in stable lanes.
- The direction of the change is inferred by parsing the numeric magnitude of both values.

Implementation:

```ts
const direction = Math.sign(nextNumber - previousNumber);
```

Lane model:

```txt
previous: $ 1 , 2 3 4
next:     $ 1 2 , 3 4 5

right edge stays fixed so each place-value column has a stable lane
```

Rendering:

- `NumberRun` parses the value into lanes.
- `useNumericLanes` returns lane keys, the direction of change, and prefix length.
- `NumberLane` renders a hidden probe for lane layout and an animated token on top.
- Digit tokens enter and exit vertically in the direction of the change.

Practical result:

```tsx
<Laminar text="$1,234" variant="number" animationPreset="snappy" />
```

Currency symbols, commas, and decimal points are handled. Direction is inferred by stripping non-numeric characters and comparing the parsed values.

[demo]

### Auto-Sizing

When text sits inside a button, badge, or pill, the container needs to grow and shrink with the text.

Measuring the live animated glyph row creates a feedback loop:

```txt
animated glyph row -> measured width -> animated parent width -> child layout -> measured width
```

Entering and exiting glyphs report intermediate sizes, the parent width chases them, and the result jitters.

The current implementation breaks the loop with a separate measurement source:

```tsx
<View style={hiddenMeasurementStyle}>
  <Text onLayout={captureLayout}>{finalText}</Text>
</View>

<Animated.View style={animatedWidthStyle}>
  <TextRun />
</Animated.View>
```

Breakdown:

- The hidden `Text` renders the final settled string with no animation.
- It is absolute, transparent, non-interactive, and excluded from accessibility.
- It reports the final width through `onLayout`.
- `useInlineAutoWidth` animates the outer `Animated.View` width toward that measured value.
- The visible glyph row is no longer the measurement source.

The autosize target is stable because it comes from final text, not from the glyph row mid-animation.

```tsx
// Button, badge, pill — autoSize animates the reserved width.
<Laminar text={label} autoSize />

// Standalone word — glyph animation only, no width reservation.
<Laminar text={label} autoSize={false} />
```

`autoSize={true}` and `autoSize={false}` solve different layout problems and do not feel identical.

[demo]

### Motion Control & Presets

Different UI moments need different motion character. A live counter should feel quick. A label transition can be smoother. A button surface may tolerate bounce.

Presets encode those decisions as named recipes so callsites do not need to manage timing values directly.

| Preset    | Character                  | Default Duration |
| --------- | -------------------------- | ---------------- |
| `default` | Smooth cubic-bezier timing | `380ms`          |
| `smooth`  | Spring with no bounce      | `400ms`          |
| `snappy`  | Spring with light bounce   | `350ms`          |
| `bouncy`  | Spring with more bounce    | `500ms`          |

Usage:

```tsx
<Laminar text={word} animationPreset="smooth" />
<Laminar text={count} variant="number" animationPreset="snappy" />
```

Duration override:

```tsx
<Laminar text={word} animationPreset="default" animationDuration={520} />
```

`animationDuration` is in milliseconds and overrides the preset default.

### UI Thread Performance

React renders on the JavaScript thread. If JavaScript is busy, a render-driven animation drops frames.

Deduction:

- JavaScript should decide what changed and compute the new glyph model.
- The UI thread should drive every animation frame.

Laminar uses Reanimated for layout transitions, entering and exiting animations, width animation, and opacity and transform animation.

Flow:

```txt
React state changes
-> Laminar reconciles glyph identity
-> Reanimated receives layout / enter / exit work
-> UI thread animates frames
```

---

## API Reference

### Laminar

```tsx
import { Laminar } from "react-native-laminar";

// MorphingText is an alias for Laminar
import { MorphingText } from "react-native-laminar";
```

#### Props

```ts
type LaminarProps = {
  text: string | number;
  variant?: "text" | "number";
  fontSize?: number;
  color?: string;
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

#### Prop Breakdown

| Prop                | Default                                     | Meaning                                                                            |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `text`              | Required                                    | The value to render and animate. Numbers are converted to strings internally.      |
| `variant`           | `"text"`                                    | `"text"` uses LCS glyph reconciliation. `"number"` uses right-aligned digit lanes. |
| `fontSize`          | Undefined                                   | Text size convenience prop, merged into the text style.                            |
| `color`             | Undefined                                   | Text color convenience prop, merged into the text style.                           |
| `style`             | Undefined                                   | Text style applied after `fontSize` and `color`.                                   |
| `containerStyle`    | Undefined                                   | Style for the outer viewport shell. Use for placement and alignment.               |
| `fontStyle`         | Undefined                                   | Additional text style merged before `style`.                                       |
| `animationDuration` | Preset duration                             | Duration override in milliseconds.                                                 |
| `animationPreset`   | `"default"` for text, `"snappy"` for number | Named motion recipe.                                                               |
| `stagger`           | `0.02`                                      | Delay in seconds between numeric lane animations.                                  |
| `autoSize`          | `true`                                      | Animate the reserved outer width to the measured final text width.                 |
| `clipToBounds`      | `false`                                     | Clip animated overflow to the viewport bounds when true.                           |

#### Text Example

```tsx
<Laminar
  text="Linear"
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
<Laminar
  text="$1,234"
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

The preset controls the default duration, the easing or spring behavior, and how `useInlineAutoWidth` drives width animation.

```tsx
<Laminar text={word} animationPreset="default" />
<Laminar text={word} animationPreset="smooth" />
<Laminar text={word} animationPreset="snappy" />
<Laminar text={word} animationPreset="bouncy" />
```

### Customization Options

#### Text Styling

```tsx
<Laminar
  text={label}
  fontSize={28}
  color="#111111"
  fontStyle={{ fontFamily: "Sf-semibold" }}
  style={{ letterSpacing: 0 }}
/>
```

Style merge order:

1. Internal base style, including `includeFontPadding: false`.
2. `fontSize` and `color`.
3. `fontStyle`.
4. `style`.

#### Container Styling

```tsx
<Laminar
  text={label}
  containerStyle={{ alignSelf: "center" }}
  style={{ color: "#ffffff", fontSize: 24 }}
/>
```

`containerStyle` controls placement. `style` controls text appearance.

---

## Core Concepts

### Text Morphing

A morph is readable when stable visual units stay stable. The user's eye tracks the letters it already knows and follows the new ones entering.

Breakdown:

1. The incoming `text` is converted to a string.
2. `splitDisplayUnits` segments it into grapheme clusters.
3. The new units are reconciled against the previous units using LCS.
4. Shared units reuse their previous React keys.
5. New units receive new keys and enter with fade and vertical offset.
6. Removed units exit because their keys disappear from the render.
7. Reanimated layout transitions move kept units into their new positions.

Example:

```txt
Laminar -> Linear

L stays
i stays
n stays (moves)
a stays (moves)
m exits
r stays
e enters
```

### Numeric Morphing

A digit's meaning comes from its place value. `$1,234` and `$12,345` share characters, but their meanings shift depending on column position.

Breakdown:

1. The value is converted to a string.
2. The first digit is located.
3. Any prefix before the first digit is isolated as lead content.
4. The numeric body is right-aligned against the previous value so place-value columns form stable lanes.
5. Matching lanes keep their keys.
6. Changed lanes get new token keys.
7. Direction is inferred from the numeric magnitude of both values.
8. Digit tokens enter and exit vertically in the direction of the change.

Example:

```txt
$1,234 -> $12,345

prefix: "$"
numeric body aligns from right
direction: up, because 12,345 > 1,234
```

### Layout Stability

Layout must be driven by stable information. Animated intermediates are not stable.

Laminar uses:

- stable glyph keys for text morphing;
- stable lane keys for numeric morphing;
- a hidden final-text probe for autosize measurement;
- an `Animated.View` width for layout reservation.

The visible animation can be expressive. The parent layout receives predictable, settled width values.

### Clipping & Containment

Overflow is either part of the visual design or a bug. `clipToBounds` makes the choice explicit.

Clip when the surface should contain the animation:

```tsx
<Laminar text={label} clipToBounds />
```

Allow overflow when entering or exiting glyphs should breathe outside the current measured bounds:

```tsx
<Laminar text={label} clipToBounds={false} />
```

---

## Demo App

The demo app is a swipeable carousel with eight pages. Each page isolates one concept and shows how the mechanism works. A footer with Morph and Reverse buttons steps through the values for the active page. Dots below the buttons track the current page and respond to swipe gestures and long-press panning.

The main screen is composed in `components/morph-demo/morph-demo-screen.tsx`. State lives in `use-demo-state.ts`. Layout metrics are computed in `use-demo-metrics.ts`. Page data and value arrays are defined in `demo-data.ts`. The individual page components are in `demo-pages.tsx`.

### Text Identity

Shows a text morph at slow speed so the LCS mechanism is easy to observe. Below the preview, an identity map renders both the current string and the next string as individual letter cells. Letters that survive the transition have a solid blue border. Letters that exit have a dashed border.

Values: `Laminar`, `Lamina`, `Linear`.

[demo]

### Number Identity

Shows a numeric morph with a lane strip below it. The strip has one fixed cell per place-value column. Each cell animates independently. The right edge of the strip stays fixed so the alignment is always visible.

Values: `$1,234`, `$12,345`, `$9,876`.

[demo]

### Animation Layer

Shows a single digit morphing. Below the preview, two rows show the two animation layers: a dashed space token holding the layout position, and a live digit token animating on top of it. The space stays fixed while the digit changes.

Values: `4`, `9`, `2`, `7`.

[demo]

### Auto Size

Shows a string inside a dashed blue border. The border resizes with the text because `autoSize` is on. Below the preview, a comparison row shows the same string with `autoSize={false}` so the difference in behavior is visible.

Values: `Run Simulation`, `Running Simulation`, `Simulation Done!`.

[demo]

### Editor

A page for exploring arbitrary word and style combinations. The settings panel lets you cycle the word, font size, and font weight independently.

Words: `Laminar`, `Linear`. Font sizes: 32pt, 40pt, 48pt. Font weights: Regular, Semibold, Bold.

[demo]

### Words

Standalone text morphing without a containing surface. `autoSize={false}` so no width is reserved for a parent. The `smooth` preset gives the transition a slower, more deliberate feel.

Words: `Laminar`, `Lamina`, `Linear`, `Layer`.

[demo]

### Button

Text morphing inside a pressable button with `autoSize={true}`. The button grows and shrinks with the label. The button itself is tappable to step forward, and the Morph and Reverse footer buttons also cycle the values.

Words: `Run Simulation`, `Running Simulation`, `Simulation Done!`.

[demo]

### Numbers

Currency values morphing with `variant="number"` and the `snappy` preset. The settings panel shows the current value, the previous value, and the next value so the direction of each transition is clear.

Values: `$35.99`, `$24.89`, `$17.38`, `$3.15`.

[demo]

### Carousel & Pagination

The demo shell uses a custom Instagram-style carousel built on `FlatList`. The component lives in `components/ui/carousel/` and is self-contained.

Key behaviors:

- **Dot scaling**: dots scale along a bell curve `[0.3, 0.7, 1, 1, 1, 0.7, 0.3]` across a 7-dot visible window. For more than 5 items, 4 buffer dots are prepended and appended so the scale transition looks smooth at the edges.
- **Long press to pan**: holding the pagination area activates a pan gesture. Dragging left or right steps through pages in 12–15px increments with haptic feedback on each step.
- **Programmatic scroll**: the dots list scrolls programmatically to keep the active dot visible. When the active index moves more than 2 ahead of the visible window, the list shifts forward. When it falls behind, the list shifts back.
- **55% visibility threshold**: the `FlatList` uses `itemVisiblePercentThreshold: 55` to decide which page is active, keeping pagination accurate during fast swipes.

Usage:

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselPagination,
} from "@/components/ui/carousel";

<Carousel items={[0, 1, 2, 3]} style={{ flex: 1 }}>
  <CarouselContent
    width={screenWidth}
    renderItem={({ item }) => <MyPage index={item} />}
  />
  <CarouselPagination defaultDotColor="#d7d7d7" activeDotColor="#000000" />
</Carousel>;
```

- **`Carousel`** is the context provider. It holds `currentIndex`, the `FlatList` ref for pages, the `FlatList` ref for dots, and the handlers that keep them in sync.
- **`CarouselContent`** renders the paged `FlatList` using `carouselRef` from context.
- **`CarouselPagination`** renders the animated dots row using `dotsListRef` from context.
- **`useCarousel()`** gives any child access to `currentIndex`, navigation refs, and state setters.

---

## Usage Examples

### Basic Text Animation

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function BasicTextAnimation() {
  const [word, setWord] = useState("Laminar");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Laminar
        text={word}
        fontSize={40}
        style={{ color: "#000000", fontFamily: "Sf-semibold" }}
      />
      <Button
        title="Morph"
        onPress={() => setWord((w) => (w === "Laminar" ? "Linear" : "Laminar"))}
      />
    </View>
  );
}
```

[demo]

### Numeric Counter

```tsx
import React, { useState } from "react";
import { Button, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function NumericCounter() {
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

[demo]

### Auto-Sizing Inside a Button

Use `autoSize` when the button should grow and shrink with the label.

```tsx
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function MorphButton() {
  const [word, setWord] = useState("Run Simulation");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Pressable
        onPress={() =>
          setWord((w) =>
            w === "Run Simulation" ? "Running Simulation" : "Run Simulation",
          )
        }
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#7ce2fe",
          borderRadius: 36,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <Laminar
          text={word}
          autoSize
          fontSize={32}
          style={{ color: "#ffffff", fontFamily: "Sf-semibold" }}
        />
      </Pressable>
    </View>
  );
}
```

[demo]

### Standalone Text Without Auto-Sizing

Use `autoSize={false}` when the word is not responsible for sizing a parent surface.

```tsx
<Laminar
  text={word}
  autoSize={false}
  fontSize={40}
  style={{ color: "#000000", fontFamily: "Sf-semibold" }}
/>
```

Practical difference:

- `autoSize={true}`: the component reserves and animates width for its parent container.
- `autoSize={false}`: the glyph animation runs without an animated width wrapper.

### Custom Motion Controls

```tsx
<Laminar
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

Laminar already keeps animation work on the UI thread. Performance issues typically come from too many React state updates, too many simultaneous morphing components, or values changing faster than the animation can be perceived.

Use shorter durations for rapid values:

```tsx
<Laminar text={liveValue} variant="number" animationDuration={220} />
```

Disable autosize when a parent already defines the width:

```tsx
<View style={{ width: 120 }}>
  <Laminar text={price} variant="number" autoSize={false} />
</View>
```

Memoize expensive formatting:

```tsx
const label = React.useMemo(() => value.toLocaleString("en-US"), [value]);

<Laminar text={label} variant="number" />;
```

### Measuring & Layout Computation

Autosize runs three independent layers.

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
Animated.View width -> parent layout grows or shrinks
```

The hidden layer exists because the visible layer reports intermediate sizes while it animates, and those sizes are not a reliable measurement source.

### Handling Rapid Updates

When updates arrive faster than users can perceive individual transitions, animation becomes noise rather than signal.

For frequent updates:

- reduce `animationDuration`;
- reduce numeric `stagger`;
- debounce the displayed value;
- disable `autoSize` when width changes are not meaningful.

```tsx
<Laminar
  text={quote}
  variant="number"
  animationPreset="snappy"
  animationDuration={180}
  stagger={0.01}
/>
```

### Emoji & Complex Characters

Laminar segments by grapheme when `Intl.Segmenter` is available:

```tsx
<Laminar text="Café" />
<Laminar text="👋 Hello" />
<Laminar text="👩‍💻" />
```

Breakdown:

- Accented letters move as one visible unit.
- Emoji modifier sequences stay attached to their base emoji.
- Zero-width-joiner sequences are not split into broken pieces.

---

## Best Practices

### When to Use Laminar

Good use cases:

- Button labels that morph between states.
- Badge and status text.
- Counters, prices, and compact metrics.
- Short strings where visual continuity aids comprehension.

Poor use cases:

- Long paragraphs.
- Static text that never changes.
- Text that must update instantly with no transition.
- Values changing so fast that animation obscures the current state.

### Container Sizing

Use `autoSize={true}` when the text controls its parent's width:

```tsx
<Pressable style={buttonStyle}>
  <Laminar text={label} autoSize />
</Pressable>
```

Use `autoSize={false}` when the parent already defines the space:

```tsx
<View style={{ width: 220, alignItems: "center" }}>
  <Laminar text={label} autoSize={false} />
</View>
```

Practical rule:

- Buttons, chips, badges: use `autoSize={true}`.
- Standalone centered words: use `autoSize={false}`.
- Fixed-width counters: use `autoSize={false}`.
- Dynamic inline labels: use `autoSize={true}`.

### Animation Timing

| Duration        | Best For                      |
| --------------- | ----------------------------- |
| `180ms - 260ms` | Rapid counters or live data   |
| `300ms - 450ms` | Normal labels and button text |
| `500ms - 700ms` | Expressive UI moments         |

```tsx
<Laminar text={label} animationDuration={380} />
<Laminar text={price} variant="number" animationDuration={220} />
```

### Memory Efficiency

Keep the `text` prop stable. A changing `key` forces a remount and destroys glyph identity.

```tsx
// Avoid. Forces remount and loses previous glyph state.
<Laminar key={label} text={label} />

// Correct. The component preserves identity across prop changes.
<Laminar text={label} />
```

Memoize expensive formatting so it does not re-run on every render:

```tsx
const formattedPrice = React.useMemo(() => `$${price.toFixed(2)}`, [price]);

<Laminar text={formattedPrice} variant="number" />;
```

---

## Troubleshooting

### Animations Not Playing

Symptom: text changes instantly with no transition.

Check:

1. Reanimated is installed and configured.
2. The component is not remounting due to a changing `key`.
3. The parent is not conditionally unmounting and remounting `Laminar`.
4. Updates are not arriving so fast that each animation is immediately interrupted by the next.

### Content Clipping

Symptom: entering or exiting glyphs are cut off.

Check:

1. If overflow should be visible, set `clipToBounds={false}`.
2. If the parent has a fixed width, verify the expected text fits within it.
3. If the text sits inside a pill or button, decide whether clipping is intentional.

### Numbers Misaligned

Symptom: digits feel jumpy or place values do not track correctly.

Check:

1. Use `variant="number"`.
2. Keep formatting consistent between renders. Switching between `$1,234` and `1234` mid-session breaks lane alignment.
3. Use tabular numbers when the font supports them:

   ```tsx
   <Laminar
     text={value}
     variant="number"
     style={{ fontVariant: ["tabular-nums"] }}
   />
   ```

### Performance Drops

Symptom: animations stutter or feel delayed.

Check:

1. Multiple morphing components updating simultaneously.
2. Expensive formatting running on every render without memoization.
3. Animation duration longer than the update frequency allows.
4. Reanimated not configured correctly for the platform.

### Auto-Sizing Not Working

Symptom: the parent container does not resize with the text.

Check:

1. `autoSize` is not set to `false`.
2. The parent allows its child to define the width. A fixed-width parent overrides the animated child width.
3. The parent does not apply a fixed width that makes the autosize effect invisible.

```tsx
// The button can grow because the child controls width.
<Pressable style={{ paddingHorizontal: 24 }}>
  <Laminar text={label} autoSize />
</Pressable>
```

---

## Contributing

### Development Setup

```bash
git clone https://github.com/cajaun/laminar
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
