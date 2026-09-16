#!/usr/bin/env python3
"""Offline task routing and bounded persona work plans for AGY/Codex hosts."""
import argparse
import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.persona_router import load_profiles, task_brief, select_persona, compile_guidance
from mcp.lib.persona_planner import plan_execution


def select_best_persona(task_description, exports_dir=None):
    """Compatible callable with diagnostics; no match has explicit null identity."""
    catalog = load_profiles(exports_dir or BASE_DIR / "exports")
    brief = task_brief(task_description)
    result = select_persona(brief, catalog)
    selected = result["selected"]
    profile = next((p for p in catalog["profiles"] if selected and p["uuid"] == selected["uuid"]), {})
    return dict(result, persona_title=profile.get("title"), uuid=profile.get("uuid"),
                version=profile.get("version"), tags=profile.get("tags", []),
                description=profile.get("description", ""), notes="",
                prompt_text=profile.get("prompt_text", ""), attachments=profile.get("attachments", []),
                guidance=compile_guidance(result, brief, catalog))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task", nargs="*")
    parser.add_argument("--exports-dir", type=Path, default=BASE_DIR / "exports")
    parser.add_argument("--json", action="store_true", help="Machine-readable selection and compiled guidance")
    parser.add_argument("--audit", action="store_true", help="Readiness and provenance without prompt bodies")
    parser.add_argument("--brief", type=Path, help="JSON task, DoD, constraints, actions and optional workstreams")
    parser.add_argument("--plan", action="store_true", help="Emit host work contracts; never spawns agents")
    parser.add_argument("--persona-uuid", help="Exact persona identity; unavailable candidates fail visibly")
    parser.add_argument("--max-agents", type=int, default=4, help="Capacity including coordinator, 1..4")
    args = parser.parse_args(argv)
    try:
        catalog = load_profiles(args.exports_dir)
        if args.audit:
            output = {k: v for k, v in catalog.items() if k != "profiles"}
            output["profiles"] = [{k: v for k, v in p.items() if k not in ("prompt_text", "description", "capabilities")} for p in catalog["profiles"]]
        else:
            data = json.loads(args.brief.read_text()) if args.brief else {"task": " ".join(args.task)}
            if not isinstance(data, dict) or not data.get("task"):
                raise ValueError("Supply a task or a brief containing task text")
            brief = task_brief(data["task"], **{k: v for k, v in data.items() if k != "task"})
            if args.plan:
                if args.persona_uuid:
                    raise ValueError("Use workstream persona_uuid overrides in a plan brief")
                output = plan_execution(brief, catalog, data.get("workstreams"), args.max_agents)
            else:
                output = select_persona(brief, catalog, args.persona_uuid)
                output["brief"] = brief
                output["guidance"] = compile_guidance(output, brief, catalog)
                output["catalog_diagnostics"] = catalog["diagnostics"]
        if args.json or args.audit or args.plan:
            print(json.dumps(output, indent=2, ensure_ascii=False))
        else:
            selected = output["selected"]
            print("SELECTED AGY PERSONA:", selected["persona_title"] if selected else "none (ordinary task-specific agent)")
            print("Status:", output["status"])
            print("Selection Reason:", output["selection_reason"])
            print("UUID:", selected["uuid"] if selected else "none")
            print("Uncovered requirements:", ", ".join(output["uncovered"]) or "none")
            print("Attachments loaded: none")
            print("Use --json for fit evidence and compiled guidance; --plan --brief FILE for worker contracts.")
        return 2 if output.get("status") == "unavailable" else 0
    except (OSError, ValueError, TypeError) as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
