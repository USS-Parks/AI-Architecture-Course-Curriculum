# AI Architecture Course Curriculum

Most AI courses begin at the model API. This one begins lower: hardware, operating systems, networks, mathematics, and code. It keeps going until the learner can build a local AI service, explain every major boundary, recover it after a failure, and hand it to another administrator without relying on undocumented knowledge.

The course runs for 60 instructional weeks after an initial Week 0 setup. Plan on 8-10 hours each week. The work is practical: study a concept, build something with it, break it on purpose, diagnose the failure, and document what happened.

This is not a prompt-engineering course. It is a systems course for people who need to understand where AI applications come from, how they fail, and what it takes to operate them responsibly.

## What the learner builds

The program moves through one continuous stack:

1. **Computational foundations** - binary representation, Linux, Python, Git, networking, HTTP, databases, and automation.
2. **Model foundations** - vectors, probability, optimization, neural networks, tokenization, attention, and a small transformer trained from random initialization.
3. **Local inference** - open-weight models, quantization, `llama.cpp`, `vLLM`, memory planning, benchmarking, and capacity limits.
4. **Application architecture** - FastAPI, retrieval, citations, document permissions, tools, approval gates, and model-facing interfaces.
5. **Operations and governance** - evaluation, observability, incident response, privacy, security, backup, restoration, upgrades, rollback, energy use, and client handoff.

The capstone is a locally hosted organizational knowledge and operations system. It answers questions from governed documents, cites its evidence, respects access boundaries, and can propose limited actions without authorizing them on its own.

## How the course works

Each week combines five kinds of work:

| Activity | Typical time | Purpose |
|---|---:|---|
| Instruction and reading | 2 hours | Learn the week's concepts |
| Exercises | 1.5-2 hours | Work through the math, code, and architecture |
| Construction lab | 3-4 hours | Build the week's component |
| Failure lab | 1 hour | Break it and diagnose the boundary that failed |
| Documentation and teach-back | 1 hour | Explain the result in language a client can use |

A module is not complete because the code ran once. Its exit gate must pass, the result must be reproducible, and the learner must be able to explain why it works.

Four examinations test the full chain:

- **Week 19:** packet to process
- **Week 38:** text to weights to text
- **Week 55:** request to audited response
- **Week 60:** independent client ownership

The minimum module score is 80 percent. Certain failures are automatic non-passes, including unauthorized data disclosure, unapproved write actions, untested model or data changes, unrecoverable backups, embedded credentials, and the absence of a human fallback for high-consequence use.

## Start here

The complete course plan is available as [AI Architecture Practitioner Curriculum.docx](curriculum/AI%20Architecture%20Practitioner%20Curriculum.docx).

Week 0 establishes the laboratory and records an honest starting point:

- [Environment inventory](environment.md)
- [Baseline explanation: what happens after a user presses Send](notes/what-happens-after-send-baseline.md)
- [Number conversion and matrix diagnostics](mathematics/week-0-diagnostics.md)
- [Python word-count diagnostic](programming/week-0-word-count-results.md)
- [HTTP request diagnostic](computer-systems/http-request-diagnostic.md)
- [First full-stack architecture diagram](architecture-diagrams/full-stack-v0.md)

The existing Week 0 artifacts were prepared with assistant help. They are useful as a project baseline, but they do not prove independent mastery. The learner should redo the diagnostics without assistance and mark every part of the baseline explanation they cannot yet defend.

## Repository layout

The repository mirrors the course rather than organizing everything by file type:

```text
curriculum/                 authoritative course document
notes/                      explanations and learning notes
mathematics/                math exercises and proofs of work
programming/                Python and software construction
computer-systems/           hardware, OS, networking, and protocols
machine-learning/           classical ML and neural-network foundations
transformer-from-scratch/   tokenizer, attention, training, and inference
local-inference/            model runtimes, quantization, and benchmarks
application-stack/          APIs and service architecture
retrieval/                  indexing, evidence, and permissions
tools-and-agents/           bounded tools and approval workflows
security/                   threats, controls, and privacy
observability/              logs, metrics, traces, and audit evidence
evaluations/                quality, safety, and acceptance tests
architecture-diagrams/      logical, physical, data-flow, and trust views
runbooks/                   installation, recovery, upgrade, and rollback
client-training/            operator training and knowledge transfer
capstone/                   final integrated system and handoff package
```

## Safety boundary

Development should use synthetic, public-domain, or openly licensed material. The capstone is not intended to make emergency medical decisions, issue evacuation orders, replace incident command, or act as the sole authority in another life-safety setting. Security and authorization controls belong in ordinary software and infrastructure, not only in instructions given to the model.

The final standard is simple: another administrator should be able to identify every model and data version, operate the service, diagnose common failures, restore it from backup, roll back a bad change, disable a dangerous tool, and explain when a human must take over.
