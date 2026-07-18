"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, RefObject } from "react";
import type {
  CurriculumData,
  CurriculumModule,
  CurriculumWeek,
} from "./curriculum-types";

type View = "learn" | "roadmap" | "guide" | "progress";

type WeekProgress = {
  goal: string;
  notes: string;
  evidence: string;
  reflection: string;
  reviewed: boolean;
  attempted: boolean;
  defended: boolean;
  completedAt?: string;
};

type LearnerState = {
  version: 1;
  currentWeekId: string;
  completedWeekIds: string[];
  weeks: Record<string, WeekProgress>;
};

type FlatWeek = CurriculumWeek & {
  module: CurriculumModule;
};

const STORAGE_KEY = "ai-architecture-practitioner-state-v1";

const EMPTY_WEEK: WeekProgress = {
  goal: "",
  notes: "",
  evidence: "",
  reflection: "",
  reviewed: false,
  attempted: false,
  defended: false,
};

const DEFAULT_STATE: LearnerState = {
  version: 1,
  currentWeekId: "week-0",
  completedWeekIds: [],
  weeks: {},
};

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "roadmap", label: "Roadmap" },
  { id: "guide", label: "Course guide" },
  { id: "progress", label: "My progress" },
];

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function joinClass(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function CourseApp({ data }: { data: CurriculumData }) {
  const allWeeks = useMemo<FlatWeek[]>(
    () =>
      data.modules.flatMap((module) =>
        module.weeks.map((week) => ({ ...week, module })),
      ),
    [data.modules],
  );
  const [learner, setLearner] = useState<LearnerState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("learn");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(["module-0"]),
  );
  const [copyStatus, setCopyStatus] = useState("Copy coaching prompt");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as LearnerState;
          if (parsed.version === 1 && Array.isArray(parsed.completedWeekIds)) {
            setLearner({ ...DEFAULT_STATE, ...parsed, weeks: parsed.weeks ?? {} });
            const savedWeek = allWeeks.find((week) => week.id === parsed.currentWeekId);
            if (savedWeek) {
              setExpandedModules((current) => new Set(current).add(savedWeek.module.id));
            }
          }
        }
      } catch {
        // A damaged local backup should never prevent the course from opening.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, [allWeeks]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(learner));
  }, [hydrated, learner]);

  const completed = useMemo(
    () => new Set(learner.completedWeekIds),
    [learner.completedWeekIds],
  );
  const firstIncompleteIndex = Math.min(
    allWeeks.findIndex((week) => !completed.has(week.id)) === -1
      ? allWeeks.length - 1
      : allWeeks.findIndex((week) => !completed.has(week.id)),
    allWeeks.length - 1,
  );
  const selectedIndex = Math.max(
    0,
    allWeeks.findIndex((week) => week.id === learner.currentWeekId),
  );
  const selected = allWeeks[selectedIndex] ?? allWeeks[0];
  const selectedPhase =
    data.phases.find((phase) => phase.id === selected.module.phaseId) ??
    data.phases[0];
  const selectedProgress = {
    ...EMPTY_WEEK,
    ...(learner.weeks[selected.id] ?? {}),
  };
  const completionPercent = Math.round(
    (learner.completedWeekIds.length / allWeeks.length) * 100,
  );
  const selectedIsComplete = completed.has(selected.id);
  const reflectionReady = selectedProgress.reflection.trim().length >= 40;
  const readyToComplete =
    selectedProgress.goal.trim().length > 0 &&
    selectedProgress.evidence.trim().length > 0 &&
    reflectionReady &&
    selectedProgress.reviewed &&
    selectedProgress.attempted &&
    selectedProgress.defended;

  function updateWeek(patch: Partial<WeekProgress>) {
    setLearner((current) => ({
      ...current,
      weeks: {
        ...current.weeks,
        [selected.id]: {
          ...EMPTY_WEEK,
          ...(current.weeks[selected.id] ?? {}),
          ...patch,
        },
      },
    }));
  }

  function isUnlocked(weekId: string) {
    const index = allWeeks.findIndex((week) => week.id === weekId);
    return index <= firstIncompleteIndex || completed.has(weekId);
  }

  function openWeek(weekId: string) {
    if (!isUnlocked(weekId)) return;
    const week = allWeeks.find((item) => item.id === weekId);
    if (week) {
      setExpandedModules((current) => new Set(current).add(week.module.id));
    }
    setLearner((current) => ({ ...current, currentWeekId: weekId }));
    setView("learn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeWeek() {
    if (!readyToComplete || selectedIsComplete) return;
    const nextWeek = allWeeks[selectedIndex + 1];
    if (nextWeek) {
      setExpandedModules((current) => new Set(current).add(nextWeek.module.id));
    }
    setLearner((current) => ({
      ...current,
      currentWeekId: nextWeek?.id ?? selected.id,
      completedWeekIds: Array.from(
        new Set([...current.completedWeekIds, selected.id]),
      ).sort(
        (a, b) =>
          allWeeks.findIndex((week) => week.id === a) -
          allWeeks.findIndex((week) => week.id === b),
      ),
      weeks: {
        ...current.weeks,
        [selected.id]: {
          ...EMPTY_WEEK,
          ...(current.weeks[selected.id] ?? {}),
          completedAt: new Date().toISOString(),
        },
      },
    }));
    setView("learn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyCoachPrompt() {
    const prompt = [
      `I am learning the AI Architecture Practitioner curriculum at my own pace.`,
      `I am on Week ${selected.number}: ${selected.title}.`,
      `My goal for this session is: ${selectedProgress.goal || "help me define one"}.`,
      `Teach one concept at a time. Ask me to attempt each problem before giving a hint.`,
      `Do not complete my assignment or claim the gate for me.`,
      selectedProgress.notes
        ? `What I currently understand or find confusing: ${selectedProgress.notes}`
        : "Begin with a short baseline question.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus("Copied - paste into Codex");
      window.setTimeout(() => setCopyStatus("Copy coaching prompt"), 2200);
    } catch {
      setCopyStatus("Copy failed");
    }
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(learner, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-architecture-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as LearnerState;
      if (
        parsed.version !== 1 ||
        !Array.isArray(parsed.completedWeekIds) ||
        typeof parsed.currentWeekId !== "string"
      ) {
        throw new Error("Unsupported progress file");
      }
      const validWeekIds = new Set(allWeeks.map((week) => week.id));
      const nextState: LearnerState = {
        ...DEFAULT_STATE,
        ...parsed,
        currentWeekId: validWeekIds.has(parsed.currentWeekId)
          ? parsed.currentWeekId
          : "week-0",
        completedWeekIds: parsed.completedWeekIds.filter((id) =>
          validWeekIds.has(id),
        ),
        weeks: parsed.weeks ?? {},
      };
      setLearner(nextState);
      const importedWeek = allWeeks.find((week) => week.id === nextState.currentWeekId);
      if (importedWeek) {
        setExpandedModules((current) => new Set(current).add(importedWeek.module.id));
      }
      setView("learn");
    } catch {
      window.alert("That file is not a valid course progress backup.");
    } finally {
      event.target.value = "";
    }
  }

  function resetProgress() {
    if (
      window.confirm(
        "Reset all notes, evidence, reflections, and completed gates on this browser? Export a backup first if you may need it.",
      )
    ) {
      setLearner(DEFAULT_STATE);
      setExpandedModules(new Set(["module-0"]));
      setView("learn");
    }
  }

  function openModule(module: CurriculumModule) {
    const accessible = module.weeks.find((week) => isUnlocked(week.id));
    if (accessible) openWeek(accessible.id);
  }

  return (
    <div className="course-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("learn")}>
          <span className="brand-mark">AP</span>
          <span>
            <strong>AI Architecture</strong>
            <small>Practitioner curriculum</small>
          </span>
        </button>
        <nav className="topnav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="local-pill">
          <span aria-hidden="true" />
          Saved on this device
        </div>
      </header>

      <aside className="course-sidebar">
        <div className="progress-summary">
          <div
            className="progress-ring"
            style={{ "--progress": `${completionPercent * 3.6}deg` } as CSSProperties}
            aria-label={`${completionPercent}% complete`}
          >
            <strong>{completionPercent}%</strong>
            <span>complete</span>
          </div>
          <div>
            <span className="eyebrow">Your pace</span>
            <strong>{learner.completedWeekIds.length} of {allWeeks.length} units</strong>
            <small>No deadlines. Gates, not dates.</small>
          </div>
        </div>

        <div className="module-list" aria-label="Course modules">
          {data.modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const completedCount = module.weeks.filter((week) =>
              completed.has(week.id),
            ).length;
            const moduleComplete = completedCount === module.weeks.length;
            const moduleCurrent = module.weeks.some(
              (week) => week.id === selected.id,
            );
            return (
              <div className="module-nav-group" key={module.id}>
                <button
                  className={joinClass(
                    "module-nav-button",
                    moduleCurrent && "current",
                    moduleComplete && "complete",
                  )}
                  onClick={() =>
                    setExpandedModules((current) => {
                      const next = new Set(current);
                      if (next.has(module.id)) next.delete(module.id);
                      else next.add(module.id);
                      return next;
                    })
                  }
                  aria-expanded={isExpanded}
                >
                  <span className="module-number">{module.number}</span>
                  <span className="module-nav-copy">
                    <strong>{module.title}</strong>
                    <small>{completedCount}/{module.weeks.length} units</small>
                  </span>
                  <span className="disclosure" aria-hidden="true">
                    {isExpanded ? "-" : "+"}
                  </span>
                </button>
                {isExpanded && (
                  <div className="week-nav-list">
                    {module.weeks.map((week) => {
                      const unlocked = isUnlocked(week.id);
                      const done = completed.has(week.id);
                      return (
                        <button
                          key={week.id}
                          disabled={!unlocked}
                          className={joinClass(
                            week.id === selected.id && "selected",
                            done && "done",
                          )}
                          onClick={() => openWeek(week.id)}
                        >
                          <span>{done ? "✓" : unlocked ? week.number : "·"}</span>
                          <span>Week {week.number}: {week.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="course-main">
        <div className="mobile-progress">
          <span>{completionPercent}% complete</span>
          <progress value={learner.completedWeekIds.length} max={allWeeks.length} />
        </div>
        {view === "learn" && (
          <LearnView
            selected={selected}
            selectedPhase={selectedPhase}
            progress={selectedProgress}
            isComplete={selectedIsComplete}
            ready={readyToComplete}
            reflectionReady={reflectionReady}
            copyStatus={copyStatus}
            updateWeek={updateWeek}
            copyCoachPrompt={copyCoachPrompt}
            completeWeek={completeWeek}
          />
        )}
        {view === "roadmap" && (
          <RoadmapView
            data={data}
            completed={completed}
            selectedId={selected.id}
            isUnlocked={isUnlocked}
            openModule={openModule}
            openWeek={openWeek}
          />
        )}
        {view === "guide" && <GuideView data={data} />}
        {view === "progress" && (
          <ProgressView
            data={data}
            allWeeks={allWeeks}
            completed={completed}
            learner={learner}
            completionPercent={completionPercent}
            exportProgress={exportProgress}
            importProgress={importProgress}
            resetProgress={resetProgress}
            importRef={importRef}
            openWeek={openWeek}
          />
        )}
      </main>
    </div>
  );
}

function LearnView({
  selected,
  selectedPhase,
  progress,
  isComplete,
  ready,
  reflectionReady,
  copyStatus,
  updateWeek,
  copyCoachPrompt,
  completeWeek,
}: {
  selected: FlatWeek;
  selectedPhase: CurriculumData["phases"][number];
  progress: WeekProgress;
  isComplete: boolean;
  ready: boolean;
  reflectionReady: boolean;
  copyStatus: string;
  updateWeek: (patch: Partial<WeekProgress>) => void;
  copyCoachPrompt: () => void;
  completeWeek: () => void;
}) {
  const gateSection = selected.sections.find((section) =>
    /exit|gate|question|examination/i.test(section.title),
  );

  return (
    <div className="view-stack">
      <section className="week-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            {selectedPhase.label} · Module {selected.module.number} · Week {selected.number}
          </span>
          <h1>{selected.title}</h1>
          <p>
            Work at your pace. Attempt the material yourself; use the coach for
            questions, hints, and review—not finished answers.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={copyCoachPrompt}>
              {copyStatus}
            </button>
            <a
              className="secondary-button"
              href="/curriculum/AI%20Architecture%20Practitioner%20Curriculum.docx"
              download
            >
              Download source curriculum
            </a>
          </div>
        </div>
        <div className="hero-unit-card">
          <span>Current unit</span>
          <strong>{String(selected.number).padStart(2, "0")}</strong>
          <p>{isComplete ? `Completed ${formatDate(progress.completedAt)}` : "In progress"}</p>
        </div>
      </section>

      <section className="session-goal card">
        <div>
          <span className="eyebrow">Before you begin</span>
          <h2>Set one goal for this session</h2>
          <p>Small and specific beats ambitious and vague.</p>
        </div>
        <label>
          <span className="sr-only">Session goal</span>
          <input
            value={progress.goal}
            onChange={(event) => updateWeek({ goal: event.target.value })}
            placeholder="Example: Explain function composition in my own words"
          />
        </label>
      </section>

      <section className="learning-layout">
        <div className="lesson-column">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Curriculum material</span>
              <h2>What you will work through</h2>
            </div>
            <span className="section-count">{selected.sections.length} sections</span>
          </div>
          {selected.module.overview.length > 0 && (
            <article className="lesson-card module-context">
              <span className="lesson-index">Context</span>
              <h3>Why this module matters</h3>
              {selected.module.overview.map((item) => <p key={item}>{item}</p>)}
            </article>
          )}
          {selected.sections.map((section, index) => (
            <article className="lesson-card" key={`${section.title}-${index}`}>
              <span className="lesson-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{section.title}</h3>
              {section.items.length > 0 ? (
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Use the following sections as the working sequence.</p>
              )}
            </article>
          ))}
          {selected.module.closingSections.length > 0 &&
            selected.module.weeks.at(-1)?.id === selected.id && (
              <article className="lesson-card module-gate">
                <span className="lesson-index">Module gate</span>
                {selected.module.closingSections.map((section) => (
                  <div key={section.title}>
                    <h3>{section.title}</h3>
                    <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                ))}
              </article>
            )}
        </div>

        <aside className="work-column">
          <section className="work-card card">
            <span className="eyebrow">Your working notes</span>
            <h2>Think on the page</h2>
            <p>Write partial thoughts, questions, and mistakes. These notes stay in this browser.</p>
            <textarea
              value={progress.notes}
              onChange={(event) => updateWeek({ notes: event.target.value })}
              placeholder="What makes sense? What is still fuzzy? What do you want to ask?"
              rows={8}
            />
            <small className="save-note">Saved automatically on this device</small>
          </section>

          {gateSection && (
            <section className="gate-callout">
              <span className="eyebrow">The gate you must defend</span>
              <h2>{gateSection.title}</h2>
              {gateSection.items.map((item) => <p key={item}>{item}</p>)}
            </section>
          )}

          <section className="work-card card">
            <span className="eyebrow">Evidence</span>
            <h2>Point to your work</h2>
            <p>A file path, notebook, commit, diagram, test result, or concise description is enough.</p>
            <textarea
              value={progress.evidence}
              onChange={(event) => updateWeek({ evidence: event.target.value })}
              placeholder="What did you make, test, or demonstrate?"
              rows={4}
            />
          </section>

          <section className="work-card card">
            <span className="eyebrow">Reflection</span>
            <h2>Explain what changed in your understanding</h2>
            <textarea
              value={progress.reflection}
              onChange={(event) => updateWeek({ reflection: event.target.value })}
              placeholder="What can you explain now that you could not explain before?"
              rows={6}
            />
            <small className={reflectionReady ? "ready-text" : "save-note"}>
              {reflectionReady ? "Reflection has enough detail" : "Write at least 40 characters"}
            </small>
          </section>
        </aside>
      </section>

      <section className="completion-card">
        <div className="completion-copy">
          <span className="eyebrow">Exit gate</span>
          <h2>{isComplete ? "This unit is complete" : "Complete only when it is yours"}</h2>
          <p>
            Automated checks can prove an artifact works. These checks record that
            you attempted, reflected, and can defend it yourself.
          </p>
        </div>
        <div className="gate-checks">
          <label>
            <input
              type="checkbox"
              checked={progress.reviewed}
              onChange={(event) => updateWeek({ reviewed: event.target.checked })}
            />
            <span><strong>I reviewed the material</strong><small>I can name what I understand and what I do not.</small></span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={progress.attempted}
              onChange={(event) => updateWeek({ attempted: event.target.checked })}
            />
            <span><strong>I attempted the work first</strong><small>I did not begin from a finished solution.</small></span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={progress.defended}
              onChange={(event) => updateWeek({ defended: event.target.checked })}
            />
            <span><strong>I can defend the gate</strong><small>I can answer questions in my own words.</small></span>
          </label>
        </div>
        <button
          className="complete-button"
          disabled={!ready || isComplete}
          onClick={completeWeek}
        >
          {isComplete ? "Completed" : ready ? "Complete unit and unlock the next" : "Gate requirements not yet met"}
        </button>
      </section>
    </div>
  );
}

function RoadmapView({
  data,
  completed,
  selectedId,
  isUnlocked,
  openModule,
  openWeek,
}: {
  data: CurriculumData;
  completed: Set<string>;
  selectedId: string;
  isUnlocked: (id: string) => boolean;
  openModule: (module: CurriculumModule) => void;
  openWeek: (id: string) => void;
}) {
  return (
    <div className="view-stack roadmap-view">
      <header className="view-header">
        <span className="eyebrow">The whole route</span>
        <h1>See the destination. Work the next step.</h1>
        <p>Every unit is visible, but progression remains sequential. Completed work is always available for review.</p>
      </header>
      {data.phases.map((phase) => {
        const modules = data.modules.filter((module) => module.phaseId === phase.id);
        return (
          <section className="phase-section" key={phase.id}>
            <div className="phase-heading">
              <span>{phase.label}</span>
              <div><h2>{phase.title}</h2><p>{modules.length} {modules.length === 1 ? "module" : "modules"}</p></div>
            </div>
            <div className="roadmap-grid">
              {modules.map((module) => {
                const completeCount = module.weeks.filter((week) => completed.has(week.id)).length;
                const unlocked = module.weeks.some((week) => isUnlocked(week.id));
                return (
                  <article className={joinClass("roadmap-card", unlocked && "unlocked")} key={module.id}>
                    <div className="roadmap-card-top">
                      <span>Module {module.number}</span><small>{module.range}</small>
                    </div>
                    <h3>{module.title}</h3>
                    <div className="mini-progress"><span style={{ width: `${(completeCount / module.weeks.length) * 100}%` }} /></div>
                    <p>{completeCount} of {module.weeks.length} units complete</p>
                    <div className="roadmap-weeks">
                      {module.weeks.map((week) => (
                        <button
                          key={week.id}
                          disabled={!isUnlocked(week.id)}
                          className={joinClass(completed.has(week.id) && "done", selectedId === week.id && "current")}
                          onClick={() => openWeek(week.id)}
                        >
                          <span>{completed.has(week.id) ? "✓" : week.number}</span>
                          {week.title}
                        </button>
                      ))}
                    </div>
                    <button className="text-button" disabled={!unlocked} onClick={() => openModule(module)}>
                      {unlocked ? "Open accessible work →" : "Locked until earlier gates pass"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function GuideView({ data }: { data: CurriculumData }) {
  return (
    <div className="view-stack guide-view">
      <header className="view-header">
        <span className="eyebrow">How we work</span>
        <h1>You do the learning. The assistant supports the process.</h1>
        <p>The course is paced by understanding and evidence, not by a calendar.</p>
      </header>
      <section className="behavior-grid">
        <article><span>01</span><h2>Attempt first</h2><p>You work the problem before seeing a solution. The coach begins with questions and hints.</p></article>
        <article><span>02</span><h2>Build and break</h2><p>Each unit produces an artifact and a deliberate failure to diagnose.</p></article>
        <article><span>03</span><h2>Explain it back</h2><p>Your own explanation is part of the evidence. Polished output alone does not prove mastery.</p></article>
        <article><span>04</span><h2>Gate, then advance</h2><p>The next unit unlocks after the current work is attempted, evidenced, reflected on, and defended.</p></article>
      </section>
      <section className="guide-principles card">
        <div><span className="eyebrow">The coaching contract</span><h2>Ask before telling</h2></div>
        <ul>
          <li>One concept at a time, calibrated to your current understanding.</li>
          <li>Hints escalate only as needed: question, conceptual cue, partial scaffold, then a worked example on a different problem.</li>
          <li>Mistakes are inspected, not hidden. Repetition and prerequisite detours are normal.</li>
          <li>Assistant-produced work is labeled as reference material and never counted as your gate evidence.</li>
        </ul>
      </section>
      <div className="reference-list">
        {data.referenceSections.map((section, index) => (
          <details key={section.id} open={index === 1}>
            <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{section.title}</strong><span aria-hidden="true">+</span></summary>
            <div className="reference-content">
              {section.groups.map((group) => (
                <section key={`${section.id}-${group.title}`}>
                  <h3>{group.title}</h3>
                  {group.items.length > 0 && <ul>{group.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ul>}
                </section>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function ProgressView({
  data,
  allWeeks,
  completed,
  learner,
  completionPercent,
  exportProgress,
  importProgress,
  resetProgress,
  importRef,
  openWeek,
}: {
  data: CurriculumData;
  allWeeks: FlatWeek[];
  completed: Set<string>;
  learner: LearnerState;
  completionPercent: number;
  exportProgress: () => void;
  importProgress: (event: ChangeEvent<HTMLInputElement>) => void;
  resetProgress: () => void;
  importRef: RefObject<HTMLInputElement | null>;
  openWeek: (id: string) => void;
}) {
  return (
    <div className="view-stack progress-view">
      <header className="view-header">
        <span className="eyebrow">Your record</span>
        <h1>Progress you can explain and take with you.</h1>
        <p>Everything below is stored in this browser. Export a backup whenever the record matters.</p>
      </header>
      <section className="stat-grid">
        <article><span>Overall completion</span><strong>{completionPercent}%</strong><small>{learner.completedWeekIds.length} of {allWeeks.length} units</small></article>
        <article><span>Current position</span><strong>Week {allWeeks.find((week) => week.id === learner.currentWeekId)?.number ?? 0}</strong><small>At your pace</small></article>
        <article><span>Evidence records</span><strong>{Object.values(learner.weeks).filter((week) => week.evidence.trim()).length}</strong><small>Artifacts or demonstrations</small></article>
      </section>
      <section className="phase-progress card">
        <div className="section-heading"><div><span className="eyebrow">By phase</span><h2>Course completion</h2></div></div>
        {data.phases.map((phase) => {
          const phaseWeeks = data.modules.filter((module) => module.phaseId === phase.id).flatMap((module) => module.weeks);
          const done = phaseWeeks.filter((week) => completed.has(week.id)).length;
          return (
            <div className="phase-progress-row" key={phase.id}>
              <div><strong>{phase.label}</strong><span>{phase.title}</span></div>
              <div className="phase-track"><span style={{ width: `${(done / phaseWeeks.length) * 100}%` }} /></div>
              <small>{done}/{phaseWeeks.length}</small>
            </div>
          );
        })}
      </section>
      {learner.completedWeekIds.length > 0 && (
        <section className="completed-list card">
          <div className="section-heading"><div><span className="eyebrow">Completed gates</span><h2>Work you can revisit</h2></div></div>
          {learner.completedWeekIds.map((id) => {
            const week = allWeeks.find((item) => item.id === id);
            if (!week) return null;
            return (
              <button key={id} onClick={() => openWeek(id)}>
                <span>Week {week.number}</span><strong>{week.title}</strong><small>{formatDate(learner.weeks[id]?.completedAt)}</small>
              </button>
            );
          })}
        </section>
      )}
      <section className="data-card">
        <div><span className="eyebrow">Local data</span><h2>Back up or move your progress</h2><p>The export includes goals, notes, evidence, reflections, and completed gates. It does not include course files.</p></div>
        <div className="data-actions">
          <button className="primary-button" onClick={exportProgress}>Export progress</button>
          <button className="secondary-button" onClick={() => importRef.current?.click()}>Import backup</button>
          <input ref={importRef} type="file" accept="application/json" className="sr-only" onChange={importProgress} />
          <button className="danger-button" onClick={resetProgress}>Reset local progress</button>
        </div>
      </section>
    </div>
  );
}
