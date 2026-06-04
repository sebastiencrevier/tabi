// ============================================================
// useStore — hook de stockage avec sync Supabase + cache local
// ------------------------------------------------------------
// 1. Affiche immédiatement les données du localStorage (instantané)
// 2. Charge ensuite la version cloud Supabase (source de vérité partagée)
// 3. Watchdog 3s : si Supabase ne répond pas, démarre en mode local
// 4. Polling intelligent : ne télécharge le contenu que si timestamp changé
// 5. Sauvegardes debounced (600ms) pour éviter les flots de requêtes
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { supa } from "../lib/supabase.js";
import { TRIP_ID } from "../config.js";
import { mergeWithSeed, humanizeSupaError } from "../lib/helpers.js";

export function useStore(key, initial) {
  const [val, setVal] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const [cloud, setCloud] = useState({
    status: supa ? "checking" : "offline",
    detail: supa ? "" : "Clés Supabase absentes ou invalides.",
  });
  const saveTimer = useRef(null);
  const lastWrite = useRef(0);
  const lastSeen = useRef(null);

  useEffect(() => {
    let alive = true;

    // 1) Cache local pour un affichage immédiat
    try {
      const raw = localStorage.getItem("tabi:" + key);
      if (raw != null) setVal(mergeWithSeed(JSON.parse(raw), initial));
    } catch (e) {}

    // Filet de sécurité : si Supabase ne répond pas en 3s, l'app démarre en local.
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

    // 2) Cloud (source de vérité partagée)
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
          .eq("id", TRIP_ID)
          .maybeSingle();
        if (error) {
          console.error("Supabase load error:", error);
          if (alive) setCloud({ status: "error", detail: humanizeSupaError(error) });
        } else {
          if (alive) setCloud({ status: "online", detail: "" });
          if (data && data.content) {
            lastSeen.current = data.updated_at || null;
            const merged = mergeWithSeed(data.content, initial);
            if (alive) setVal(merged);
            try {
              localStorage.setItem("tabi:" + key, JSON.stringify(merged));
            } catch (e) {}
          } else {
            // Connexion OK mais aucune donnée : on sème les données initiales.
            try {
              const stamp = new Date().toISOString();
              await supa.from("trips").upsert({
                id: TRIP_ID,
                content: initial,
                updated_at: stamp,
              });
              lastSeen.current = stamp;
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error("load cloud", e);
        if (alive) setCloud({ status: "error", detail: "Réseau injoignable. Vérifie ta connexion." });
      }
      if (alive) {
        setLoaded(true);
        clearTimeout(watchdog);
      }
    })();

    // 3) Polling économe : 30s, timestamp seul, télécharge contenu si changé
    let timer = null;
    let consecutiveErrors = 0;
    if (supa) {
      const POLL_MS = 30000;
      const tick = async () => {
        if (!alive) return;
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
        if (Date.now() - lastWrite.current < 3000) return;
        if (consecutiveErrors >= 3) return;
        try {
          const { data: meta, error: e1 } = await supa
            .from("trips")
            .select("updated_at")
            .eq("id", TRIP_ID)
            .maybeSingle();
          if (e1) {
            consecutiveErrors++;
            if (alive) setCloud({ status: "error", detail: humanizeSupaError(e1) });
            return;
          }
          consecutiveErrors = 0;
          if (alive)
            setCloud((c) => (c.status === "online" ? c : { status: "online", detail: "" }));
          if (!meta || !meta.updated_at) return;
          if (meta.updated_at === lastSeen.current) return;
          const { data, error: e2 } = await supa
            .from("trips")
            .select("content, updated_at")
            .eq("id", TRIP_ID)
            .maybeSingle();
          if (e2 || !data || !data.content) return;
          lastSeen.current = data.updated_at;
          const merged = mergeWithSeed(data.content, initial);
          setVal(merged);
          try {
            localStorage.setItem("tabi:" + key, JSON.stringify(merged));
          } catch (e) {}
        } catch (e) {
          consecutiveErrors++;
        }
      };
      timer = setInterval(tick, POLL_MS);
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          consecutiveErrors = 0;
          tick();
        }
      };
      if (typeof document !== "undefined")
        document.addEventListener("visibilitychange", onVisible);
      const cleanupVisibility = () => {
        if (typeof document !== "undefined")
          document.removeEventListener("visibilitychange", onVisible);
      };
      timer.__cleanup = cleanupVisibility;
    }
    return () => {
      alive = false;
      clearTimeout(watchdog);
      if (timer) {
        clearInterval(timer);
        if (timer.__cleanup) timer.__cleanup();
      }
    };
  }, [key]);

  // Sauvegarde : état local immédiat + cache, puis cloud (debounce 600ms)
  const save = useCallback(
    (next) => {
      setVal(next);
      try {
        localStorage.setItem("tabi:" + key, JSON.stringify(next));
      } catch (e) {}
      if (!supa) return;
      lastWrite.current = Date.now();
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const stamp = new Date().toISOString();
          const { error } = await supa
            .from("trips")
            .upsert({ id: TRIP_ID, content: next, updated_at: stamp });
          if (error) {
            console.error("save cloud", error);
            setCloud({ status: "error", detail: humanizeSupaError(error) });
          } else {
            lastSeen.current = stamp;
            setCloud((c) => (c.status === "online" ? c : { status: "online", detail: "" }));
          }
        } catch (e) {
          console.error("save cloud", e);
        }
      }, 600);
    },
    [key]
  );

  return [val, save, loaded, cloud];
}
