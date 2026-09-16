#!/usr/bin/env python3
"""
CLI Tool Runner for Indranet Prompt Library
Usage:
  python3 mcp/cli.py search "Python"
  python3 mcp/cli.py get "Pythia---Python-made-manifest"
  python3 mcp/cli.py attachments "Grant-Writing-Guru"
  python3 mcp/cli.py read "Grant-Writing-Guru" "template.txt"
"""

import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.prompt_catalog import PromptCatalog

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 mcp/cli.py <search|get|attachments|read|render> [args]")
        sys.exit(1)

    cmd = sys.argv[1].lower()
    catalog = PromptCatalog()

    if cmd == "search":
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        results = catalog.search_prompts(query=query, limit=10)
        print(f"Found {len(results)} matching prompt(s):")
        for idx, p in enumerate(results, 1):
            print(f"{idx}. [{p.get('uuid', 'N/A')[:8]}] {p.get('title')}")
            print(f"   Tags: {', '.join(p.get('tags', []))}")
            summary = (p.get('description') or p.get('text', '')[:100]).replace('\n', ' ')
            print(f"   Summary: {summary}...\n")

    elif cmd == "get":
        identifier = sys.argv[2] if len(sys.argv) > 2 else ""
        p = catalog.get_prompt(identifier)
        if not p:
            print(f"Prompt '{identifier}' not found.")
            sys.exit(1)

        print(f"Title: {p.get('title')}")
        print(f"UUID: {p.get('uuid')}")
        print(f"Version: {p.get('version')}")
        print(f"Tags: {', '.join(p.get('tags', []))}")
        print("\n--- PROMPT BODY ---")
        print(p.get('text'))

    elif cmd == "attachments":
        identifier = sys.argv[2] if len(sys.argv) > 2 else ""
        atts = catalog.list_attachments(identifier)
        print(f"Found {len(atts)} attachment(s) for '{identifier}':")
        for a in atts:
            print(f" - {a['name']} ({a['bytes']} bytes)")

    elif cmd == "read":
        identifier = sys.argv[2] if len(sys.argv) > 2 else ""
        filename = sys.argv[3] if len(sys.argv) > 3 else ""
        content = catalog.read_attachment(identifier, filename)
        if content:
            print(f"\n--- ATTACHMENT: {filename} ---")
            print(content)
        else:
            print(f"Attachment '{filename}' not found for prompt '{identifier}'.")

    else:
        print(f"Unknown command: {cmd}")

if __name__ == "__main__":
    main()
