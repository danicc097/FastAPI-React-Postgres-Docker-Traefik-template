import filecmp
import pathlib

import align

cur_dir = pathlib.Path(__file__).parent
backend = pathlib.Path(__file__).parents[1]
in_path = cur_dir / "queries" / "test.sql"
out_path = cur_dir / "queries" / "test_aligned.sql"
expected_path = cur_dir / "queries" / "test_aligned.expected.sql"
align.align(str(in_path), overwrite=False, suffix="_aligned")
with open(str(out_path), "r") as f1:
    with open(str(expected_path), "r") as f2:
        for i, (line1, line2) in enumerate(zip(f1, f2)):
            if line1 != line2:
                line1 = line1.replace("\n", "")
                line2 = line2.replace("\n", "")
                print(f"ERROR: {out_path.relative_to(backend)}:{i}:::{line1} != {line2}")
        filecmp.clear_cache()
        assert filecmp.cmp(str(f1.name), str(f2.name), shallow=False)
        print(f"{out_path.relative_to(backend)}: PASS")
