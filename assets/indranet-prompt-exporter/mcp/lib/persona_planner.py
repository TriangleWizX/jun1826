"""Bounded work contracts consumed by a host runtime; never implicitly spawn."""
from .persona_router import task_brief, select_persona, compile_guidance
import re

INSTRUCTION_FALLBACK = "e144b81f-10ea-41a6-a06c-03d69dfb738f"

def select_instruction_asset(task, catalog, preferred_uuid=None):
    """Select an instruction profile without importing the quick CLI."""
    profiles = [p for p in catalog["profiles"] if str(p.get("title", "")).lower().startswith("instruction") and p.get("readiness") == "ready"]
    if preferred_uuid:
        match = next((p for p in profiles if p.get("uuid") == preferred_uuid), None)
        if match is None:
            raise ValueError("requested instruction asset is unavailable")
        return match
    positive = task_brief(task)["positive_task"]
    # Platform names alone do not establish a video-production task.
    domains = [
        (r"python|refactor|debug|software|coding|persona routing|html|css", "25a8fe8a-c164-4e8e-8236-3a6585bfa165"),
        (r"publishing|placement|ledger|business|operations|project management|seo", "c3369696-d996-447e-8973-5f2cd73d33c9"),
        (r"video sales letter|video script|storyboard|produce.*video", "59b0d954-cf57-433a-b31f-d55dd5e1e226"),
        (r"copy|content|headline|blog|article|editorial", "6e94db8f-e23d-4387-8cc6-bac209e890aa"),
    ]
    uid = next((uid for pattern, uid in domains if re.search(r"\b(?:" + pattern + r")\b", positive, re.I)), INSTRUCTION_FALLBACK)
    match = next((p for p in profiles if p["uuid"] == uid), None)
    if match is None:
        raise ValueError("selected instruction asset is unavailable or not ready")
    return match
from pathlib import Path


