"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicSnapshot, subscribeToDemoChanges } from "./api";
import type { PublicSnapshot } from "./types";

export function usePublicSnapshot(intervalMs = 3500) {
  const [data, setData] = useState<PublicSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await getPublicSnapshot();
      setData(snapshot);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a fila.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, intervalMs);
    const unsubscribe = subscribeToDemoChanges(refresh);
    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [intervalMs, refresh]);

  return { data, error, loading, refresh };
}
