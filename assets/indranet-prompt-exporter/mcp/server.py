#!/usr/bin/env python3
"""
Indranet Prompt MCP Server
Exposes prompt library search, inspection, attachment loading, and template rendering
to LLMs and AI Agents via JSON-RPC / Model Context Protocol (MCP).
"""

import sys
import os
import json
from pathlib import Path

# Add current dir to sys.path
BASE_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.prompt_catalog import PromptCatalog

catalog = PromptCatalog()

def search_indranet_prompts(query: str = "", tags: list = None, limit: int = 10):
    results = catalog.search_prompts(query=query, tags=tags, limit=limit)
    return [
        {
            "title": p.get("title"),
            "uuid": p.get("uuid"),
            "tags": p.get("tags", []),
            "version": p.get("version"),
            "summary": (p.get("description") or p.get("text", "")[:150]).strip() + "..."
        }
        for p in results
    ]

def get_indranet_prompt(identifier: str):
    prompt = catalog.get_prompt(identifier)
    if not prompt:
        return {"error": f"Prompt '{identifier}' not found in catalog."}
    return {
        "title": prompt.get("title"),
        "uuid": prompt.get("uuid"),
        "version": prompt.get("version"),
        "organization": prompt.get("organization"),
        "tags": prompt.get("tags", []),
        "description": prompt.get("description"),
        "notes": prompt.get("notes"),
        "url": prompt.get("url"),
        "text": prompt.get("text"),
        "attachments": catalog.list_attachments(identifier)
    }

def list_prompt_attachments(identifier: str):
    return catalog.list_attachments(identifier)

def read_prompt_attachment(identifier: str, filename: str):
    content = catalog.read_attachment(identifier, filename)
    if content is None:
        return {"error": f"Attachment '{filename}' not found for prompt '{identifier}'."}
    return {"filename": filename, "content": content}

def render_prompt_template(identifier: str, variables: dict):
    rendered = catalog.render_template(identifier, variables)
    if rendered is None:
        return {"error": f"Prompt '{identifier}' not found."}
    return {"identifier": identifier, "rendered_prompt": rendered}

def handle_rpc_call(method: str, params: dict):
    if method == "search_indranet_prompts":
        return search_indranet_prompts(**params)
    elif method == "get_indranet_prompt":
        return get_indranet_prompt(**params)
    elif method == "list_prompt_attachments":
        return list_prompt_attachments(**params)
    elif method == "read_prompt_attachment":
        return read_prompt_attachment(**params)
    elif method == "render_prompt_template":
        return render_prompt_template(**params)
    else:
        return {"error": f"Unknown method: {method}"}

def main():
    """Stdio JSON-RPC loop for MCP tool integration."""
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        print("MCP Server initialized. Run with stdin/stdout for MCP tool calls.")
        return

    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            req = json.loads(line)
            req_id = req.get("id")
            method = req.get("method")
            params = req.get("params", {})

            result = handle_rpc_call(method, params)
            resp = {"jsonrpc": "2.0", "id": req_id, "result": result}
            print(json.dumps(resp), flush=True)
        except Exception as e:
            err_resp = {"jsonrpc": "2.0", "error": {"code": -32603, "message": str(e)}}
            print(json.dumps(err_resp), flush=True)

if __name__ == "__main__":
    main()
