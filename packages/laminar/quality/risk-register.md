# Risk Register

Scores use probability (`P`) and impact (`I`) from 1 to 5. Exposure is
`P x I`. Review scores after every escaped defect or architectural change.

| ID | Risk | P | I | Exposure | Primary controls |
| --- | --- | ---: | ---: | ---: | --- |
| R-01 | Rapid updates overload JS/UI threads or accumulate animations | 4 | 5 | 20 | RUN-ST, performance charter, device FPS |
| R-02 | Slot reel clips or uses incorrect native font metrics | 4 | 4 | 16 | RUN-BVA, REG-001, iOS/Android font matrix |
| R-03 | Glyph identity changes remount unchanged characters | 3 | 5 | 15 | TK-ST, HTG-ST, repeated-glyph regression |
| R-04 | Numeric lanes lose place-value identity on growth/shrink | 3 | 5 | 15 | NL-ST, HNL-ST, formatted-number matrix |
| R-05 | Numeric direction is wrong for signs, decimals, or formatting | 3 | 4 | 12 | NL-EP/BVA, update sequences |
| R-06 | Auto width starts at zero, becomes stale, or animates duplicates | 3 | 4 | 12 | HAW-ST/BVA/DT, device layout checks |
| R-07 | Hidden measurement is exposed to accessibility or interaction | 2 | 5 | 10 | MV-DT-004, screen-reader checklist |
| R-08 | Unicode graphemes split into corrupt visual units | 2 | 5 | 10 | DU-EP, mixed-script exploratory charter |
| R-09 | Preset/override selection changes animation contract | 2 | 4 | 8 | MP/HMM decision tables |
| R-10 | Package exports resolve source/build incorrectly by consumer | 2 | 5 | 10 | API-REG, build, pack check, sample consumer |
| R-11 | Alignment, clipping, or full-width branches regress | 2 | 3 | 6 | MV-DT, API-DT, device matrix |
| R-12 | Reanimated or React Native peer-version change breaks runtime | 3 | 5 | 15 | CI, peer matrix before release |
| R-13 | Extremely long content causes quadratic LCS latency | 3 | 4 | 12 | performance charter, length boundaries |
| R-14 | Runtime values outside TypeScript contract crash rendering | 2 | 3 | 6 | API-EP fault attacks |

## Risk-based depth

- Exposure **15-25:** automated branches plus native or performance evidence
  for affected changes.
- Exposure **8-14:** automated decision/transition coverage and targeted
  exploratory work.
- Exposure **1-7:** automated representative partitions; manual work when the
  changed implementation is platform-sensitive.

An unresolved Critical defect blocks release regardless of score. A Major
defect blocks release unless the owner, workaround, affected population, and
explicit risk acceptance are recorded.
