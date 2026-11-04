"""Shared contract for site-specific browser chat adapters.

This module deliberately has no Playwright dependency. A deployment can inject
an adapter factory backed by Playwright without forcing browser packages into
FastAPI tests or enabling automation for an unapproved site.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class BrowserSiteConfig:
    name: str
    base_url: str
    login_url: str | None
    selectors: dict[str, str]
    needs_login: bool = True
    response_timeout_seconds: float = 60.0
    stuck_tab_seconds: float = 30.0
    enabled: bool = False
    storage_state_path: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "BrowserSiteConfig":
        required = ("name", "base_url", "selectors")
        missing = [key for key in required if not raw.get(key)]
        if missing:
            raise ValueError(f"Browser site config is missing: {', '.join(missing)}")
        selectors = raw["selectors"]
        if not isinstance(selectors, dict):
            raise ValueError("Browser site selectors must be an object")
        required_selectors = ("chat_input", "send_button", "assistant_message")
        missing_selectors = [key for key in required_selectors if not selectors.get(key)]
        if missing_selectors:
            raise ValueError(
                "Browser site config is missing selectors: "
                + ", ".join(missing_selectors)
            )
        timeout = float(raw.get("timeouts", {}).get("response_seconds", 60.0))
        stuck = float(raw.get("timeouts", {}).get("stuck_tab_seconds", 30.0))
        if timeout <= 0 or stuck <= 0:
            raise ValueError("Browser timeouts must be greater than zero")
        return cls(
            name=str(raw["name"]),
            base_url=str(raw["base_url"]),
            login_url=str(raw["login_url"]) if raw.get("login_url") else None,
            selectors={str(key): str(value) for key, value in selectors.items()},
            needs_login=bool(raw.get("needs_login", True)),
            response_timeout_seconds=timeout,
            stuck_tab_seconds=stuck,
            enabled=bool(raw.get("enabled", False)),
            storage_state_path=(
                str(raw["storage_state_path"])
                if raw.get("storage_state_path")
                else None
            ),
            metadata=dict(raw.get("metadata", {})),
        )


class BaseBrowserAdapter(ABC):
    """Lifecycle contract shared by every approved browser-chat site."""

    def __init__(self, config: BrowserSiteConfig):
        self.config = config

    @abstractmethod
    async def health_check(self) -> None:
        """Raise an exception when the site or selectors are unavailable."""

    @abstractmethod
    async def ensure_authenticated(self) -> None:
        """Load an approved per-site/per-user session, never shared cookies."""

    @abstractmethod
    async def send_message(self, text: str) -> None:
        """Submit one user message to the active tab."""

    @abstractmethod
    async def stream_response(self) -> AsyncIterator[str]:
        """Yield non-empty assistant chunks until the answer is complete."""
        yield ""

    @abstractmethod
    async def cancel(self) -> None:
        """Stop the current generation and release the tab."""

    @abstractmethod
    async def close(self) -> None:
        """Close page/context resources owned by this adapter instance."""
