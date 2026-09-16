#!/usr/bin/env python3
"""Compare frozen legacy rules and current routing on versioned labeled cases.

This is an offline routing evaluation, not an agent task-quality benchmark.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from mcp.lib.prompt_catalog import PromptCatalog
from mcp.lib.persona_router import load_profiles, task_brief, select_persona

# Snapshot of auto_persona.py at fa1b4513, retained as the comparison baseline.
LEGACY_MAP = {
    "python": ["Pythia", "Apollo Pythonslayer"], "debug": ["Orko", "Debugger-Analyzer"],
    "seo": ["Estrella", "Alex Revamp", "Social Media Monster"],
    "copywriting": ["Alex Turner", "Senior Copywriter"], "crypto": ["CryptoMathWiz", "Crypto-Trader"],
    "finance": ["Fiona Ledger", "Aria Thorne"], "genetics": ["GeneWarden"],
    "physics": ["QuantumVoyager", "Robert Oppenheimer"], "architecture": ["Architext", "MasterConstructor"],
}


def legacy_select(task, catalog):
    task = task or "general problem solving software development"
    for keyword, names in LEGACY_MAP.items():
        if keyword in task.lower():
            for name in names:
                prompt = catalog.get_prompt(name)
                if prompt:
                    return prompt["uuid"]
    matches = catalog.search_prompts(query=task, limit=3)
    prompt = matches[0] if matches else catalog.get_prompt("Pythia") or (catalog.prompts[0] if catalog.prompts else None)
    return prompt["uuid"] if prompt else None


def evaluate(split="development"):
    path = Path(__file__).parent / "fixtures/persona_routing_cases.json"
    cases = json.loads(path.read_text())
    current, legacy = load_profiles(ROOT / "exports"), PromptCatalog(ROOT / "exports")
    rows = []
    for case in cases:
        if split != "all" and case["split"] != split:
            continue
        brief = task_brief(case["task"])
        result = select_persona(brief, current)
        selected = result["selected"]
        new_id = selected["uuid"] if selected else None
        old_id = legacy_select(case["task"], legacy)
        acceptable = case.get("acceptable_uuids", [])
        # Unknown UUID suitability remains ungraded, never counted as a pass.
        def grade(uid):
            if uid is None:
                return bool(case["allow_abstention"])
            return uid in acceptable if acceptable else None
        rows.append({"id": case["id"], "split": case["split"], "task": case["task"],
                     "legacy_uuid": old_id, "new_uuid": new_id,
                     "legacy_acceptable": grade(old_id), "new_acceptable": grade(new_id),
                     "new_status": result["status"], "new_uncovered": result["uncovered"],
                     "required_extraction_matches": set(brief["required_capabilities"]) == set(case["required_capabilities"]),
                     "shortlist_acceptable": bool(set(acceptable) & {p["uuid"] for p in result["alternatives"]}) if acceptable else None})
    summary = {"cases": len(rows)}
    for prefix in ("legacy", "new"):
        grades = [r[prefix + "_acceptable"] for r in rows]
        summary[prefix] = {"acceptable": grades.count(True), "unacceptable": grades.count(False), "ungraded": grades.count(None),
                           "abstentions": sum(r[prefix + "_uuid"] is None for r in rows)}
    summary["extraction_matches"] = sum(r["required_extraction_matches"] for r in rows)
    return {"scope": "Offline routing labels only; no persona task-outcome or swarm cost claims", "split": split,
            "catalog_hash": current["catalog_hash"], "fixture_hash": hashlib.sha256(path.read_bytes()).hexdigest(),
            "summary": summary, "cases": rows}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--split", choices=["development", "held_out", "all"], default="development")
    args = parser.parse_args()
    print(json.dumps(evaluate(args.split), indent=2))
