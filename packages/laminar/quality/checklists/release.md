# Package Release Checklist

Record version, commit, tester, date, devices, and evidence links.

## Automated and package

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run quality` passes.
- [ ] Coverage meets the ratchet with no unexplained decline.
- [ ] Packed file list contains expected `src`, `lib`, declarations, README,
      and manifest; no local or test artifacts.
- [ ] Public exports load in a minimal consumer.
- [ ] Peer dependency ranges match tested React Native/Reanimated versions.

## Functional device matrix

Run on at least one current iOS device and one current Android device:

- [ ] Text, number, and slots mount without initial content animation.
- [ ] Empty, one-character, long, negative, decimal, currency, grouped,
      whitespace, emoji, combining-mark, and RTL-adjacent values render.
- [ ] Left, center, and right alignments behave with auto-size on and off.
- [ ] Clip-to-bounds on/off matches expected overflow behavior.
- [ ] Custom font, system font, minimum font size, large font, and explicit
      line height do not clip slot rows.
- [ ] Value growth and shrink preserve place-value/glyph continuity.
- [ ] Rapid updates stop cleanly and settle on the final value.

## Accessibility

- [ ] VoiceOver and TalkBack announce only visible content.
- [ ] Hidden measurement content is neither focusable nor announced.
- [ ] Dynamic Type/font scaling does not make content unreadable.
- [ ] Increased contrast and reduced-motion settings have no severe failure.

## Performance

- [ ] Execute `PERF-EXP-001` on a release build, not remote debugging.
- [ ] Capture JS and UI FPS plus profiler evidence for text, number, slots.
- [ ] No sustained freeze, runaway memory growth, or animation backlog remains
      after the update burst.
- [ ] Compare against the last released baseline on the same device/build mode.

## Defects and release decision

- [ ] No open Critical defect.
- [ ] Every open Major defect has explicit risk acceptance and workaround.
- [ ] New defects include classification, environment, evidence, and case ID.
- [ ] New historical regressions are added to the catalogue and suite.
- [ ] Release owner records Go/No-Go decision and residual risks.
