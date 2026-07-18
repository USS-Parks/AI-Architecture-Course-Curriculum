# Local curriculum workspace

This browser app runs the AI Architecture Practitioner curriculum from Week 0 through Week 60. It is a learning environment for the learner, not an answer generator: work unlocks sequentially, completion requires recorded evidence and reflection, and the coaching prompt tells the assistant to ask before telling.

## Run it

Node.js 22.13 or newer is required.

```powershell
npm install
npm run dev
```

Open the localhost URL printed by the command. The app stores progress in this browser's `localStorage`; use **My progress > Export progress** to make a portable JSON backup.

The same interface is published at [uss-parks.github.io/AI-Architecture-Course-Curriculum](https://uss-parks.github.io/AI-Architecture-Course-Curriculum/). Pushes to `main` that change `web/` automatically rebuild and deploy it through GitHub Actions.

## Verify it

```powershell
npm test
npm run test:pages
npm run lint
```

`npm test` verifies the localhost production bundle. `npm run test:pages` builds the repository-path static export and checks its assets and curriculum download. The curriculum data is generated deterministically from the authoritative Word document:

```powershell
python scripts/generate_curriculum_data.py
```

The generator requires no third-party Python packages.
