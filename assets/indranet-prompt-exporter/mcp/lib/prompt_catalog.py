#!/usr/bin/env python3
"""
Indranet Prompt Catalog & Indexer Engine
Fast searching, metadata parsing, attachment reading, and template rendering
for agentic model usage.
"""

import os
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
EXPORTS_DIR = BASE_DIR / "exports"
INDEX_PATH = EXPORTS_DIR / "index.json"

class PromptCatalog:
    def __init__(self, exports_dir: Optional[Path] = None):
        self.exports_dir = Path(exports_dir) if exports_dir else EXPORTS_DIR
        self.index_path = self.exports_dir / "index.json"
        self.prompts: List[Dict[str, Any]] = []
        self.by_uuid: Dict[str, Dict[str, Any]] = {}
        self.by_title_slug: Dict[str, Dict[str, Any]] = {}
        self.reload()

    def reload(self):
        """Load or refresh index from index.json and filesystem directories."""
        self.prompts = []
        self.by_uuid = {}
        self.by_title_slug = {}

        if self.index_path.exists():
            try:
                with open(self.index_path, "r", encoding="utf-8") as f:
                    self.prompts = json.load(f)
            except Exception as e:
                print(f"Warning: Failed to parse index.json: {e}")

        # Scan directory folders if index is missing or incomplete
        if not self.prompts:
            self._scan_filesystem()

        # Build fast lookup indexes
        for item in self.prompts:
            url_str = item.get("url") or ""
            extracted = self._extract_uuid(url_str)
            uuid = item.get("uuid") or item.get("id") or extracted
            if not uuid or uuid == "unknown-uuid":
                uuid = extracted
            item["uuid"] = uuid
            if uuid:
                self.by_uuid[uuid.lower()] = item

            title_slug = self._slugify(item.get("title") or "")
            item["title_slug"] = title_slug
            if title_slug:
                self.by_title_slug[title_slug.lower()] = item

    def _extract_uuid(self, url_str: str) -> str:
        if not url_str:
            return ""
        parts = url_str.rstrip("/").split("/prompt/")
        if len(parts) > 1:
            return parts[-1].split("?")[0]
        return ""

    def _slugify(self, text: str) -> str:
        if not text:
            return ""
        cleaned = re.sub(r"\|.*$", "", text)
        cleaned = re.sub(r"[^a-zA-Z0-9\s._-]", "", cleaned).strip()
        return re.sub(r"\s+", "-", cleaned)

    def _scan_filesystem(self):
        """Fallback directory scan if index.json is absent."""
        if not self.exports_dir.exists():
            return
        for entry in self.exports_dir.iterdir():
            if entry.is_dir() and not entry.name.startswith(".") and entry.name != "browser_user_data":
                prompt_json = entry / "prompt.json"
                if prompt_json.exists():
                    try:
                        with open(prompt_json, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            data["_folder_name"] = entry.name
                            self.prompts.append(data)
                    except Exception:
                        pass

    def search_prompts(self, query: str = "", tags: Optional[List[str]] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Search prompt library by keyword query and/or tags."""
        if not query and not tags:
            return self.prompts[:limit]

        query_words = [w.lower() for w in re.findall(r"\w+", query)] if query else []
        tag_set = set(t.lower() for t in tags) if tags else set()

        scored = []
        for p in self.prompts:
            score = 0
            title = (p.get("title") or "").lower()
            text = (p.get("text") or "").lower()
            description = (p.get("description") or "").lower()
            notes = (p.get("notes") or "").lower()
            raw_tags = p.get("tags") or []
            p_tags = set(t.lower() for t in raw_tags if t)

            for w in query_words:
                if w in title:
                    score += 10
                if w in p_tags:
                    score += 8
                if w in description:
                    score += 4
                if w in notes:
                    score += 3
                if w in text:
                    score += 1

            matched_tags = tag_set.intersection(p_tags) if tag_set else set()
            if tag_set:
                score += len(matched_tags) * 15

            if score > 0 or (not query and tag_set and len(matched_tags) > 0):
                scored.append((score, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:limit]]

    def get_prompt(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Find prompt by Title, Title slug, or UUID."""
        if not identifier:
            return None

        clean_id = identifier.strip().lower()

        if clean_id in self.by_uuid:
            return self.by_uuid[clean_id]

        slug = self._slugify(identifier).lower()
        if slug in self.by_title_slug:
            return self.by_title_slug[slug]

        for key, p in self.by_title_slug.items():
            if slug and (slug in key or key in slug):
                return p

        for p in self.prompts:
            title = (p.get("title") or "").lower()
            if clean_id in title:
                return p

        return None

    def get_prompt_directory(self, prompt_data: Dict[str, Any]) -> Optional[Path]:
        """Locate directory path on filesystem for prompt."""
        folder_name = prompt_data.get("_folderName") or prompt_data.get("_folder_name")
        if folder_name and (self.exports_dir / folder_name).exists():
            return self.exports_dir / folder_name

        slug = prompt_data.get("title_slug") or self._slugify(prompt_data.get("title") or "")
        if slug and (self.exports_dir / slug).exists():
            return self.exports_dir / slug

        uuid = prompt_data.get("uuid") or prompt_data.get("id")
        if uuid and (self.exports_dir / uuid).exists():
            return self.exports_dir / uuid

        return None

    def list_attachments(self, identifier: str) -> List[Dict[str, Any]]:
        """List all attached files for a prompt."""
        prompt = self.get_prompt(identifier)
        if not prompt:
            return []

        p_dir = self.get_prompt_directory(prompt)
        if not p_dir:
            return prompt.get("additional_files") or []

        attachments = []
        versions_dir = p_dir / "versions"
        search_dirs = [p_dir]
        if versions_dir.exists():
            for v in versions_dir.iterdir():
                if v.is_dir():
                    search_dirs.append(v)

        for d in search_dirs:
            add_files_dir = d / "additional-files"
            if add_files_dir.exists():
                for f in add_files_dir.iterdir():
                    if f.is_file() and not f.name.endswith(".receipt.json"):
                        attachments.append({
                            "name": f.name,
                            "path": str(f),
                            "bytes": f.stat().st_size,
                            "is_text": self._is_text_file(f.name)
                        })

        return attachments

    def read_attachment(self, identifier: str, filename: str) -> Optional[str]:
        """Read attachment content as text."""
        attachments = self.list_attachments(identifier)
        for att in attachments:
            if att["name"].lower() == filename.lower() or filename.lower() in att["name"].lower():
                fpath = Path(att["path"])
                if fpath.exists():
                    try:
                        return fpath.read_text(encoding="utf-8", errors="replace")
                    except Exception as e:
                        return f"[Error reading file: {e}]"
        return None

    def render_template(self, identifier: str, variables: Dict[str, str]) -> Optional[str]:
        """Fill prompt template text with key-value bindings."""
        prompt = self.get_prompt(identifier)
        if not prompt or "text" not in prompt or not prompt["text"]:
            return None

        text = prompt["text"]
        for key, value in variables.items():
            pattern = re.compile(re.escape(f"{{{{{key}}}}}"), re.IGNORECASE)
            text = pattern.sub(str(value), text)
            pattern_single = re.compile(re.escape(f"{{{key}}}"), re.IGNORECASE)
            text = pattern_single.sub(str(value), text)

        return text

    def _is_text_file(self, filename: str) -> str:
        ext = Path(filename).suffix.lower()
        return ext in [".txt", ".md", ".json", ".py", ".js", ".html", ".css", ".csv", ".xml", ".yaml", ".yml", ".sh"]
