#!/usr/bin/env python3
"""Fast offline persona and instruction-asset selector for Codex tasks."""
import argparse
import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.persona_router import load_profiles, task_brief, select_persona, compile_guidance
from mcp.lib.persona_planner import select_instruction_asset


def build_result(task, exports_dir, mode="persona", persona_uuid=None, instruction_uuid=None):
    catalog = load_profiles(exports_dir)
    brief = task_brief(task)
    selection = select_persona(brief, catalog, persona_uuid)
    if instruction_uuid is not None and mode == "persona":
        mode = "instructions"
    result = {
        "mode": mode,
        "task": task,
        "selection": selection,
        "guidance": compile_guidance(selection, brief, catalog),
        "catalog_diagnostics": catalog["diagnostics"],
    }
    if persona_uuid is not None:
        result["requested_persona_uuid"] = persona_uuid
    if mode in ("instructions", "plan"):
        result["instruction_asset"] = select_instruction_asset(task, catalog, instruction_uuid)
    return result


def _print_human(result):
    selection = result["selection"]
    persona = selection["selected"]
    instruction = result.get("instruction_asset")
    print("Task:", result["task"])
    print("Persona:", persona["persona_title"] if persona else "none (ordinary task-specific agent)")
    print("Persona UUID:", persona["uuid"] if persona else "none")
    if result.get("requested_persona_uuid") is not None:
        print("Requested Persona UUID:", result["requested_persona_uuid"])
    print("Status:", selection["status"])
    print("Fit basis:", selection["selection_reason"])
    print("Uncovered requirements:", ", ".join(selection["uncovered"]) or "none")
    if instruction:
        print("INSTRUCTIONS asset:", instruction["title"])
        print("INSTRUCTIONS UUID:", instruction["uuid"])
        print("INSTRUCTIONS source:", ", ".join(instruction["sources"]))
    print("Attachments loaded: none")
    print("Candidate status is not adoption; inspect full source and readiness before use.")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task", nargs="*")
    parser.add_argument("--exports-dir", type=Path, default=BASE_DIR / "exports")
    parser.add_argument("--instructions", action="store_true", help="Select an INSTRUCTIONS asset as well as the persona")
    parser.add_argument("--plan", action="store_true", help="Return the persona and INSTRUCTIONS pair for a plan")
    parser.add_argument("--persona-uuid", help="Use this exact persona UUID; unavailable or unready IDs fail visibly")
    parser.add_argument("--instruction-uuid", help="Use this exact INSTRUCTIONS asset UUID (implies --instructions outside --plan)")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable selection evidence")
    args = parser.parse_args(argv)
    if args.instructions and args.plan:
        parser.error("choose either --instructions or --plan")
    task = " ".join(args.task).strip()
    if not task:
        parser.error("provide a task description")
    mode = "plan" if args.plan else "instructions" if args.instructions else "persona"
    try:
        result = build_result(task, args.exports_dir, mode, args.persona_uuid, args.instruction_uuid)
    except (OSError, ValueError, TypeError) as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        _print_human(result)
    status = result["selection"]["status"]
    return 2 if status == "unavailable" else 0


if __name__ == "__main__":
    sys.exit(main())
