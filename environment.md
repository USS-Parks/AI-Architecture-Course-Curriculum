# Week 0 Environment Record

Captured: 2026-07-18

This is a point-in-time inventory of the machine on which the curriculum repository was created. Values marked as reported come from Windows system interfaces and command output; they have not been benchmarked.

## Host and operating system

| Item | Recorded value |
|---|---|
| Computer name | `FIRE-STARTER` |
| Operating system | Microsoft Windows 11 Home |
| Version | 25H2; OS version `10.0.26200`; build `26200.8875` |
| Architecture | 64-bit |
| WSL | WSL2 platform present; default version 2; no Linux distribution installed |

The curriculum calls for access to Linux. The present WSL state is therefore an environment gap, not a completed prerequisite.

## Hardware

| Item | Recorded value |
|---|---|
| CPU | AMD Ryzen 7 5800H with Radeon Graphics |
| Logical processors | 16 |
| Installed RAM | 64,269,381,632 bytes (59.86 GiB) |
| Integrated GPU | AMD Radeon(TM) Graphics; Windows reported 4,293,918,720 bytes of adapter memory |
| Discrete GPU | NVIDIA GeForce RTX 3050 Ti Laptop GPU; 4,096 MiB VRAM |
| NVIDIA driver | 546.30 (`nvidia-smi`); Windows display driver reported `31.0.15.4630` |
| C: storage | NTFS; 952.85 GiB total; 271.87 GiB free at capture |
| D: storage | NTFS; 953.85 GiB total; 953.72 GiB free at capture |

GPU memory reported through Windows management interfaces can include renderer-specific or shared-memory behavior. The NVIDIA VRAM figure above is the dedicated-device value reported by `nvidia-smi`.

## Core toolchain

| Tool | Recorded value |
|---|---|
| Python | 3.14.4 (`python` and `py`) |
| Git | 2.54.0.windows.1 |
| Visual Studio Code | 1.127.0 |
| curl | 8.21.0 for Windows; Schannel TLS backend |
| OpenSSH client | OpenSSH_for_Windows_9.5p2; LibreSSL 3.8.2 |

## Reproduction notes

1. Confirm Windows, CPU, RAM, disks, and GPUs from Windows Settings or PowerShell.
2. Run `python --version` and `git --version`.
3. Run `wsl --status` and `wsl --list --verbose`.
4. Install a Linux distribution before attempting Linux-specific curriculum labs.
5. Re-run this inventory after major OS, driver, Python, Git, storage, or GPU changes; retain older snapshots for comparison.

## Known gaps

- No WSL Linux distribution is installed.
- The four diagnostics in this repository were executed with assistant help and still require an independent learner attempt.
- A fresh-machine rebuild has not been demonstrated.
- The Week 0 clone/run/modify exit-gate demonstration has not been performed.
