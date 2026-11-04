"""Bounded async pool for browser adapters.

The pool is transport-agnostic: production injects a Playwright-backed factory;
tests can inject a fake adapter. Each job owns one adapter instance so session
state is never shared across users.
"""
from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Generic, TypeVar

from backend.app.services.racing.adapters.base import BaseBrowserAdapter

T = TypeVar("T")
AdapterFactory = Callable[[], Awaitable[BaseBrowserAdapter]]


@dataclass(slots=True)
class BrowserJob(Generic[T]):
    text: str
    factory: AdapterFactory
    timeout_seconds: float
    result: asyncio.Future[T]


class BrowserWorkerPool:
    def __init__(self, worker_count: int = 3, queue_size: int = 30):
        if worker_count < 1 or queue_size < 1:
            raise ValueError("worker_count and queue_size must be positive")
        self._queue: asyncio.Queue[BrowserJob[list[str]] | None] = asyncio.Queue(queue_size)
        self._workers: list[asyncio.Task[None]] = []
        self._worker_count = worker_count
        self._started = False

    async def start(self) -> None:
        if self._started:
            return
        self._started = True
        self._workers = [asyncio.create_task(self._run_worker()) for _ in range(self._worker_count)]

    async def submit(self, text: str, factory: AdapterFactory, timeout_seconds: float = 60.0) -> list[str]:
        if not self._started:
            raise RuntimeError("BrowserWorkerPool must be started before submit")
        if timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be greater than zero")
        loop = asyncio.get_running_loop()
        result: asyncio.Future[list[str]] = loop.create_future()
        await self._queue.put(BrowserJob(text, factory, timeout_seconds, result))
        return await result

    async def _run_worker(self) -> None:
        while True:
            job = await self._queue.get()
            if job is None:
                self._queue.task_done()
                return
            adapter: BaseBrowserAdapter | None = None
            try:
                adapter = await job.factory()
                chunks: list[str] = []
                async def execute() -> None:
                    await adapter.health_check()
                    await adapter.ensure_authenticated()
                    await adapter.send_message(job.text)
                    async for chunk in adapter.stream_response():
                        if chunk and chunk.strip():
                            chunks.append(chunk)
                await asyncio.wait_for(execute(), timeout=job.timeout_seconds)
                if not chunks:
                    raise RuntimeError("Browser adapter returned an empty response")
                if not job.result.done():
                    job.result.set_result(chunks)
            except asyncio.CancelledError:
                if not job.result.done():
                    job.result.cancel()
                raise
            except Exception as exc:
                if not job.result.done():
                    job.result.set_exception(exc)
            finally:
                if adapter is not None:
                    try:
                        await adapter.cancel()
                    except Exception:
                        pass
                    try:
                        await adapter.close()
                    except Exception:
                        pass
                self._queue.task_done()

    async def close(self) -> None:
        if not self._started:
            return
        for _ in self._workers:
            await self._queue.put(None)
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()
        self._started = False
