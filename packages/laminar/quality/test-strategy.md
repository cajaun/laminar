# Test Strategy

## Purpose and scope

This strategy covers every source and public contract owned by
`packages/laminar`. It protects API compatibility, text and numeric identity,
motion selection, layout measurement, rendering decisions, packaging, and
observable behavior on supported React Native platforms.

Demo application behavior is evidence for integration and performance but is
not a substitute for package tests. Jest cannot establish native font
correctness, UI-thread smoothness, or device accessibility, so those claims
require the release checklist and exploratory charters.

## Quality objectives

1. Preserve glyph and numeric lane identity across updates.
2. Render text, numbers, slots, punctuation, whitespace, emoji, and formatted
   values without data loss.
3. Keep animation defaults, overrides, delays, and mount/update behavior
   predictable.
4. Prevent measurement content from becoming visible, interactive, or
   accessible.
5. Maintain public exports, TypeScript declarations, build outputs, and npm
   package contents.
6. Detect performance regressions under rapid updates on real devices.

## Test levels

| Level | Purpose | Execution |
| --- | --- | --- |
| Static | Type contracts and package compilation | `npm run typecheck` |
| Model unit | Pure grapheme, LCS, magnitude, and lane rules | Jest |
| Hook state | Multi-render ledgers and measurement state | Jest |
| Component contract | Render branches and delegated animation props | Jest |
| Package | Bob build and npm pack manifest | `build`, `pack:check` |
| Native integration | Font metrics, clipping, accessibility, FPS | Device checklist |
| Exploratory | Unknown and interaction-dependent risks | Session charter |

## Techniques

- **Equivalence partitioning:** empty, text, numeric, formatted, negative,
  Unicode, punctuation, enabled, and disabled inputs.
- **Three-value boundary analysis:** values immediately below, at, and above
  digit, width, duration, line-height, and empty/non-empty boundaries.
- **Decision tables:** variant/default preset, auto-size/clip/alignment,
  lead/digit/punctuation, mount/update, and direction outcomes.
- **State transitions:** mount, first measurement, subsequent measurement,
  content update, reel recenter, and unmount.
- **White-box coverage:** statement and branch ratchets expose untested control
  flow without replacing behavioral assertions.
- **Historical regression:** real-device clipping, lane remounts, stale width,
  first-paint animation, and rapid-update frame loss.
- **Experience based:** fault attacks using malformed runtime values, extreme
  lengths, mixed scripts, unusual fonts, and update bursts.

## Entry and exit criteria

Entry requires an identifiable change, acceptance criteria or observable
contract, a testable build, and known affected risks.

A package change is releasable only when:

- `npm run quality` passes on the supported Node version.
- No Critical or unresolved release-blocking Major defect exists.
- Changed behavior has automated regression coverage where deterministic.
- Native-sensitive changes complete the relevant device checklist rows.
- Coverage does not fall below the configured ratchet.
- New risks, regressions, and workarounds are recorded.

## Coverage policy

The ratchet is enforced in `jest.config.js`:

- Global: 95% statements, 95% lines, 100% functions, 85% branches.
- Model layer: 95% statements/lines, 100% functions, 90% branches.

Coverage exclusions are limited to declarations and type-only files. Lowering
a threshold requires a documented rationale and follow-up owner. Raising the
ratchet after sustained improvement is encouraged. High coverage is evidence
of exercised code, not proof of correct native behavior.

## Test reliability

Tests must be deterministic, isolated, and free from timers, network, device
daemons, and test-order dependence. Reanimated is represented by a
package-owned contract mock; tests assert Laminar's calls and state, not
private Reanimated implementation details. A flaky test is treated as a
defect, quarantined only with an owner, issue, and expiry date.

## Change impact rule

Every pull request touching package source must identify:

- Public or internal contracts changed.
- Risk-register rows affected.
- Added or updated case IDs.
- Native matrices required.
- Compatibility or migration impact.

Pure refactors still run the full automated gate. Changes to slots, layout,
font handling, Reanimated integration, exports, or peer dependencies also run
the native/package checks.
