# Local curriculum workspace

This browser app runs the AI Architecture Practitioner curriculum from Week 0 through Week 60. It is a learning environment for the learner, not an answer generator: work unlocks sequentially, completion requires recorded evidence and reflection, and the coaching prompt tells the assistant to ask before telling.

## Run it

Node.js 22.13 or newer is required.

```powershell
npm install
npm run dev
```

Open the localhost URL printed by the command. The app stores progress in this browser's `localStorage`; use **My progress > Export progress** to make a portable JSON backup.

## Verify it

```powershell
npm test
npm run lint
```

`npm test` builds the production bundle and verifies the server-rendered course shell. The curriculum data is generated deterministically from the authoritative Word document:

```powershell
python scripts/generate_curriculum_data.py
```

The generator requires no third-party Python packages.
