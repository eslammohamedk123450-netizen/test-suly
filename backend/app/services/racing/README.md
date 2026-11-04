# Browser racing foundation

This directory contains the safe, site-agnostic foundation for future browser-chat adapters:

- `adapters/base.py` defines `BrowserSiteConfig` and `BaseBrowserAdapter`.
- `registry.py` loads and validates JSON configs.
- `worker_pool.py` bounds concurrency, applies timeouts, cancels stuck work, and closes each adapter.
- `site_configs/site_template.json` is intentionally disabled and contains no real site or session.

A production Playwright adapter must be injected through a factory. It must use a separate context/session per user and site, keep storage state outside Git, and honor the target site's terms. CAPTCHA bypass, shared cookies, and automatic login are not implemented.