def plan_execution(brief, catalog, workstreams=None, max_agents=4, workspace_root=None):
    workspace = Path(workspace_root or Path(__file__).resolve().parents[4]).resolve()
    if isinstance(max_agents, bool) or not isinstance(max_agents, int) or not 1 <= max_agents <= 4:
        raise ValueError("max_agents must be 1..4 including the coordinator")
    selection = select_persona(brief, catalog)
    coordinator_instruction = select_instruction_asset(brief["task"], catalog, brief.get("instruction_uuid"))
    root = {"schema_version": 1, "status": "planned", "max_agents": max_agents,
        "catalog_hash": catalog["catalog_hash"], "coordinator": dict(compile_guidance(selection, brief, catalog), instruction_asset=coordinator_instruction),
            "completion_gate": "Coordinator must inspect final artifacts and verification evidence for every DoD ID after integration. Worker agreement is insufficient.",
            "runtime_policy": {"recursive_spawn": False, "max_retries_per_worker": 1,
                               "restart": "Check the existing runtime handle before retrying; no retry based only on elapsed time.",
                               "worker_states": ["queued", "running", "waiting", "complete", "failed", "blocked"],
                               "on_failure": "Preserve evidence; resolve only the bounded failed assignment.", "runtime_handles": {}}}
    if not workstreams:
        return dict(root, mode="single", workers=[], waves=[], reason="No independently scoped workstreams supplied")
    if not isinstance(workstreams, list):
        raise ValueError("workstreams must be a list")
    ids, covered, workers = set(), set(), []
    dod = {item["id"]: item for item in brief["definition_of_done"]}
    if not dod:
        raise ValueError("workstreams require an explicit definition_of_done")
    for stream in workstreams:
        if not isinstance(stream, dict):
            raise ValueError("each workstream must be an object")
        sid = stream.get("id")
        if not isinstance(sid, str) or not sid or sid in ids:
            raise ValueError("workstream IDs must be unique nonempty strings")
        ids.add(sid)
        for field in ("task", "deliverable", "contribution"):
            if not isinstance(stream.get(field), str) or not stream[field].strip():
                raise ValueError(sid + " requires " + field)
        owns = stream.get("dod_ids", [])
        if not isinstance(owns, list) or not owns or any(not isinstance(k, str) or k not in dod for k in owns):
            raise ValueError(sid + " must own known DoD IDs")
        if covered & set(owns):
            raise ValueError("DoD ownership must be unique; give reviews their own criterion")
        covered.update(owns)
        for field in ("depends_on", "write_paths", "read_paths", "allowed_tools", "verification"):
            values = stream.get(field, [])
            if not isinstance(values, list) or any(not isinstance(v, str) or not v for v in values):
                raise ValueError(sid + ": " + field + " must be a list of strings")
        if not stream.get("verification") or not stream.get("read_paths"):
            raise ValueError(sid + " requires bounded inputs and concrete verification steps")
        actions = stream.get("authorized_actions", ["read", "recommend"])
        if not isinstance(actions, list) or any(not isinstance(a, str) for a in actions) or not set(actions) <= set(brief["authorized_actions"]):
            raise ValueError(sid + " cannot expand parent authorization")
        if stream.get("write_paths") and "write" not in actions:
            raise ValueError(sid + " has write paths without write authorization")
        canonical = {}
        for path in stream.get("write_paths", []) + stream.get("read_paths", []):
            if path.startswith(("/", "~")) or any(part in ("..", ".", "") for part in path.split("/")) or "\\" in path or any(c in path for c in "*?["):
                raise ValueError(sid + " needs literal repository-relative paths")
            resolved = (workspace / path).resolve()
            if not resolved.is_relative_to(workspace) or resolved == workspace:
                raise ValueError(sid + " path escapes the workspace")
            canonical[path] = str(resolved.relative_to(workspace))
        budget = stream.get("budget", {"max_attempts": 2})
        if not isinstance(budget, dict) or set(budget) - {"max_attempts", "tokens", "seconds"}:
            raise ValueError(sid + " budget accepts max_attempts, tokens and seconds")
        if any(isinstance(v, bool) or not isinstance(v, int) or v < 1 for v in budget.values()) or budget.get("max_attempts", 2) > 2:
            raise ValueError(sid + " budget must be positive integers, at most two attempts")
        sub = task_brief(stream["task"], definition_of_done=[dod[k] for k in owns],
                         constraints=brief["constraints"], authorized_actions=actions,
                         **({"required_capabilities": stream["required_capabilities"]} if "required_capabilities" in stream else {}))
        result = select_persona(sub, catalog, stream.get("persona_uuid"))
        instruction = select_instruction_asset(stream["task"], catalog, stream.get("instruction_uuid"))
        if stream.get("persona_uuid") and result["status"] == "unavailable":
            raise ValueError(sid + " requested an unavailable persona")
        workers.append({"id": sid, "state": "queued", "runtime_handle": None,
        "selection_status": result["status"], "instruction_asset": instruction, "guidance": compile_guidance(result, sub, catalog),
        "dod_ids": owns, "contribution": stream["contribution"],
        "deliverable": stream["deliverable"], "depends_on": stream.get("depends_on", []),
        "read_paths": [canonical[p] for p in stream["read_paths"]], "write_paths": [canonical[p] for p in stream.get("write_paths", [])],
        "allowed_tools": stream.get("allowed_tools", []), "verification": stream["verification"],
        "budget": dict(budget, max_attempts=budget.get("max_attempts", 2)),
        "stop_condition": "Return the bounded deliverable and evidence for owned DoD IDs, or a specific blocker. Do not spawn children."})
    if covered != dod.keys():
        raise ValueError("Every DoD criterion needs an owner; unassigned: " + ", ".join(sorted(dod.keys() - covered)))
    for worker in workers:
        if set(worker["depends_on"]) - ids or worker["id"] in worker["depends_on"]:
            raise ValueError("Invalid dependency for " + worker["id"])
    def overlap(a, b):
        return a == b or a.startswith(b.rstrip("/") + "/") or b.startswith(a.rstrip("/") + "/")
    def conflict(a, b):
        return any(overlap(x, y) for x in a["write_paths"] for y in b["read_paths"] + b["write_paths"]) or any(
            overlap(x, y) for x in b["write_paths"] for y in a["read_paths"])
    remaining, done, waves = workers[:], set(), []
    while remaining:
        ready = [w for w in remaining if set(w["depends_on"]) <= done]
        if not ready:
            raise ValueError("Cyclic workstream dependencies")
        wave = []
        for worker in ready:
            if len(wave) < max(1, max_agents - 1) and not any(conflict(worker, other) for other in wave):
                wave.append(worker)
        waves.append([w["id"] for w in wave])
        done.update(w["id"] for w in wave)
        remaining = [w for w in remaining if w not in wave]
    mode = "parallel" if any(len(w) > 1 for w in waves) else "sequential"
    return dict(root, mode=mode if max_agents > 1 else "single", workers=workers, waves=waves,
                dispatch="host_workers" if max_agents > 1 else "coordinator_roles",
                reason="Distinct DoD ownership; dependency and file-access conflicts constrain concurrency")
