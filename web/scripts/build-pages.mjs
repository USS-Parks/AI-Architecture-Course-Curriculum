import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/").at(-1) ??
  "AI-Architecture-Course-Curriculum";
const basePath = process.env.PAGES_BASE_PATH ?? `/${repositoryName}`;
const nextCli = join(webRoot, "node_modules", "next", "dist", "bin", "next");

const build = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: webRoot,
  env: {
    ...process.env,
    STATIC_EXPORT: "true",
    PAGES_BASE_PATH: basePath,
  },
  stdio: "inherit",
});

if (build.error) throw build.error;
process.exit(build.status ?? 1);
