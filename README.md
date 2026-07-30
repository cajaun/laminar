# Laminar

Laminar animates changing text and numbers in React Native while preserving
the identity of characters that stay on screen.

```tsx
<Laminar text={value} variant="number" />
```

The package handles three jobs:

- `text` reconciles grapheme clusters so unchanged characters keep their
  identity.
- `number` aligns digits by place value and animates changed lanes.
- `slots` rolls digits through a vertical reel.

https://github.com/user-attachments/assets/d43bf136-de72-4973-a32c-8e283716ba59

## Install

```bash
npm install react-native-laminar react-native-reanimated
```

Laminar supports React 18 or newer, React Native 0.74 or newer, and Reanimated
3 or newer. Complete the setup required by your installed Reanimated version
before you render Laminar.

## Quick Start

```tsx
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Laminar } from "react-native-laminar";

export default function Counter() {
  const [count, setCount] = useState(128);

  return (
    <View style={{ gap: 16, padding: 24 }}>
      <Laminar
        text={`$${count.toLocaleString()}`}
        variant="number"
        align="right"
        fontSize={48}
        animationPreset="snappy"
      />

      <Pressable onPress={() => setCount((value) => value + 37)}>
        <Text>Increase</Text>
      </Pressable>
    </View>
  );
}
```

`Laminar` is the default export. `MorphingText` remains available as an alias.

```tsx
import Laminar, { MorphingText } from "react-native-laminar";
```

## Choose a Variant

### Text

Use `text` for words, labels, status messages, and strings where character
continuity shapes the animation.

```tsx
<Laminar
  text={status}
  variant="text"
  animationPreset="smooth"
  fontSize={32}
/>
```

Laminar segments the value into grapheme clusters. An emoji family, a
combining mark, or another multi-code-point glyph stays in one visual unit
when the JavaScript runtime provides `Intl.Segmenter`.

Laminar compares the old and new unit arrays with a longest common subsequence
algorithm. Shared units retain their React keys. Inserted units enter, removed
units exit, and retained units move with the row layout.

### Number

Use `number` for counters, prices, percentages, timers, and formatted numeric
strings.

```tsx
<Laminar
  text="$12,480.50"
  variant="number"
  align="right"
  stagger={0.015}
/>
```

Laminar finds the first ASCII digit, treats the preceding units as a stable
lead, and aligns the remaining lanes from the right. A change from `99` to
`100` keeps the rightmost place-value lanes aligned. The parsed numeric
magnitude sets the animation direction.

Formatting characters remain visible. Laminar accepts strings such as
`$1,240.00`, `-18%`, and `USD 42`.

### Slots

Use `slots` when each digit should roll through a reel.

```tsx
<Laminar
  text="07:42"
  variant="slots"
  fontSize={56}
  animationPreset="snappy"
  clipToBounds
/>
```

ASCII digits receive slot reels. Prefixes and punctuation render as text.
Laminar derives reel height from `lineHeight`, then `fontSize`, with a
12-point floor.

Custom fonts can report different baseline and line-height metrics on iOS and
Android. Test slot rendering on physical devices when you change fonts,
sizes, or line heights.

## API

### Exports

```tsx
import Laminar, {
  Laminar as NamedLaminar,
  MorphingText,
  type LaminarProps,
  type LaminarAlign,
  type MorphAnimationPresetName,
  type MorphContentVariant,
} from "react-native-laminar";
```

`Laminar`, `NamedLaminar`, and `MorphingText` refer to the same memoized
component.

### Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `text` | `string \| number` | required | Value Laminar renders |
| `variant` | `"text" \| "number" \| "slots"` | `"text"` | Reconciliation and animation mode |
| `fontSize` | `number` | inherited | Font size and numeric travel input |
| `color` | `string` | inherited | Text color |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Shell and row alignment |
| `className` | `string` | `undefined` | Utility classes passed to visible text |
| `style` | `StyleProp<TextStyle>` | `undefined` | Final text style layer |
| `fontStyle` | `StyleProp<TextStyle>` | `undefined` | Shared font style layer |
| `containerStyle` | `StyleProp<ViewStyle>` | `undefined` | Outer shell style |
| `animationDuration` | `number` | preset duration | Duration override in milliseconds |
| `animationPreset` | `"default" \| "smooth" \| "snappy" \| "bouncy"` | variant default | Motion recipe |
| `stagger` | `number` | `0.02` | Delay between numeric lanes in seconds |
| `autoSize` | `boolean` | `true` | Measure and animate the inline width |
| `clipToBounds` | `boolean` | `false` | Hide content outside the viewport |

Laminar composes text styles in this order:

```text
base fontSize/color -> fontStyle -> style
```

The final `style` value wins when layers define the same property.

### Presets

| Preset | Motion | Duration |
| --- | --- | ---: |
| `default` | Bezier timing | 380 ms |
| `smooth` | Spring with no bounce | 400 ms |
| `snappy` | Spring with light bounce | 350 ms |
| `bouncy` | Spring with more bounce | 500 ms |

Text uses `default` unless you choose a preset. Number and slot variants use
`snappy`.

`animationDuration` replaces the preset duration:

```tsx
<Laminar
  text={message}
  animationPreset="smooth"
  animationDuration={240}
/>
```

## Sizing and Layout

