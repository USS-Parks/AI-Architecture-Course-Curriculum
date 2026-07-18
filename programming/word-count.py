"""Count words in a UTF-8 text file for the Week 0 diagnostic."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


WORD_PATTERN = re.compile(r"\b[\w']+\b", flags=re.UNICODE)


def count_words(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    return len(WORD_PATTERN.findall(text))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path, help="UTF-8 text file to count")
    args = parser.parse_args()
    print(count_words(args.path))


if __name__ == "__main__":
    main()
