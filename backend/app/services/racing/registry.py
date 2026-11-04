"""Registry for validated, explicitly enabled browser-site configurations."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from backend.app.services.racing.adapters.base import BrowserSiteConfig


class BrowserSiteRegistry:
    def __init__(self) -> None:
        self._configs: dict[str, BrowserSiteConfig] = {}

    def register(self, config: BrowserSiteConfig) -> None:
        key = config.name.strip().lower()
        if not key:
            raise ValueError("Browser site name cannot be empty")
        if key in self._configs:
            raise ValueError(f"Browser site is already registered: {config.name}")
        self._configs[key] = config

    def get(self, name: str) -> BrowserSiteConfig:
        try:
            return self._configs[name.strip().lower()]
        except KeyError as exc:
            raise KeyError(f"Unknown browser site: {name}") from exc

    def enabled(self) -> tuple[BrowserSiteConfig, ...]:
        return tuple(config for config in self._configs.values() if config.enabled)

    def all(self) -> tuple[BrowserSiteConfig, ...]:
        return tuple(self._configs.values())

    @classmethod
    def from_directory(cls, directory: str | Path) -> "BrowserSiteRegistry":
        registry = cls()
        root = Path(directory)
        if not root.exists():
            return registry
        for path in sorted(root.glob("*.json")):
            raw: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
            registry.register(BrowserSiteConfig.from_dict(raw))
        return registry