### Auto Size

`autoSize` defaults to `true`. Laminar renders a hidden measurement copy,
captures its width, and drives the visible viewport toward the new width.
The first width snaps into place so the component does not animate from zero.

```tsx
<Laminar text={label} autoSize />
```

The measurement copy ignores touch input and stays outside the accessibility
tree. Plain spaces become non-breaking spaces during measurement so the copy
retains their width.

Set `autoSize={false}` when a parent controls width:

```tsx
<View style={{ width: "100%" }}>
  <Laminar text={label} autoSize={false} align="center" />
</View>
```

The viewport uses `width: "100%"` in this mode.

### Clipping

Entering and exiting glyphs can travel beyond the measured bounds.

```tsx
<Laminar text={label} clipToBounds />
```

Choose clipping for compact controls or slot reels. Leave it off when glyphs
need room outside the current width.

### Alignment

```tsx
<Laminar text={value} align="left" />
<Laminar text={value} align="center" />
<Laminar text={value} align="right" />
```

Alignment applies to the outer shell and the rendered row. Give the parent a
known width when you need alignment across a screen or panel.

## Performance

Reanimated executes timing and spring work on its animation runtime. React
still processes each value update, reconciles units, and renders mounted
Laminar instances.

Use these rules for update-heavy screens:

- Keep state close to the component that changes.
- Mount the demo or view the user can see, plus a small adjacent window.
- Avoid feeding Laminar values that have not changed.
- Profile release builds on physical devices.
- Measure JS FPS and UI FPS as separate signals.

Text reconciliation uses a dynamic-programming LCS matrix for the changed
middle of a string. Long strings with broad edits cost more than short labels
or counters. Use plain `Text` for large paragraphs or log streams.

Slot reels create more native text work than the `number` variant. Choose
`number` for high-frequency counters unless the reel motion serves the
interface.

## How Laminar Preserves Identity

React associates animation state with keys. Index keys fail when characters
move because an insertion changes the index of each unit after it.

Laminar keeps a ledger for each mounted run:

1. The text ledger preserves a shared prefix and suffix, then matches middle
   units with LCS.
2. The numeric ledger pads lanes from the left so rightmost place values keep
   their identity.

Each new unit receives a fresh key. Retained units reuse their prior key.
Reanimated handles entry, exit, and layout movement after React resolves those
identities.

## Example App

The repository keeps the Expo application under [`example`](./example):

```text
example/
  app/
  assets/
  components/
  ios/
  shared/
  app.json
  metro.config.js
  package.json
```

The example imports source from `packages/laminar/src`, so package edits appear
without a build step.

Run commands from the repository root:

```bash
npm install
npm start
npm run ios
npm run android
npm run web
```

Regenerate CocoaPods after dependency or native path changes:

```bash
cd example/ios
pod install
```

## Quality

The package owns model, hook, motion, view, API, and regression tests under
`packages/laminar/test`.

```bash
npm test
npm run test:coverage
npm run typecheck
npm run quality
```

`npm run quality` runs package type checks, 92 automated cases, coverage
ratchets, the library build, and an npm package dry run.

The current gates require:

- 95% statements and lines across package source.
- 85% branch coverage and 100% function coverage.
- 95% statements and lines in the model layer.
- 90% model branch coverage and 100% model function coverage.

Native typography, accessibility, and frame pacing need device evidence.
The package quality documents include a release checklist and a rapid-update
performance charter:

- [`packages/laminar/quality/test-strategy.md`](./packages/laminar/quality/test-strategy.md)
- [`packages/laminar/quality/checklists/release.md`](./packages/laminar/quality/checklists/release.md)
- [`packages/laminar/quality/charters/animation-performance.md`](./packages/laminar/quality/charters/animation-performance.md)

## Troubleshooting

### The component does not animate

Confirm that Reanimated works in the host application. Check its Babel or
runtime setup for the installed version, then test a basic Reanimated example.

Laminar suppresses entry animation on the first render. Change `text` after
mount to trigger a transition.

### Content clips

Set `clipToBounds={false}` or give the parent more room. Check parent views for
`overflow: "hidden"`.

Slot reels depend on native font metrics. Supply a numeric `lineHeight` when a
custom font clips:

```tsx
<Laminar
  text={value}
  variant="slots"
  style={{ fontSize: 48, lineHeight: 58 }}
/>
```

### Alignment has no visible effect

The shell sizes itself to its content when `autoSize` is on. Give the parent a
width or disable auto sizing:

```tsx
<Laminar text={value} autoSize={false} align="right" />
```

### Rapid updates lose frames

Count mounted Laminar instances before changing motion code. Virtualize
offscreen demos and list rows, then profile text, number, and slots as separate
cases in a release build.

Reduce update frequency at the producer when intermediate values carry no
meaning. The final value should still reach Laminar.

### TypeScript resolves the wrong entry

Consumers should import from `react-native-laminar`. The example maps that
package name to source through its TypeScript and Metro configuration.

Delete stale build or Metro caches after changing package exports or workspace
paths.

## Contributing

Install workspace dependencies and run the full gate before opening a pull
request:

```bash
npm install
npm run example:typecheck
npm run quality
```

Changes to fonts, slots, measurement, Reanimated integration, or native
dependencies also require the device release checklist.

## License

MIT
