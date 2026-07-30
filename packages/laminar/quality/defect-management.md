# Defect Management

## Severity spectrum

Severity reflects user and package-consumer impact, not implementation effort.

| Severity | Laminar definition | Examples | Release treatment |
| --- | --- | --- | --- |
| Critical | Crash, app-wide failure, data/security harm, or package cannot be consumed; no effective workaround | Import crashes every consumer; update loop freezes app | Release blocked |
| Major | Core variant or supported platform is substantially unusable; workaround exists or scope is limited | Slots unreadable on iOS; sustained rapid updates collapse frame rate | Block unless explicit risk acceptance |
| Minor | Localized incorrect behavior with moderate inconvenience | One alignment branch wrong; width briefly stale | Fix by planned priority |
| Trivial | Cosmetic/documentation issue without meaningful functional impact | Small visual inconsistency or typo | Routine backlog |

Severity may change as affected platforms, frequency, or workarounds become
clear. Priority is assigned separately.

## Required defect record

Use the defect template and include:

- Concise observed-versus-expected summary.
- Version, commit, React Native/Reanimated versions, device/OS, architecture.
- Reproducible input and update sequence.
- Frequency and smallest known reproduction.
- Video, screenshot, trace, or profiler evidence where applicable.
- Severity, impact, workaround, and suspected risk-register row.
- Discovery phase and originating case/charter ID.

## Workflow

`New -> Triaged -> Ready -> In progress -> Resolved -> Verification -> Closed`

`Reopened` is valid from Verification or Closed. Duplicate, Not a defect,
Cannot reproduce, and Deferred require rationale. Closure requires
verification on the environment that exposed the defect and a regression test
or documented reason automation is unsuitable.

## Metrics

Track monthly and by release:

- Escaped defect ratio = external defects / all defects. Target `<= 5%`.
- Critical escaped defect ratio = external Critical defects / all defects.
  Target `<= 3%`.
- Post-development Critical defect count. Target `<= 10/year`.
- Reopen rate, defect age by severity, and flaky-test count.

Metrics improve the process; they must not be used to suppress reporting or
discourage discovery.
