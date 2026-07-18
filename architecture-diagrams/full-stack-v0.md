# Full AI Application Stack - Week 0, Version 0

This first-pass conceptual diagram separates the request/data path from the hosting layers, operations, and governance controls. It is intentionally implementation-neutral.

```mermaid
flowchart TB
    subgraph GOV["Governance and human accountability"]
        Policy["Policy, risk limits, privacy, and approvals"]
        Change["Evaluation, acceptance, change control, and rollback authority"]
        Human["Human review and high-consequence fallback"]
    end

    subgraph PEOPLE["People and client boundary"]
        User["Authorized user"]
        UI["Browser or local client"]
        Admin["Operator / administrator"]
    end

    subgraph APP["Application and AI services"]
        Gateway["Local API / gateway"]
        Identity["Identity, session, and authorization"]
        Orchestrator["Application orchestration and policy enforcement"]
        Retrieval["Permission-filtered retrieval"]
        Context["Prompt and context assembly"]
        Inference["Tokenizer, model runtime, and inference"]
        Tools["Validated tools with approval gates"]
        Response["Post-processing, citations, and response streaming"]
    end

    subgraph DATA["Data and model assets"]
        Content["Governed documents and records"]
        Index["Search / vector index"]
        Model["Model weights, tokenizer, and configuration"]
        Systems["Approved external or local systems"]
    end

    subgraph OPS["Operations and evidence"]
        Telemetry["Logs, metrics, traces, and audit events"]
        Backup["Backups, restoration, and disaster recovery"]
        Deploy["Configuration, deployment, upgrades, and rollback"]
    end

    subgraph HOST["Execution platform"]
        Processes["Processes, containers, libraries, and secrets"]
        OS["Operating system, kernel, drivers, networking, and storage"]
        Boot["Firmware and boot chain"]
        Hardware["CPU, RAM, GPU / VRAM, disks, NIC, power, and cooling"]
    end

    User -->|"prompt / action"| UI
    UI -->|"HTTP or IPC request"| Gateway
    Gateway --> Identity
    Identity -->|"authorized request"| Orchestrator
    Orchestrator --> Retrieval
    Content --> Index
    Index --> Retrieval
    Retrieval -->|"allowed evidence"| Context
    Orchestrator --> Context
    Context --> Inference
    Model --> Inference
    Inference -->|"generated tokens or tool proposal"| Orchestrator
    Orchestrator -->|"validated invocation"| Tools
    Tools --> Systems
    Systems -->|"tool result"| Orchestrator
    Orchestrator --> Response
    Response --> UI
    UI --> User

    Hardware --> Boot --> OS --> Processes
    Processes -. "hosts" .-> Gateway
    Processes -. "hosts" .-> Retrieval
    Processes -. "hosts" .-> Inference

    Policy -. "constrains" .-> Identity
    Policy -. "constrains" .-> Orchestrator
    Policy -. "constrains" .-> Retrieval
    Policy -. "constrains" .-> Tools
    Change -. "controls versions" .-> Model
    Change -. "controls deployment" .-> Deploy
    Human -. "approves or overrides" .-> Tools
    Human -. "receives escalation" .-> Response

    Gateway -.-> Telemetry
    Identity -.-> Telemetry
    Orchestrator -.-> Telemetry
    Retrieval -.-> Telemetry
    Inference -.-> Telemetry
    Tools -.-> Telemetry
    Admin --> Deploy
    Admin --> Backup
    Admin --> Telemetry
    Deploy -. "manages" .-> Processes
    Backup -. "protects" .-> Content
    Backup -. "protects" .-> Model
    Telemetry -. "evidence" .-> Change
    Telemetry -. "accountability" .-> Policy
```

## Boundary assumptions

- The language model proposes text and tool requests; application code enforces identity, permissions, schemas, approvals, and side effects.
- Retrieved content is untrusted input and cannot grant itself authority.
- Governance controls model, data, configuration, deployment, retention, and tool policy rather than existing only as prompt text.
- Observability must diagnose failures without exposing unnecessary private content.
- Physical constraints such as RAM, VRAM, storage, power, cooling, and network capacity affect every service above them.
