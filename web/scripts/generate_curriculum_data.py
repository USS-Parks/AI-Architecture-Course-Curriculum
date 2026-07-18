"""Generate the localhost course data from the authoritative curriculum DOCX."""

from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "curriculum" / "AI Architecture Practitioner Curriculum.docx"
OUTPUT = Path(__file__).resolve().parents[1] / "app" / "curriculum-data.json"


def read_paragraphs(path: Path) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
        styles = ET.fromstring(archive.read("word/styles.xml"))

    style_names: dict[str, str] = {}
    for style in styles.findall(f"{W}style"):
        style_id = style.get(f"{W}styleId", "")
        name = style.find(f"{W}name")
        style_names[style_id] = name.get(f"{W}val", style_id) if name is not None else style_id

    paragraphs: list[dict[str, str]] = []
    body = document.find(f"{W}body")
    assert body is not None
    for element in body:
        if element.tag != f"{W}p":
            continue
        text = "".join(node.text or "" for node in element.iter(f"{W}t")).strip()
        if not text:
            continue
        style_node = element.find(f"{W}pPr/{W}pStyle")
        style_id = style_node.get(f"{W}val", "") if style_node is not None else ""
        style = style_names.get(style_id, style_id or "normal")
        paragraphs.append({"style": style.lower(), "text": text})
    return paragraphs


def slug(value: str) -> str:
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def add_item(sections: list[dict], section_title: str, text: str) -> str:
    if text.endswith(":") and len(text) <= 80:
        return text[:-1].strip()
    if not sections or sections[-1]["title"] != section_title:
        sections.append({"title": section_title, "items": []})
    sections[-1]["items"].append(text)
    return section_title


def build_curriculum(paragraphs: list[dict[str, str]]) -> dict:
    phase = {"id": "orientation", "label": "Orientation", "title": "Establish the laboratory"}
    phases = [phase]
    modules: list[dict] = []
    module: dict | None = None
    week: dict | None = None
    week_section = "Overview"
    module_section = "Overview"
    module_closing = False

    module_pattern = re.compile(r"^Module\s+(\d+)\s+[—-]\s+(.+)$")
    phase_pattern = re.compile(r"^Phase\s+([IVX]+)\s+[—-]\s+(.+)$")
    week_pattern = re.compile(r"^Week\s+(\d+)(?:\s+[—-]\s+(.+))?$")
    range_pattern = re.compile(r"^Weeks\s+(\d+)(?:\s*[–-]\s*(\d+))?$")

    roadmap_started = False
    roadmap_finished = False

    for paragraph in paragraphs:
        style = paragraph["style"]
        text = paragraph["text"]

        if style == "heading 1" and text == "4. Curriculum Roadmap":
            roadmap_started = True
            continue
        if not roadmap_started:
            continue
        if style == "heading 1" and text.startswith("5. Major Competency"):
            roadmap_finished = True
        if roadmap_finished:
            break

        phase_match = phase_pattern.match(text) if style == "heading 1" else None
        if phase_match:
            numeral, title = phase_match.groups()
            phase = {"id": f"phase-{numeral.lower()}", "label": f"Phase {numeral}", "title": title}
            phases.append(phase)
            module = None
            week = None
            continue

        module_match = module_pattern.match(text) if style == "heading 1" else None
        if module_match:
            number, title = module_match.groups()
            module = {
                "id": f"module-{number}",
                "number": int(number),
                "title": title,
                "phaseId": phase["id"],
                "range": "",
                "overview": [],
                "weeks": [],
                "closingSections": [],
            }
            modules.append(module)
            week = None
            module_closing = False
            module_section = "Overview"
            continue

        if module is None:
            continue

        range_match = range_pattern.match(text) if style == "heading 2" else None
        if range_match:
            start, end = range_match.groups()
            module["range"] = f"Week {start}" if end is None else f"Weeks {start}-{end}"
            continue

        week_match = week_pattern.match(text) if style == "heading 2" else None
        if week_match:
            number, title = week_match.groups()
            title = title or module["title"]
            week = {
                "id": f"week-{number}",
                "number": int(number),
                "title": title,
                "sections": [],
            }
            module["weeks"].append(week)
            module_closing = False
            week_section = "Overview"
            continue

        if style == "heading 3":
            if text.startswith(("Module deliverables", "Module exit gate", "Phase I exit", "Phase II exit", "Phase III exit")):
                module_closing = True
                module_section = text
                module["closingSections"].append({"title": module_section, "items": []})
            elif week is not None:
                week_section = text
                week["sections"].append({"title": week_section, "items": []})
            continue

        if style.startswith("heading"):
            continue

        if module_closing:
            module_section = add_item(module["closingSections"], module_section, text)
        elif week is not None:
            week_section = add_item(week["sections"], week_section, text)
        else:
            module["overview"].append(text)

    for module_item in modules:
        if not module_item["range"] and module_item["weeks"]:
            first = module_item["weeks"][0]["number"]
            last = module_item["weeks"][-1]["number"]
            module_item["range"] = f"Week {first}" if first == last else f"Weeks {first}-{last}"

    assert len(modules) == 17, f"expected 17 modules, found {len(modules)}"
    weeks = [week_item for module_item in modules for week_item in module_item["weeks"]]
    assert len(weeks) == 61, f"expected Week 0 plus 60 weeks, found {len(weeks)}"
    assert [week_item["number"] for week_item in weeks] == list(range(61))

    phase_modules = {phase_item["id"]: [] for phase_item in phases}
    for module_item in modules:
        phase_modules[module_item["phaseId"]].append(module_item["id"])
    for phase_item in phases:
        phase_item["moduleIds"] = phase_modules[phase_item["id"]]

    return {
        "meta": {
            "title": "AI Architecture Practitioner",
            "subtitle": "From first principles to secure local deployment and IT handoff",
            "instructionalWeeks": 60,
            "totalUnits": 61,
            "weeklyCommitment": "8-10 hours at the learner's pace",
            "capstone": "Local Knowledge and Operations Platform",
        },
        "phases": phases,
        "modules": modules,
    }


def build_reference_sections(paragraphs: list[dict[str, str]]) -> list[dict]:
    included_prefixes = ("1.", "2.", "3.", "5.", "6.", "7.", "8.", "9.")
    sections: list[dict] = []
    section: dict | None = None
    group: dict | None = None

    for paragraph in paragraphs:
        style = paragraph["style"]
        text = paragraph["text"]
        if style == "heading 1":
            if text.startswith(included_prefixes):
                section = {"id": slug(text), "title": text, "groups": []}
                sections.append(section)
                group = None
            else:
                section = None
                group = None
            continue
        if section is None:
            continue
        if style == "heading 2":
            group = {"title": text, "items": []}
            section["groups"].append(group)
            continue
        if style == "heading 3":
            group = {"title": text, "items": []}
            section["groups"].append(group)
            continue
        if style.startswith("heading"):
            continue
        if group is None:
            group = {"title": "Overview", "items": []}
            section["groups"].append(group)
        group["items"].append(text)

    return sections


def main() -> None:
    paragraphs = read_paragraphs(SOURCE)
    data = build_curriculum(paragraphs)
    data["referenceSections"] = build_reference_sections(paragraphs)
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    week_count = sum(len(module["weeks"]) for module in data["modules"])
    print(f"Wrote {len(data['modules'])} modules and {week_count} weeks to {OUTPUT}")


if __name__ == "__main__":
    main()
