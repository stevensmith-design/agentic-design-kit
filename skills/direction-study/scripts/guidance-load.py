#!/usr/bin/env python3
"""Optional diagnostic for accidental starter or structure-library leakage.

Original references are deliberately allowed throughout reference-led study, synthesis and assigned
proof-building. This tool records reads; it does not enforce source isolation or creative order.
"""
import argparse
import json
import re
import sys

ROUTES = {"reference-led", "reference-directed", "brief-originated", "system-led",
          "approved-direction", "product-interface", "starter-led", "named-starter-match"}
PHASES = {"study", "synthesis", "build", "similarity-review", "review"}
STARTER = re.compile(r"starter-directions/(?:references/starters/([\w-]+)\.md|SKILL\.md|.*)")
STRUCTURES = "design-build/references/structures/"


def catalogue_verdict(rec):
    route, phase, path = rec["route"], rec["phase"], rec["path"]
    match = STARTER.search(path)
    if match:
        if phase == "review":
            return f"starter material entered review: {path}"
        if route == "starter-led":
            return None
        named = (rec.get("named_starter") or "").lower()
        if route in ("named-starter-match", "approved-direction") and named and (
                path.endswith("starter-directions/SKILL.md") or
                (match.group(1) or "").lower() == named):
            return None
        return f"starter material on the {route} route: {path}"
    if STRUCTURES in path:
        if phase == "build" and route in ("starter-led", "brief-originated"):
            return None
        if phase == "build" and route == "approved-direction" and rec.get("named_starter"):
            return None
        return f"structure library on the {route} route ({phase}): {path}"
    return None


def load(path):
    records = []
    with open(path, encoding="utf-8") as handle:
        for number, line in enumerate(handle, 1):
            if not line.strip():
                continue
            record = json.loads(line)
            for key in ("route", "phase", "path"):
                if key not in record:
                    raise ValueError(f"line {number}: missing {key!r}")
            if record["route"] not in ROUTES or record["phase"] not in PHASES:
                raise ValueError(
                    f"line {number}: unknown route or phase: "
                    f"{record['route']!r} / {record['phase']!r}")
            records.append(record)
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = parser.add_subparsers(dest="cmd", required=True)
    record = sub.add_parser("record")
    for key in ("--log", "--route", "--phase", "--path", "--purpose"):
        record.add_argument(key, required=True)
    record.add_argument("--context", default="")
    record.add_argument("--read", default="full", choices=["full", "partial"])
    record.add_argument("--named-starter")
    check = sub.add_parser("check")
    check.add_argument("log")
    args = parser.parse_args()

    if args.cmd == "record":
        if args.route not in ROUTES or args.phase not in PHASES:
            print(f"unknown route or phase: {args.route} / {args.phase}", file=sys.stderr)
            return 2
        item = {"route": args.route, "phase": args.phase, "context": args.context,
                "path": args.path, "read": args.read, "purpose": args.purpose}
        if args.named_starter:
            item["named_starter"] = args.named_starter
        with open(args.log, "a", encoding="utf-8") as handle:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")
        return 0

    try:
        records = load(args.log)
    except (ValueError, json.JSONDecodeError, OSError) as error:
        print(f"MALFORMED: {error}")
        return 2
    leaks = [verdict for verdict in map(catalogue_verdict, records) if verdict]
    if leaks:
        for leak in leaks:
            print(f"LEAK  {leak}")
        return 1
    print("CLEAN: no starter or structure-library leakage")
    return 0


if __name__ == "__main__":
    sys.exit(main())
