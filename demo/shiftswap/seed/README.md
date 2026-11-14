# ShiftSwap

Shift swap requests for refinery operators, checked against the site fatigue standard and
qualification records before a supervisor sees them. Pilot scope: the Crude Distillation Unit and
Hydrocracker Unit at Port Alder Refinery.

> **Fictional demo project.** Veridane Energy, Port Alder Refinery, the people named in this
> repository, and every figure and limit in `docs/standards/` and `docs/discovery/` were invented
> for a demonstration. Nothing here is real guidance on fatigue management.

This repository is a starting skeleton. The toolchain is in place and no feature is built.

- `AGENTS.md` — layout, commands, style, guardrails. Start there.
- `docs/discovery/` — the problem, as the client described it.
- `docs/standards/` — the client's fatigue standard and IT engineering standard.
- `docs/design/quality/nfr-register.md` — the standing non-functional requirements.

## Quick start

```bash
npm ci
```

```bash
npm run build && npm run lint && npm test
```
