"use client";

import { useEffect, useState } from "react";

/**
 * Fetches all site settings as a flat key/value map.
 * Components read individual keys via `get(key, fallback)`.
 *
 * Settings are cached in localStorage for 30 seconds (reduced from 5 min
 * for faster sync when admin updates phone/WhatsApp/email). The cache
 * is also busted by a `siteSettingsVersion` counter in localStorage —
 * the admin settings page increments this after saving, forcing all
 * components to re-fetch immediately.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if admin has bumped the version (cache-bust signal)
    let adminVersion = "0";
    try {
      adminVersion = localStorage.getItem("siteSettingsVersion") || "0";
    } catch {}

    // Try cache first — but only if version matches and cache is < 30s old
    try {
      const cached = localStorage.getItem("siteSettingsCache");
      if (cached) {
        const { data, ts, version } = JSON.parse(cached);
        const isFresh = Date.now() - ts < 30 * 1000; // 30 seconds
        const versionMatches = (version || "0") === adminVersion;
        if (isFresh && versionMatches) {
          setSettings(data);
          setLoaded(true);
          return;
        }
      }
    } catch {}

    // Fetch fresh from API (with cache-bust timestamp to bypass any
    // HTTP-level caching)
    fetch(`/api/public/site-settings?_t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        const map = d.settings || {};
        setSettings(map);
        setLoaded(true);
        try {
          localStorage.setItem(
            "siteSettingsCache",
            JSON.stringify({ data: map, ts: Date.now(), version: adminVersion }),
          );
        } catch {}
      })
      .catch(() => setLoaded(true));
  }, []);

  const get = (key: string, fallback = ""): string => settings[key] ?? fallback;

  return { settings, get, loaded };
}
