# Laminar Quality System

This directory is the operating layer for quality work on
`react-native-laminar`. Automated checks, manual device work, exploratory
testing, defect handling, and release decisions are deliberately connected.

## Core documents

- [Test strategy](./test-strategy.md)
- [Risk register](./risk-register.md)
- [Laminar API test design](./test-design/laminar-api.md)
- [Regression catalogue](./regression-catalogue.md)
- [Defect management](./defect-management.md)
- [Release checklist](./checklists/release.md)
- [Animation performance charter](./charters/animation-performance.md)

## Templates

- [Test case](./templates/test-case.md)
- [Defect](./templates/defect.md)
- [Exploratory session](./templates/exploratory-session.md)

## Traceability convention

Automated and manual cases use `<area>-<technique>-<sequence>` identifiers.
The technique codes are:

| Code | Technique |
| --- | --- |
| `EP` | Equivalence partitioning |
| `BVA` | Boundary value analysis |
| `DT` | Decision-table testing |
| `ST` | State-transition testing |
| `REG` | Historical regression testing |
| `EXP` | Exploratory testing |

The test name carries the ID. The API design document maps risks to those
IDs. Defects record the originating test or charter, making regression
selection and escaped-defect analysis possible.
