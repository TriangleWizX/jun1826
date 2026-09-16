#!/usr/bin/env python3
"""
Auto Persona Selector Engine for AGY Workflows
Given a user task or /plan prompt, identifies and loads the optimal Indranet persona prompt
and attached assets.
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, Optional

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.prompt_catalog import PromptCatalog

# Special domain keywords to ensure high precision persona matching
DOMAIN_PERSONA_MAP = {
    "python": ["Pythia", "Apollo Pythonslayer"],
    "debug": ["Orko", "Debugger-Analyzer"],
    "seo": ["Estrella", "Alex Revamp", "Social Media Monster"],
    "copywriting": ["Alex Turner", "Senior Copywriter"],
    "crypto": ["CryptoMathWiz", "Crypto-Trader"],
    "finance": ["Fiona Ledger", "Aria Thorne"],
    "genetics": ["GeneWarden"],
    "physics": ["QuantumVoyager", "Robert Oppenheimer"],
    "architecture": ["Architext", "MasterConstructor"],
}

def select_best_persona(task_description: str) -> Dict[str, Any]:
    """Select the best matching persona prompt for a given task description."""
    catalog = PromptCatalog()
    if not task_description:
        task_description = "general problem solving software development"

    task_lower = task_description.lower()

    # 1. Check explicit domain keyword overrides
    for keyword, preferred_titles in DOMAIN_PERSONA_MAP.items():
        if keyword in task_lower:
            for title_keyword in preferred_titles:
                prompt = catalog.get_prompt(title_keyword)
                if prompt:
                    return _format_persona_response(catalog, prompt, f"Domain keyword match: '{keyword}'")

    # 2. Search catalog by task query
    matches = catalog.search_prompts(query=task_description, limit=3)
    if matches:
        return _format_persona_response(catalog, matches[0], "Semantic keyword search match")

    # 3. Fallback to default generalist persona if available
    fallback = catalog.get_prompt("Pythia") or (catalog.prompts[0] if catalog.prompts else None)
    if fallback:
        return _format_persona_response(catalog, fallback, "Default fallback persona")

    return {"error": "No prompt personas available in catalog."}

def _format_persona_response(catalog: PromptCatalog, prompt: Dict[str, Any], reason: str) -> Dict[str, Any]:
    identifier = prompt.get("title") or prompt.get("uuid")
    attachments = catalog.list_attachments(identifier)

    return {
        "persona_title": prompt.get("title") or "Unknown Persona",
        "uuid": prompt.get("uuid"),
        "version": prompt.get("version", "1.0"),
        "selection_reason": reason,
        "tags": prompt.get("tags", []),
        "description": prompt.get("description", ""),
        "notes": prompt.get("notes", ""),
        "prompt_text": prompt.get("text", ""),
        "attachments": attachments
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 mcp/lib/auto_persona.py '<task_description>'")
        sys.exit(1)

    task_desc = " ".join(sys.argv[1:])
    selected = select_best_persona(task_desc)

    print("==================================================")
    print(f" SELECTED AGY PERSONA: {selected.get('persona_title')}")
    print("==================================================")
    print(f"Selection Reason: {selected.get('selection_reason')}")
    print(f"UUID: {selected.get('uuid')}")
    print(f"Version: {selected.get('version')}")
    print(f"Tags: {', '.join(selected.get('tags', []))}")
    print(f"Attachments: {len(selected.get('attachments', []))} file(s)")
    print("\n--- SYSTEM PROMPT SNIPPET ---")
    snippet = (selected.get('prompt_text') or '')[:300].replace('\n', ' ')
    print(f"{snippet}...\n")

if __name__ == "__main__":
    main()
