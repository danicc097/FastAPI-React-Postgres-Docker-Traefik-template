import os
import pathlib
import re
import sys
from typing import Dict

SEPARATOR = r" = "


def align(filepath: str, overwrite=False, suffix="_aligned"):
    with open(filepath, "r") as f:
        lines = f.readlines()

        line_groups: Dict[int, str] = {}
        from typing import TypedDict

        class LineGroup(TypedDict):
            line: str
            index: int

        doc_comment_pattern = re.compile(r"\s*--\s*(.*)$")
        line_groups_with_equal: list[LineGroup] = []
        for i, line in enumerate(lines):
            line_groups[i] = line

            if SEPARATOR in line and not doc_comment_pattern.match(line):
                line_groups_with_equal.append({"line": line, "index": i})

        to_delete = []
        indexes = [x["index"] for x in line_groups_with_equal]
        for i, line_group in enumerate(line_groups_with_equal):
            if line_group["index"] - 1 not in indexes and line_group["index"] + 1 not in indexes:
                to_delete.append(i)
                continue

        for i in sorted(to_delete, reverse=True):
            del line_groups_with_equal[i]

        alignment_groups: list[list[LineGroup]] = []
        for i, line_group in enumerate(line_groups_with_equal):
            if i == 0:
                alignment_groups.append([line_group])
                continue
            # ensure there is the same starting whitespace as well between consecutive lines
            lw_length = len(line_group["line"]) - len(line_group["line"].lstrip())
            previous_lw_length = len(line_groups_with_equal[i - 1]["line"]) - len(
                line_groups_with_equal[i - 1]["line"].lstrip()
            )

            if line_group["index"] - 1 == line_groups_with_equal[i - 1]["index"] and lw_length == previous_lw_length:
                alignment_groups[-1].append(line_group)
            else:
                alignment_groups.append([line_group])

        for i, alignment_group in enumerate(alignment_groups):
            for _line_group in alignment_group:
                left_sides = [item["line"].split(SEPARATOR)[0] for item in alignment_group]
                longest_left_side = max(len(x) for x in left_sides)
                if SEPARATOR in _line_group["line"]:
                    left_side, right_side = _line_group["line"].split(SEPARATOR)
                    _line_group["line"] = f"{left_side.ljust(longest_left_side)}{SEPARATOR}{right_side}"
                    line_groups[_line_group["index"]] = _line_group["line"]
        filename, ext = os.path.splitext(filepath)
        out_path = filepath if overwrite else f"{filename}{suffix}{ext}"
        with open(out_path, "w") as f:
            f.writelines(line_groups.values())


if __name__ == "__main__":
    if not sys.argv[1:]:
        print("Please provide a directory as first argument")
        sys.exit(1)
    directory = sys.argv[1]
    for sql_file in pathlib.Path(directory).glob("*.sql"):
        print(f"aligning {sql_file}")
        align(str(sql_file), overwrite=True)
