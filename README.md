# Laminar

A reusable React Native animation system for morphing text and numeric values with smooth, continuous visual transformations. Instead of unmounting and remounting UI, Laminar preserves visual continuity so labels, counters, and prices feel like they evolve into their next state.

**Replace abrupt content swaps with fluid motion that feels natural and intentional.**

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture & How It Works](#architecture--how-it-works)
  - [Grapheme-Safe Segmentation](#grapheme-safe-segmentation)
  - [LCS-Based Reconciliation](#lcs-based-reconciliation)
  - [Digit Lane System](#digit-lane-system)
  - [Auto-Sizing](#auto-sizing)
  - [Motion Control & Presets](#motion-control--presets)
  - [UI Thread Performance](#ui-thread-performance)
- [API Reference](#api-reference)
  - [MorphingText](#morphingtext)
  - [MorphingNumber](#morphingnumber)
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
  - [Price Display with Auto-Sizing](#price-display-with-auto-sizing)
  - [Custom Motion Controls](#custom-motion-controls)
  - [Directional Transitions](#directional-transitions)
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

---

## Overview

Laminar solves the problem of jarring UI updates by animating transitions at the character and digit level. When content changes—whether it's a label, price, or counter—Laminar intelligently tracks what changed and animates each piece individually, creating a unified, continuous visual experience.

### What Makes Laminar Different

- **Character-level precision**: Animate individual characters and digits independently while maintaining layout stability
- **Grapheme-aware**: Correctly handles emoji, accents, diacritics, and combined characters that represent single visual units
- **Identity preservation**: Uses LCS (Longest Common Subsequence) reconciliation to identify unchanged glyphs and keep them stable during transitions
- **Numeric intelligence**: Understands digit place values and can drive animations based on directionality (up/down movements)
- **Layout-aware**: Smoothly adapts container dimensions while animating content, with optional clipping to keep transitions contained
- **Performance-first**: Runs animations on the UI thread via Reanimated, ensuring 60fps motion without blocking JavaScript
- **Composable**: Modular architecture separates APIs, hooks, models, and rendering layers for easy extension

---

## Key Features

### Text Morphing

Animates text transitions character by character, preserving visual continuity and identity:

- Smooth character substitutions and insertions
- Grapheme-safe segmentation for emoji and accent marks
- No jarring font remeasurements or layout shifts
- Optional fade transitions for entering/exiting characters

### Numeric Morphing

Specialized support for numbers with digit-aware animation:

- Animates individual digits within their place-value columns
- Infers directionality (upward/downward motion) from value changes
- Keeps decimal points and separators stable
- Reconciles values like 148.21 → 43.21 with logical digit transitions

### Layout Stability

Ensures animations don't cause layout thrashing:

- Character identity tracking prevents full remounts
- Place value alignment for numeric columns
- Optional auto-sizing to smoothly transition container dimensions
- Clipping by default to contain animated content

### Motion Customization

Fine-grained controls over animation behavior:

- Configurable duration, easing, and stagger timing
- Font styling and color transitions
- Entry/exit animation presets
- Custom motion builders for specialized sequences

### Performance

Animation runs on the UI thread for consistent, smooth motion:

- Leverages React Native Reanimated for high-fidelity animation
- Avoids unnecessary component remounts
- Minimal JavaScript execution during animation
- Suitable for frequent updates (counters, live data, etc.)

### Clip Management

By default, animations are clipped to their container:

- Ideal for pills, badges, buttons, and other constrained UI
- Optional overflow for specialized layouts
- Smooth visual containment without overflow artifacts

---

## Installation

### Prerequisites

- React Native 0.70+
- React Native Reanimated 3.0+
- React 18+

### Add to Your Project

```bash
npm install laminar
# or
yarn add laminar
# or
pnpm add laminar
```

### Peer Dependencies

Ensure you have Reanimated configured in your project:

```bash
npm install react-native-reanimated
```

Then follow the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) for your platform.

---

## Quick Start

### Basic Text Animation

```typescript
import { MorphingText } from 'laminar';

export default function App() {
  const [label, setLabel] = useState('Hello');

  return (
    <MorphingText
      value={label}
      duration={500}
      easing="ease-out"
    />
  );
}
```

### Numeric Counter

```typescript
import { MorphingNumber } from 'laminar';

export default function PriceDisplay() {
  const [price, setPrice] = useState(29.99);

  return (
    <MorphingNumber
      value={price}
      duration={600}
      decimalPlaces={2}
    />
  );
}
```

### With Auto-Sizing

```typescript
<MorphingText
  value={label}
  duration={500}
  autoSize={true}
  maxWidth={300}
/>
```

---

## Architecture & How It Works

Laminar's architecture is built on several interconnected systems that work together to create smooth, intelligent animations:

### Grapheme-Safe Segmentation

**Problem**: Text isn't just characters. Some symbols like family emoji are actually multiple Unicode code points combined into a single visual unit. Accents like é are stored as e + combining accent mark. Simple character-level animation breaks these down incorrectly.

**Solution**: Laminar uses grapheme-aware segmentation to identify true visual units:

```typescript
// Input: "[FAMILY EMOJI] Hi"
// Most naive approach splits into code points: ["[MAN]", "\u200d", "[WOMAN]", "\u200d", "[GIRL]", "\u200d", "[BOY]", " ", "H", "i"]
// Laminar segments into graphemes: ["[FAMILY EMOJI]", " ", "H", "i"]
```

**How it works**:

- Uses Unicode grapheme cluster breaking rules to identify boundaries
- Preserves combined characters (emoji sequences, accented letters, etc.)
- Treats each visual unit atomically during animation
- Prevents splitting skin-tone modifiers, zero-width joiners, and diacritical marks

This ensures emoji render crisply and accented characters animate as unified visual units.

### LCS-Based Reconciliation

**Problem**: When text changes from "Hello" to "Help", naively animating every character creates unnecessary motion. The "Hel" is unchanged—only the "lo" → "p" transition matters.

**Solution**: Laminar uses Longest Common Subsequence (LCS) reconciliation to identify stable glyphs:

```typescript
// Old text: "Hello"
// New text: "Help"
// LCS identifies: "Hel" are shared
// Animations only needed for: "lo" → "p"
```

**Algorithm outline**:

1. Segment both old and new text into graphemes
2. Compute LCS to find the longest sequence of unchanged glyphs
3. Identify insertions, deletions, and substitutions needed
4. Animate only the necessary transitions, keeping matched characters stable

**Visual impact**: Less motion noise, faster visual updates, improved comprehension.

### Digit Lane System

**Problem**: When animating numbers like 148.21 → 43.21, individual digits move at different "speeds" because they represent different place values. A naive digit-by-digit animation would be visually chaotic.

**Solution**: Laminar uses a **lane-based system** where each digit occupies a column:

```
Before:     After:
1 4 8 . 2 1     4 3 . 2 1
| | | | | |     | | | | |
↓ ↓ ↓ ↓ ↓ ↓     (lanes align)
```

**How it works**:

1. Parse numeric values into lanes for each position (hundreds, tens, ones, tenths, etc.)
2. Detect which lanes have changes and animate within each lane
3. Preserve decimal points and separators as anchors
4. Infer directionality: if a digit increases, animate upward; if it decreases, animate downward
5. Optional stagger timing between lanes for cascading effect

**Result**: Numbers feel like they "transform" into their next state while maintaining column alignment, making the values easier to read during transition.

### Auto-Sizing

**Problem**: After animating text from "Welcome!" to "Goodbye beautiful world", the container needs to resize. Hard-switching dimensions causes layout thrashing; animating with fixed sizes causes clipping or text overflow.

**Solution**: Laminar implements a **hidden measurement layer** that computes upcoming dimensions and animates the viewport:

```typescript
// Phase 1: Render hidden version of "Goodbye beautiful world"
// Measure its dimensions: width = 280, height = 24

// Phase 2: Animate container from old dimensions to new dimensions
// During animation, clip and overflow-manage the animated content

// Phase 3: Once animation completes, finalize layout
```

**How it works**:

1. When text changes, render a hidden copy of the new content off-screen
2. Measure its dimensions without affecting layout
3. Animate the container's width/height from current to target
4. Clip animated glyphs to prevent overflow during transition
5. Optional padding/margin adjustments to reflow surrounding UI

**Configuration**:

- `autoSize={true}`: Enable auto-sizing
- `maxWidth`: Constrain measured width
- `clipDuringResize={true}`: Clip content while resizing (default)

### Motion Control & Presets

Motion behavior is abstracted into reusable builders:

**Animation Presets**:

```typescript
interface AnimationPreset {
  duration: number;
  easing: EasingFunction;
  staggerDelay?: number;
  entryStyle?: StyleProps;
  exitStyle?: StyleProps;
}
```

**Available presets**:

- `quick`: 300ms, ease-out (instant feedback)
- `smooth`: 500ms, ease-in-out (standard transitions)
- `elegant`: 800ms, cubic-bezier (premium feel)
- `snappy`: 400ms, ease-out with stagger (lists/multiple items)

**Custom builders**:

```typescript
const customMotion = {
  duration: 600,
  easing: "cubic-bezier(0.17, 0.67, 0.83, 0.67)",
  staggerDelay: 50, // 50ms between character animations
  entryStyle: { opacity: 0, scale: 0.8 },
  exitStyle: { opacity: 0.5, scale: 1.2 },
};
```

### UI Thread Performance

Laminar leverages React Native Reanimated to keep animations off the JavaScript thread:

**Architecture**:

```
┌─────────────────────────────────────┐
│   JavaScript Thread                  │
│   ├─ State: text = "Hello" → "Help"  │
│   └─ Trigger animation               │
└────────────┬────────────────────────┘
             │
      (UI Thread)
             ↓
┌─────────────────────────────────────┐
│   UI Thread (60fps)                  │
│   ├─ Shared Animation Values         │
│   ├─ Transforms & Opacity            │
│   └─ Character Position Updates      │
└─────────────────────────────────────┘
```

**Benefits**:

- Animations aren't blocked by JavaScript work
- No frame drops from garbage collection or other JS tasks
- Smooth motion even under load (network requests, timers, etc.)
- Suitable for rapid updates (stock prices, live counters, etc.)

---

## API Reference

### MorphingText

Component for animating text transitions.

#### Props

```typescript
interface MorphingTextProps {
  // Content
  value: string;

  // Animation timing
  duration?: number;           // Default: 500ms
  easing?: EasingFunction;     // Default: 'ease-out'
  delay?: number;              // Delay before animation starts
  staggerDelay?: number;       // Stagger between characters

  // Auto-sizing
  autoSize?: boolean;          // Default: true
  maxWidth?: number;           // Maximum measured width
  onSizeChange?: (width: number, height: number) => void;

  // Styling
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | ... | '900';
  fontFamily?: string;
  color?: string | Animated.Node<number>;

  // Entry/Exit animations
  entry?: {
    style?: StyleProps;        // Initial style before animation
    duration?: number;
    easing?: EasingFunction;
  };
  exit?: {
    style?: StyleProps;        // Final style after animation
    duration?: number;
    easing?: EasingFunction;
  };

  // Clipping
  clip?: boolean;              // Default: true
  overflow?: 'hidden' | 'visible';

  // Callbacks
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}
```

#### Example

```typescript
<MorphingText
  value={status}
  duration={400}
  easing="ease-in-out"
  fontSize={16}
  fontWeight="600"
  color="#333"
  autoSize={true}
  maxWidth={200}
/>
```

### MorphingNumber

Component for animating numeric transitions with digit lane awareness.

#### Props

```typescript
interface MorphingNumberProps {
  // Content
  value: number;

  // Number formatting
  decimalPlaces?: number; // Default: 0
  thousandsSeparator?: string; // Default: ','
  decimalSeparator?: string; // Default: '.'
  prefix?: string; // e.g., '$'
  suffix?: string; // e.g., '%'

  // Animation timing
  duration?: number; // Default: 600ms
  easing?: EasingFunction;
  staggerDelay?: number; // Between digit lanes

  // Directionality
  inferDirection?: boolean; // Default: true
  forceDirection?: "up" | "down" | "none";

  // Styling
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string | Animated.Node<number>;

  // Auto-sizing
  autoSize?: boolean;
  maxWidth?: number;

  // Callbacks
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}
```

#### Example

```typescript
<MorphingNumber
  value={cartTotal}
  prefix="$"
  decimalPlaces={2}
  duration={500}
  fontSize={24}
  fontWeight="bold"
  color="#2ecc71"
  inferDirection={true}
/>
```

### Animation Presets

Pre-configured animation settings for common use cases.

```typescript
import { AnimationPresets } from 'laminar';

// Quick feedback (300ms, ease-out)
<MorphingText value={label} {...AnimationPresets.quick} />

// Smooth, standard (500ms, ease-in-out)
<MorphingText value={label} {...AnimationPresets.smooth} />

// Elegant, premium (800ms, cubic-bezier)
<MorphingText value={label} {...AnimationPresets.elegant} />

// Snappy with stagger (400ms, staggered)
<MorphingText value={label} {...AnimationPresets.snappy} />
```

### Customization Options

#### Easing Functions

```typescript
type EasingFunction =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`
  | Animated.EasingFunction;
```

#### Entry/Exit Styles

```typescript
interface AnimationStyle {
  opacity?: number;
  scale?: number;
  translateX?: number;
  translateY?: number;
  rotate?: number;
}
```

---

## Core Concepts

### Text Morphing

Text morphing reconciles old and new content, identifying which characters are shared and which need animation.

**Process**:

1. **Segmentation**: Break text into graphemes (visual units)
2. **Reconciliation**: Find longest common subsequence to identify unchanged characters
3. **Mapping**: Create one-to-one mapping between old and new character positions
4. **Animation**: Animate characters to their new positions, with entry/exit for new/deleted characters

**Visual result**: Characters smoothly transition, substitutions feel natural, new characters fade in, deleted characters fade out.

### Numeric Morphing

Numeric morphing extends text morphing with digit-aware logic.

**Process**:

1. **Parsing**: Extract digits and separators into a lane structure
2. **Lane alignment**: Align old and new digits by place value (ones, tens, hundreds, etc.)
3. **Directionality inference**: Compare old and new values to determine animation direction
4. **Individual animation**: Animate each digit lane independently
5. **Separator stability**: Keep decimal points and thousand separators anchored

**Visual result**: Numbers feel like they "evolve" into new values, with upward/downward motion reinforcing increase/decrease.

### Layout Stability

Layout stability ensures animations don't cause layout thrashing or surprising reflows.

**Mechanisms**:

- **Identity preservation**: Characters maintain their identity across transitions, preventing full remounts
- **Container sizing**: Optional animation of container dimensions to accommodate new content
- **Clipping**: By default, animated content is clipped to prevent overflow
- **Stagger control**: Animate characters sequentially to smooth out simultaneous layout changes

**Result**: Smooth, predictable visual transitions without layout "jumpiness".

### Clipping & Containment

Clipping keeps animated content within its container, ideal for constrained UI like buttons and badges.

**Behavior**:

- `clip={true}` (default): Characters fade out visually if they'd overflow
- `clip={false}`: Allows overflow, useful for list items or full-width content
- Can be extended with overflow management for specialized layouts

**Use cases**:

- Pills and badges with constrained width
- Button labels that might truncate
- Counter displays with fixed spacing
- Price displays in compact layouts

---

## Usage Examples

### Basic Text Animation

```typescript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { MorphingText } from 'laminar';

export default function BasicExample() {
  const [label, setLabel] = useState('Welcome');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MorphingText
        value={label}
        duration={500}
        fontSize={24}
        fontWeight="600"
        color="#333"
      />

      <Button
        title="Change Text"
        onPress={() => setLabel(label === 'Welcome' ? 'Goodbye' : 'Welcome')}
      />
    </View>
  );
}
```

### Numeric Counter

```typescript
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { MorphingNumber } from 'laminar';

export default function CounterExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 100) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MorphingNumber
        value={count}
        duration={600}
        fontSize={32}
        fontWeight="bold"
        color="#2ecc71"
        inferDirection={true}
      />
    </View>
  );
}
```

### Price Display with Auto-Sizing

```typescript
import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { MorphingNumber } from 'laminar';

export default function PriceExample() {
  const [price, setPrice] = useState(29.99);

  return (
    <View style={styles.container}>
      <View style={styles.priceBox}>
        <MorphingNumber
          value={price}
          prefix="$"
          decimalPlaces={2}
          duration={500}
          fontSize={28}
          fontWeight="bold"
          color="#e74c3c"
          autoSize={true}
          maxWidth={150}
        />
      </View>

      <Button
        title="Apply 50% Discount"
        onPress={() => setPrice(price * 0.5)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  priceBox: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20
  }
});
```

### Custom Motion Controls

```typescript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { MorphingText } from 'laminar';

export default function CustomMotionExample() {
  const [status, setStatus] = useState('Active');
  const statuses = ['Active', 'Paused', 'Completed', 'Archived'];
  const statusIndex = statuses.indexOf(status);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MorphingText
        value={status}
        duration={700}
        easing="cubic-bezier(0.34, 1.56, 0.64, 1)" // bouncy
        fontSize={18}
        fontWeight="600"
        color="#3498db"
        entry={{
          style: { opacity: 0, scale: 0.5 },
          duration: 200
        }}
        exit={{
          style: { opacity: 0, scale: 1.5 },
          duration: 300
        }}
      />

      <Button
        title="Next Status"
        onPress={() => setStatus(statuses[(statusIndex + 1) % statuses.length])}
      />
    </View>
  );
}
```

### Directional Transitions

```typescript
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { MorphingNumber } from 'laminar';

export default function DirectionalExample() {
  const [value, setValue] = useState(100);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MorphingNumber
        value={value}
        duration={600}
        fontSize={32}
        fontWeight="bold"
        // Upward motion for increases
        inferDirection={true}
        color={value > 100 ? '#2ecc71' : '#e74c3c'}
      />

      <Button title="Increase" onPress={() => setValue(prev => prev + 50)} />
      <Button title="Decrease" onPress={() => setValue(prev => prev - 50)} />
    </View>
  );
}
```

---

## Advanced Topics

### Performance Optimization

**Avoid premature optimization**: Laminar is designed to handle frequent updates smoothly. Profile before optimizing.

**When optimization is needed**:

1. **Reduce stagger delays**: Longer stagger means longer animation times

   ```typescript
   staggerDelay={10}  // Shorter delays = faster overall animation
   ```

2. **Lower duration for rapid updates**: If updates happen multiple times per second, use shorter animations

   ```typescript
   duration={200}  // Fast feedback for frequent changes
   ```

3. **Limit auto-sizing**: Disable auto-sizing for fixed-width containers

   ```typescript
   autoSize={false}
   ```

4. **Batch updates**: Debounce rapid value changes
   ```typescript
   const debouncedValue = useDebounce(value, 100);
   <MorphingNumber value={debouncedValue} />
   ```

### Measuring & Layout Computation

Auto-sizing uses a hidden measurement layer. Understand how it works:

```typescript
// Phase 1: Hidden render
// Laminar renders new text off-screen to measure dimensions
// Dimensions: { width: 245, height: 24 }

// Phase 2: Animate viewport
// Container animates from old to new dimensions
// Content is clipped during transition

// Phase 3: Layout finalization
// Hide measurement layer, finalize layout
```

**Configuration**:

```typescript
<MorphingText
  value={text}
  autoSize={true}
  maxWidth={300}  // Constrain measurement width
  onSizeChange={(width, height) => {
    console.log(`New dimensions: ${width}x${height}`);
  }}
  clipDuringResize={true}  // Clip animated content
/>
```

### Handling Rapid Updates

When values update frequently (stock prices, live data, etc.):

1. **Use debouncing**:

   ```typescript
   import { useCallback } from 'react';
   import { useDebouncedValue } from 'laminar/hooks';

   const price = useDebouncedValue(livePrice, 200);
   <MorphingNumber value={price} duration={300} />
   ```

2. **Stagger timing**:

   ```typescript
   // Ensure animation completes before next update
   <MorphingNumber
     value={counter}
     duration={500}
     staggerDelay={30}
   />
   ```

3. **Queue animations**:
   ```typescript
   // If updates are faster than animations, queue them
   const [queue, setQueue] = useState([]);
   useEffect(() => {
     if (queue.length === 0) return;
     const timer = setTimeout(() => {
       setCurrentValue(queue[0]);
       setQueue((q) => q.slice(1));
     }, 500);
     return () => clearTimeout(timer);
   }, [queue]);
   ```

### Emoji & Complex Characters

Laminar's grapheme-safe segmentation handles emoji and accents correctly:

```typescript
// Single emoji
<MorphingText value="[WAVE] Hello" />  // Renders: ["[WAVE]", " ", "H", "e", "l", "l", "o"]

// Emoji sequences (family)
<MorphingText value="[FAMILY EMOJI]" />  // Renders: ["[FAMILY EMOJI]"] (single unit)

// Skin tone modifiers
<MorphingText value="[WAVE_LIGHT_SKIN_TONE]" />  // Renders: ["[WAVE_LIGHT_SKIN_TONE]"] (single unit)

// Accented characters
<MorphingText value="Café" />  // Renders: ["C", "a", "f", "é"] (é is single unit)

// Zero-width joiners
<MorphingText value="[WOMAN_TECHNOLOGIST]" />  // Renders: ["[WOMAN_TECHNOLOGIST]"] (woman technologist, single unit)
```

**Result**: All complex characters animate as unified visual units, no split rendering.

---

## Best Practices

### When to Use Laminar

**Good use cases**:

- Status indicators that change frequently
- Price displays with promotions or live updates
- Counters tracking metrics or inventory
- Labels with dynamic content
- Badge values or score displays
- Time displays (HH:MM:SS format)
- Percentage indicators
- Form validation messages

**Not ideal for**:

- One-time static text render
- Extremely long documents (performance concern)
- Content that never changes
- Cases where instant feedback is critical (should use instant updates + animation)

### Container Sizing

Size containers to accommodate all expected content:

```typescript
// Bad: Container is too small
<View style={{ width: 60 }}>
  <MorphingNumber value={price} prefix="$" decimalPlaces={2} />
</View>

// Good: Container has enough space
<View style={{ width: 120 }}>
  <MorphingNumber value={price} prefix="$" decimalPlaces={2} />
</View>

// Better: Use auto-sizing
<View>
  <MorphingNumber
    value={price}
    prefix="$"
    decimalPlaces={2}
    autoSize={true}
    maxWidth={120}
  />
</View>
```

### Animation Timing

Use appropriate duration for context:

```
300ms - Quick feedback (button states, switches)
500ms - Standard transitions (status changes, counters)
700ms - Attention-grabbing (price changes, alerts)
1000ms+ - Premium, cinematic (special events, celebrations)
```

**With stagger**:

```typescript
// Character animation completes in: duration + (charCount * staggerDelay)
// 8 characters, 500ms duration, 50ms stagger = 500 + (8 * 50) = 900ms total
<MorphingText
  value={longText}
  duration={500}
  staggerDelay={50}
/>
```

### Memory Efficiency

- **Avoid unnecessary re-renders**: Wrap components in `React.memo` if props are stable

  ```typescript
  const MemoizedMorphing = React.memo(MorphingText);
  ```

- **Use stable string values**: Don't create new string objects every render

  ```typescript
  // Bad
  <MorphingText value={status.toUpperCase()} />

  // Good
  const displayText = useMemo(() => status.toUpperCase(), [status]);
  <MorphingText value={displayText} />
  ```

- **Limit animation duration during rapid updates**: Long animations with frequent updates consume more memory
  ```typescript
  <MorphingNumber
    value={price}
    duration={debouncedUpdates ? 500 : 200}
  />
  ```

---

## Troubleshooting

### Animations Not Playing

**Symptom**: Content changes instantly without animation

**Causes & solutions**:

1. Reanimated not configured: Follow [Reanimated setup](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
2. Component re-mounts: Ensure Laminar component has consistent `key` or parent component doesn't unmount
3. Rapid successive updates: Updates faster than animation duration cause perceived "skipping"
   - Solution: Debounce rapid updates or disable animation for very fast changes

### Content Clipping

**Symptom**: Animated text is cut off at edges

**Causes & solutions**:

1. Container too small: Increase parent `View` width
2. `clip={true}` hiding content: Set `clip={false}` to allow overflow (if acceptable for your UI)
3. Auto-sizing disabled: Enable with `autoSize={true}`

### Numbers Misaligned

**Symptom**: Digits jump between columns instead of rotating in lane

**Causes & solutions**:

1. Monospace font not used: Use `fontFamily` that's genuinely monospace
   ```typescript
   fontFamily = "Courier New"; // or 'Monaco', 'Menlo'
   ```
2. Thousand separators interfering: Ensure format is consistent (e.g., always include separators)
3. Variable character widths: Some fonts aren't truly monospace; test with system fonts

### Performance Drops

**Symptom**: Animations stutter or drop frames

**Causes & solutions**:

1. Too many Laminar components animating simultaneously: Stagger their update timing
2. Long animation durations with stagger: Reduce stagger delay or duration
3. JavaScript blockage: Profile with React DevTools to identify blocking work
4. Reanimated not on UI thread: Ensure Reanimated is properly installed and configured

### Auto-Sizing Not Working

**Symptom**: Container doesn't resize when content changes

**Causes & solutions**:

1. `autoSize={false}`: Change to `autoSize={true}`
2. `maxWidth` too restrictive: Increase or remove `maxWidth` constraint
3. Parent container has fixed size: Parent must allow resizing

   ```typescript
   // Parent has fixed width
   <View style={{ width: 200 }}>
     <MorphingText autoSize={true} value={text} />
   </View>

   // Parent allows resizing
   <View>
     <MorphingText autoSize={true} value={text} maxWidth={200} />
   </View>
   ```

---

## Contributing

We welcome contributions! Here's how to get involved:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/laminar.git
cd laminar

# Install dependencies
npm install

# Start the dev environment
npm start
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch
```

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with a clear description

### Code Quality

- Follow the existing code style
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

## License

Laminar is released under the [MIT License](LICENSE).

---

## Resources

- **Reanimated Docs**: https://docs.swmansion.com/react-native-reanimated/
- **React Native Performance**: https://reactnative.dev/docs/performance
- **Unicode Grapheme Clusters**: https://www.unicode.org/reports/tr29/
- **LCS Algorithm**: https://en.wikipedia.org/wiki/Longest_common_subsequence

---

**Built with care for smooth, delightful animations**
