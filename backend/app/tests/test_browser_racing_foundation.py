import asyncio
import json
from pathlib import Path

from backend.app.services.racing.adapters.base import BaseBrowserAdapter, BrowserSiteConfig
from backend.app.services.racing.registry import BrowserSiteRegistry
from backend.app.services.racing.worker_pool import BrowserWorkerPool


class FakeAdapter(BaseBrowserAdapter):
    def __init__(self, config: BrowserSiteConfig):
        super().__init__(config)
        self.cancelled = False
        self.closed = False

    async def health_check(self) -> None:
        return None

    async def ensure_authenticated(self) -> None:
        return None

    async def send_message(self, text: str) -> None:
        self.text = text

    async def stream_response(self):
        yield f"reply:{self.text}"

    async def cancel(self) -> None:
        self.cancelled = True

    async def close(self) -> None:
        self.closed = True


def test_site_config_registry_validates_and_filters_disabled(tmp_path: Path):
    config = {
        "name": "Example",
        "base_url": "https://example.test/chat",
        "selectors": {
            "chat_input": "textarea",
            "send_button": "button.send",
            "assistant_message": ".assistant",
        },
        "enabled": True,
    }
    (tmp_path / "example.json").write_text(json.dumps(config), encoding="utf-8")

    registry = BrowserSiteRegistry.from_directory(tmp_path)

    assert registry.get("EXAMPLE").base_url == "https://example.test/chat"
    assert [item.name for item in registry.enabled()] == ["Example"]


def test_worker_pool_runs_adapter_and_closes_it():
    async def scenario():
        config = BrowserSiteConfig.from_dict(
            {
                "name": "test",
                "base_url": "https://example.test",
                "selectors": {
                    "chat_input": "textarea",
                    "send_button": "button",
                    "assistant_message": ".assistant",
                },
            }
        )
        instances: list[FakeAdapter] = []

        async def factory():
            adapter = FakeAdapter(config)
            instances.append(adapter)
            return adapter

        pool = BrowserWorkerPool(worker_count=1)
        await pool.start()
        try:
            assert await pool.submit("hello", factory) == ["reply:hello"]
        finally:
            await pool.close()
        assert instances[0].cancelled is True
        assert instances[0].closed is True

    asyncio.run(scenario())
