# Laminar API Test Design

## Test object

Public component aliases and props; grapheme and numeric models; identity
ledgers; motion recipes; measurement; text, number, and slot renderers;
compiled and packed package output.

## State models

### Width state

`Disabled -> Unmeasured -> Bootstrapped -> Animating -> Bootstrapped`

- Disabled measurement attempts are invalid/no-op transitions.
- First distinct measurement snaps.
- Later distinct measurements use `driveToWidth`.
- Duplicate measurements are no-op transitions.

### Content state

`Mounted(value A) -> Updated(value B) -> Updated(value C) -> Unmounted`

- Mount suppresses content enter animation.
- Updates reconcile identity and derive direction.
- Slot unmount delegates its spin-out target to the latest motion recipe.

## Partitions and boundaries

| Input | Partitions | Boundaries |
| --- | --- | --- |
| Text | empty, ASCII, spaces, emoji, combining, repeated glyphs | 0/1 units; prefix/middle/suffix |
| Number | empty, positive, negative, equal, formatted, nonnumeric | 0/9 digits; grow/shrink by one lane |
| Width | disabled, first, duplicate, changed, negative | below 0, 0, above 0; integer/fraction |
| Motion | timing, zero-bounce spring, bouncing spring, override | 0 and fractional duration/delay |
| View | 3 alignments x clip on/off x auto-size on/off | all feasible decision columns |
| Slot | lead, digit, punctuation; up/down/stationary | minimum line height; reel recenter limits |

## Decision tables

### Variant and default motion

| Rule | Variant | Explicit preset | Expected renderer | Default preset |
| --- | --- | --- | --- | --- |
| V1 | text | no | TextRun | default |
| V2 | number | no | NumberRun | snappy |
| V3 | slots | no | SlotsRun | snappy |
| V4 | any | yes | selected variant | explicit preset |

Covered by `API-DT-001..003` and `HMM-DT-001..004`.

### Numeric lane rendering

| Rule | Before first digit | ASCII digit | Result |
| --- | --- | --- | --- |
| N1 | yes | irrelevant | Stable plain lead text |
| N2 | no | yes | Animated numeric/slot lane |
| N3 | no | no | Animated punctuation token |

Covered by `NLA-DT`, `RUN-DT`, and `NL-ST`.

### Auto-size

| Rule | Enabled | Width seen | Width changed | Result |
| --- | --- | --- | --- | --- |
| A1 | no | any | any | Ignore; full-width viewport |
| A2 | yes | no | yes | Snap first width |
| A3 | yes | yes | no | No-op |
| A4 | yes | yes | yes | Drive animated width |

Covered by `HAW-ST/BVA/DT`, `MV-DT-004/007`, and `API-DT-004/005`.

## Traceability

| Risk | Automated groups | Manual group |
| --- | --- | --- |
| R-01/R-13 performance | RUN-ST, TK-ST, NL-ST | PERF-EXP-001 |
| R-02 slot metrics | RUN-BVA/DT/ST | REG-001 checklist |
| R-03/R-08 text identity | DU-EP, TK-ST/REG, HTG-ST | Unicode charter |
| R-04/R-05 numeric identity | NL-EP/BVA/ST/REG, HNL-ST | Number matrix |
| R-06 width | HAW-ST/BVA/DT | Auto-size checklist |
| R-07 accessibility | MV-DT-004 | VoiceOver/TalkBack |
| R-09 motion | MP/HMM/ET | Reduced-motion observation |
| R-10/R-12 packaging | API-REG, typecheck, build, pack | Consumer matrix |
| R-11 layout | MV-DT, API-DT | Device matrix |
| R-14 invalid runtime data | API-EP | Fault attack |

## Oracle notes

Pure outputs and rendered props use exact oracles. Native typography and frame
rate use comparative baselines plus explicit thresholds. Animation mocks prove
delegation and state decisions only; they do not prove native timing,
interpolation, frame pacing, or clipping.
