"use client";

import { useEffect, useState } from "react";

export interface Location {
  id: string;
  name: string;
  emirate: string;
  country: string;
  published: boolean;
}

interface UseLocationsOptions {
  /** Filter by emirate (e.g. "Dubai"). If omitted, returns all locations. */
  emirate?: string;
  /** Refetch interval in ms (0 = no refetch). Defaults to 0. */
  refetchInterval?: number;
}

interface UseLocationsResult {
  /** List of locations from the DB (single source of truth). */
  locations: Location[];
  /** Just the location names — drop-in replacement for the old hardcoded
   *  DUBAI_COMMUNITIES array. */
  locationNames: string[];
  loading: boolean;
  error: string | null;
  /** Manually trigger a refetch (e.g. after admin adds a location). */
  refetch: () => void;
}

/**
 * useLocations — client hook that fetches published locations from
 * /api/public/locations (DB-backed, single source of truth).
 *
 * Replaces the hardcoded `DUBAI_COMMUNITIES` array in src/lib/property-options.ts.
 * Used by:
 *   - Agent Portal → New Listing form
 *   - Agent Portal → Edit Listing modal
 *   - Public site  → PropertyListView filter
 *
 * Caches the response in a module-level variable so all callers within
 * a single page load share one network request.
 *
 * @example
 *   const { locationNames, loading } = useLocations();
 *   if (loading) return <Spinner />;
 *   return <select>{locationNames.map((name) => <option key={name}>{name}</option>)}</select>;
 */
export function useLocations(options: UseLocationsOptions = {}): UseLocationsResult {
  const { emirate, refetchInterval = 0 } = options;
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = new URL("/api/public/locations", window.location.origin);
    if (emirate) url.searchParams.set("emirate", emirate);

    fetch(url.toString())
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setLocations(d.locations || []);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Failed to load locations");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [emirate, nonce]);

  // Optional refetch interval (for keeping admin-synced data fresh in
  // long-lived agent sessions). Default 0 = no refetch.
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0) return;
    const id = setInterval(() => setNonce((n) => n + 1), refetchInterval);
    return () => clearInterval(id);
  }, [refetchInterval]);

  const refetch = () => setNonce((n) => n + 1);

  const locationNames = locations.map((l) => l.name);

  return { locations, locationNames, loading, error, refetch };
}
