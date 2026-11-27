"""Turn an asciinema v2 recording into the frames the site's terminal player
plays, themes/testflows/source/js/term-player.js.

    python3 tools/cast_to_frames.py <recording.cast> <frames.json>

Each output event of the recording is fed to a terminal emulator, pyte
(`pip install pyte`), so a frame is the screen a terminal would show, as
plain text. A frame stores only the rows that changed since the one before;
the first frame, and one whose height changed, store every row. Markers are
kept with their times.

The JSON is

    {"cols": C, "rows": R, "duration": D,
     "marks": [[time, label], ...],
     "frames": [[time, height, [[row, text], ...]], ...]}
"""

import json
import sys

import pyte


def screen_rows(screen):
    """The rows the program drew on, as text without trailing blanks: up to
    its last row with text, or the cursor's row when below it. The display
    is read once: pyte builds every row of it at each read."""
    display = [line.rstrip() for line in screen.display]
    last = max((i for i, line in enumerate(display) if line), default=0)
    return display[: max(last, screen.cursor.y) + 1]


def convert(cast_path, out_path):
    with open(cast_path) as f:
        header = json.loads(f.readline())
        events = [json.loads(line) for line in f if line.strip()]
    screen = pyte.Screen(header["width"], header["height"])
    stream = pyte.Stream(screen)
    marks, frames = [], []
    shown = None
    for time, kind, data in events:
        if kind == "m":
            marks.append([time, data])
            continue
        if kind != "o":
            continue
        stream.feed(data)
        rows = screen_rows(screen)
        height = len(rows)
        if shown is None or len(shown) != len(rows):
            changed = list(enumerate(rows))
        else:
            changed = [[i, r] for i, (o, r) in enumerate(zip(shown, rows)) if r != o]
        frames.append([time, height, changed])
        shown = rows
    duration = max([f[0] for f in frames] + [m[0] for m in marks])
    with open(out_path, "w") as out:
        json.dump(
            {
                "cols": header["width"],
                "rows": header["height"],
                "duration": duration,
                "marks": marks,
                "frames": frames,
            },
            out,
            separators=(",", ":"),
            ensure_ascii=False,
        )


if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2])
