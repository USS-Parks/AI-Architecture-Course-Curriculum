import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repositoryPath = "/AI-Architecture-Course-Curriculum";

test("exports a complete GitHub Pages application under the repository path", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>AI Architecture Practitioner/);
  assert.match(html, /Week 0/);
  assert.match(html, new RegExp(`${repositoryPath}/_next/`));
  assert.match(
    html,
    new RegExp(
      `${repositoryPath}/curriculum/AI%20Architecture%20Practitioner%20Curriculum\\.docx`,
    ),
  );
  assert.doesNotMatch(html, /(?:href|src)="\/_next\//);
});

test("publishes the authoritative curriculum document unchanged", async () => {
  const [source, exported] = await Promise.all([
    readFile(new URL("../../curriculum/AI Architecture Practitioner Curriculum.docx", import.meta.url)),
    readFile(new URL("../out/curriculum/AI Architecture Practitioner Curriculum.docx", import.meta.url)),
  ]);
  const digest = (value) => createHash("sha256").update(value).digest("hex");

  assert.equal(digest(exported), digest(source));
});
