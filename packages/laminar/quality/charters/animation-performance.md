# PERF-EXP-001: Rapid Animation and Rendering

## Mission

Discover correctness, responsiveness, frame-pacing, memory, and cleanup
failures while Laminar receives rapid and adversarial value updates.

## Time box

60 minutes per platform/build pair. Use a physical device and release build.

## Setup

Record device, OS, architecture, React Native/Reanimated versions, commit,
font, font size, line height, variant, update source, and profiler tools.
Disable remote JS debugging. Capture idle baseline FPS and memory first.

## Tours

1. Update one mounted instance at 1, 10, 30, and 60 changes/second for 30
   seconds.
2. Repeat with 1, 10, and 50 simultaneously mounted instances.
3. Exercise short/long alternation, `9 <-> 10`, `99 <-> 100`, positive/negative,
   grouped decimals, currency prefixes, empty values, and repeated glyphs.
4. Run text, number, and slots separately, then mixed.
5. Switch screens during rapid updates; background/foreground; unmount
   mid-animation.
6. Repeat with system font, custom font, explicit line height, large text, and
   clip-to-bounds.
7. Stop updates and observe final value, animation backlog, memory recovery,
   and thread responsiveness.

## Oracles and evidence

- Final rendered value equals the final supplied value.
- Touch/navigation remains responsive and no app freeze occurs.
- No clipping, overlap, stale glyph, wrong direction, or post-unmount update.
- FPS degradation is compared with the previous release on the same device.
- A drop below 50 FPS sustained for more than one second, or below 30 FPS at
  any repeatable load, is at least Major pending triage.
- Attach screen recording, JS/UI FPS trace, React profiler trace, memory
  before/peak/after, and minimal reproduction.

## Debrief

Record coverage achieved, variations not run, defects, questions, suspected
risks, and automation candidates using the exploratory-session template.
