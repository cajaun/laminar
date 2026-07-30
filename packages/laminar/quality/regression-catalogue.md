# Regression Catalogue

This catalogue converts known failure modes into permanent test obligations.

| ID | Failure mode | Automated evidence | Manual evidence |
| --- | --- | --- | --- |
| REG-001 | Slot digits clip, overlap, or show adjacent reel rows on device | RUN-BVA-001 | Release checklist font matrix |
| REG-002 | Rapid updates cause severe JS/UI FPS loss | State/update tests | Performance charter |
| REG-003 | Unchanged text glyphs remount during insertion/replacement | TK-ST, HTG-ST | Slow-motion visual check |
| REG-004 | Place-value lanes shift when number length changes | NL-REG/ST, HNL-ST | Formatted-number sequence |
| REG-005 | First width animates from zero | HAW-ST-001 | Cold-mount recording |
| REG-006 | Duplicate measurements restart width animation | HAW-DT-001 | Layout churn scenario |
| REG-007 | First paint animates unexpectedly | RUN-ST-001, NLA-ST-001 | Cold-mount observation |
| REG-008 | Spaces collapse in hidden measurement | DU-REG-001, API-DT-004 | Proportional-font check |
| REG-009 | Emoji/combining marks split into corrupt glyphs | DU-EP | Mixed Unicode charter |
| REG-010 | Hidden measurement is announced by screen reader | MV-DT-004 | VoiceOver/TalkBack |
| REG-011 | Source/build exports diverge | API-REG-001, build, pack check | Example consumer |

Add a row for every confirmed escaped or high-impact pre-release defect.
Removing a regression obligation requires evidence that the behavior or
affected surface no longer exists.
