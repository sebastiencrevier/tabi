import { useState, useEffect, useRef, useCallback } from "react";
import { supa } from "../lib/supabase";
import { mergeWithSeed, humanizeSupaError } from "../lib/helpers";
import type { CloudStatus } from "../types";

export function useStore<T>(
  key: string,
  initial: T
): [T, (value: T) => void, boolean, CloudStatus] {
  const [val, setVal] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const [cloud, setCloud] = useState<CloudStatus>({
    status: supa ? "checking" : "offline",
    detail: supa ? "" : "Clés Supabase absentes ou invalides.",
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWrite = useRef(0);
  const lastSeen = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;

    try {
      const raw = localStorage.getItem("tabi:" + key);
      if (raw != null) setVal(mergeWithSeed(JSON.parse(raw), initial));
    } catch (_e) {}

    const watchdog = setTimeout(() => {
      if (alive) {
        setLoaded(true);
        setCloud((c) =>
          c.status === "checking"
            ? { status: "error", detail: "Cloud trop lent à répondre — démarrage en mode local." }
            : c
        );
      }
    }, 3000);

    (async () => {
      if (!supa) {
        if (alive) {
          setLoaded(true);
          clearTimeout(watchdog);
        }
        return;
      }
      try {
        const { data, error } = await supa
          .from("trips")
          .select("content, updated_at")
          .eq("id", import.meta.env.VITE_TRIP_ID)
          .maybeSingle();
        if (error) {
          console.error("Supabase load error:", error);
          if (alive) setCloud({ status: "error", detail: humanizeSupaError(error) });
        } else {
          if (alive) setCloud({ status: "online", detail: "" });
          if (data && (data as { content?: unknown }).content) {
            const row = data as { content: unknown; updated_at: string };
            lastSeen.current = row.updated_at || null;
            const merged = mergeWithSeed(row.content, initial);
            if (alive) setVal(merged);
            try {
              localStorage.setItem("tabi:" + key, JSON.stringify(merged));
            } catch (_e) {}
          } else {
            try {
              const stamp = new Date().toISOString();
              await supa.from("trips").upsert({
                id: import.meta.env.VITE_TRIP_ID,
                content: initial,
                updated_at: stamp,
              });
              lastSeen.current = stamp;
            } catch (_e) {}
          }
        }
      } catch (_e) {
        if (alive)
          setCloud({ status: "error", detail: "Réseau injoignable. Vérifie ta connexion." });
      }
      if (alive) {
        setLoaded(true);
        clearTimeout(watchdog);
      }
    })();

    let timer: ReturnType<typeof setInterval> | null = null;
    let onVisible: (() => void) | null = null;
    let consecutiveErrors = 0;

    if (supa) {
      const POLL_MS = 30000;
      const tick = async () => {
        if (!alive) return;
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
        if (Date.now() - lastWrite.current < 3000) return;
        if (consecutiveErrors >= 3) return;
        try {
          const { data: meta, error: e1 } = await supa!
            .from("trips")
            .select("updated_at")
            .eq("id", import.meta.env.VITE_TRIP_ID)
            .maybeSingle();
          if (e1) {
            consecutiveErrors++;
            if (alive) setCloud({ status: "error", detail: humanizeSupaError(e1) });
            return;
          }
          consecutiveErrors = 0;
          if (alive)
            setCloud((c) => (c.status === "online" ? c : { status: "online", detail: "" }));
          const m = meta as { updated_at?: string } | null;
          if (!m || !m.updated_at) return;
          if (m.updated_at === lastSeen.current) return;
          const { data, error: e2 } = await supa!
            .from("trips")
            .select("content, updated_at")
            .eq("id", import.meta.env.VITE_TRIP_ID)
            .maybeSingle();
          if (e2 || !data) return;
          const row = data as { content: unknown; updated_at: string };
          if (!row.content) return;
          lastSeen.current = row.updated_at;
          const merged = mergeWithSeed(row.content, initial);
          setVal(merged);
          try {
            localStorage.setItem("tabi:" + key, JSON.stringify(merged));
          } catch (_e) {}
        } catch (_e) {
          consecutiveErrors++;
        }
      };
      timer = setInterval(tick, POLL_MS);
      onVisible = () => {
        if (document.visibilityState === "visible") {
          consecutiveErrors = 0;
          tick();
        }
      };
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", onVisible);
      }
    }

    return () => {
      alive = false;
      clearTimeout(watchdog);
      if (timer !== null) clearInterval(timer);
      if (onVisible && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setVal(next);
      try {
        localStorage.setItem("tabi:" + key, JSON.stringify(next));
      } catch (_e) {}
      if (!supa) return;
      lastWrite.current = Date.now();
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const stamp = new Date().toISOString();
          const { error } = await supa!
            .from("trips")
            .upsert({ id: import.meta.env.VITE_TRIP_ID, content: next, updated_at: stamp });
          if (error) {
            console.error("save cloud", error);
            setCloud({ status: "error", detail: humanizeSupaError(error) });
          } else {
            lastSeen.current = stamp;
            setCloud((c) => (c.status === "online" ? c : { status: "online", detail: "" }));
          }
        } catch (_e) {
          console.error("save cloud", _e);
        }
      }, 600);
    },
    [key]
  );

  return [val, save, loaded, cloud];
}
