"""Discover text-generation models from supported AI provider catalogs."""
from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


PROVIDER_BASE_URLS = {
    "openai": "https://api.openai.com/v1",
    "openrouter": "https://openrouter.ai/api/v1",
    "deepseek": "https://api.deepseek.com",
    "groq": "https://api.groq.com/openai/v1",
    "google_ai_studio": "https://generativelanguage.googleapis.com/v1beta/openai",
}

PROVIDER_ALIASES = {
    "googleaistudio": "google_ai_studio",
    "gemini": "google_ai_studio",
    "openai_compat": "openai_compatible",
}

class ProviderDiscoveryError(RuntimeError):
    """A provider catalog could not be safely listed."""


def canonical_provider_type(provider_type: str) -> str:
    key = provider_type.strip().lower().replace("-", "_").replace(" ", "_")
    key = PROVIDER_ALIASES.get(key, key)
    if key not in PROVIDER_BASE_URLS:
        raise ProviderDiscoveryError("اختر مزودًا مدعومًا من القائمة.")
    return key


def _request_json(url: str, api_key: str, timeout_seconds: int, *, google: bool = False) -> dict[str, Any]:
    headers = {"Accept": "application/json"}
    if google:
        headers["x-goog-api-key"] = api_key
    else:
        headers["Authorization"] = f"Bearer {api_key}"
    request = Request(url, headers=headers, method="GET")
    try:
        with urlopen(request, timeout=timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        raise ProviderDiscoveryError(
            f"تعذر جلب النماذج من المزود (HTTP {exc.code}). تحقق من المفتاح وصلاحيته."
        ) from exc
    except (URLError, TimeoutError, OSError) as exc:
        raise ProviderDiscoveryError("تعذر الاتصال بالمزود لجلب النماذج. حاول مرة أخرى.") from exc
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ProviderDiscoveryError("أعاد المزود استجابة غير مفهومة لقائمة النماذج.") from exc
    if not isinstance(payload, dict):
        raise ProviderDiscoveryError("أعاد المزود قائمة نماذج بصيغة غير متوقعة.")
    return payload


def _contains_text(items: Any) -> bool:
    if not isinstance(items, list):
        return True
    return any(str(item).lower() == "text" for item in items)


def _is_chat_candidate(provider_type: str, item: dict[str, Any], identifier: str) -> bool:
    if item.get("active") is False:
        return False

    architecture = item.get("architecture")
    architecture = architecture if isinstance(architecture, dict) else {}
    input_modalities = item.get("input_modalities", architecture.get("input_modalities"))
    output_modalities = item.get("output_modalities", architecture.get("output_modalities"))
    if not _contains_text(input_modalities) or not _contains_text(output_modalities):
        return False

    # Several providers do not expose a reliable task/capability field in their
    # list response. Keep such entries and let sequential chat-completion
    # fallback skip the ones that reject the request instead of guessing from
    # IDs, names, or context sizes.
    return True


def discover_models(provider_type: str, api_key: str, timeout_seconds: int = 30) -> list[dict[str, Any]]:
    """Return available text-generation model records without persisting secrets."""
    provider_type = canonical_provider_type(provider_type)
    if not api_key.strip():
        raise ProviderDiscoveryError("أدخل مفتاح API أولًا.")

    if provider_type == "google_ai_studio":
        models: list[dict[str, Any]] = []
        page_token: str | None = None
        seen_tokens: set[str] = set()
        for _ in range(10):
            query: dict[str, str | int] = {"pageSize": 1000}
            if page_token:
                query["pageToken"] = page_token
            payload = _request_json(
                "https://generativelanguage.googleapis.com/v1beta/models?" + urlencode(query),
                api_key,
                timeout_seconds,
                google=True,
            )
            for item in payload.get("models", []):
                if not isinstance(item, dict):
                    continue
                methods = item.get("supportedGenerationMethods")
                if not isinstance(methods, list) or "generateContent" not in methods:
                    continue
                identifier = str(item.get("baseModelId") or item.get("name", "").removeprefix("models/")).strip()
                if not identifier or not _is_chat_candidate(provider_type, item, identifier):
                    continue
                models.append(_model_record(item, identifier))
            next_token = payload.get("nextPageToken")
            if not next_token or str(next_token) in seen_tokens:
                break
            page_token = str(next_token)
            seen_tokens.add(page_token)
    else:
        base_url = PROVIDER_BASE_URLS[provider_type].rstrip("/")
        url = base_url + "/models"
        if provider_type == "openrouter":
            url = "https://openrouter.ai/api/v1/models/user?" + urlencode(
                {"output_modalities": "text", "limit": 500}
            )
        payload = _request_json(url, api_key, timeout_seconds)
        raw_models = payload.get("data", payload.get("models", []))
        if not isinstance(raw_models, list):
            raise ProviderDiscoveryError("أعاد المزود قائمة نماذج بصيغة غير متوقعة.")
        models = []
        for item in raw_models:
            if not isinstance(item, dict):
                continue
            identifier = str(item.get("id") or item.get("name", "")).strip()
            if not identifier or not _is_chat_candidate(provider_type, item, identifier):
                continue
            models.append(_model_record(item, identifier))

    unique: dict[str, dict[str, Any]] = {}
    for model in models:
        unique.setdefault(model["model_identifier"], model)
    result = list(unique.values())
    if not result:
        raise ProviderDiscoveryError(
            "لم يعثر المفتاح على نماذج محادثة نصية متاحة. تحقق من المفتاح أو صلاحيات الحساب."
        )
    return result


def _model_record(item: dict[str, Any], identifier: str) -> dict[str, Any]:
    display_name = str(item.get("name") or item.get("displayName") or identifier).strip()
    if len(display_name) > 120:
        display_name = display_name[:120]
    description = item.get("description")
    if description is not None:
        description = str(description)[:500]
    context_window = item.get("context_window") or item.get("context_length") or item.get("inputTokenLimit")
    if not isinstance(context_window, int) or context_window < 1:
        context_window = None
    return {
        "name": display_name,
        "model_identifier": identifier[:255],
        "description": description,
        "context_window": context_window,
        "capabilities": ["text", "chat"],
    }
