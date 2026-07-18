import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the curriculum workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>AI Architecture Practitioner/);
  assert.match(html, /Week 0/);
  assert.match(html, /No deadlines\. Gates, not dates\./);
  assert.match(html, /Copy coaching prompt/);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape|codex-preview/i);
});

test("keeps progression local, sequential, and learner-owned", async () => {
  const [courseApp, curriculum] = await Promise.all([
    readFile(new URL("../app/course-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/curriculum-data.json", import.meta.url), "utf8"),
  ]);
  const data = JSON.parse(curriculum);

  assert.equal(data.modules.length, 17);
  assert.equal(data.modules.flatMap((module) => module.weeks).length, 61);
  assert.match(courseApp, /ai-architecture-practitioner-state-v1/);
  assert.match(courseApp, /index <= firstIncompleteIndex/);
  assert.match(courseApp, /Export progress/);
  assert.match(courseApp, /Import backup/);
  assert.match(courseApp, /Do not complete my assignment or claim the gate for me/);
  assert.match(courseApp, /I attempted the work first/);
});
