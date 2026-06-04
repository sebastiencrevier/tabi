import React, { useState, useRef } from "react";
import { T } from "../constants.js";
import { X, ImageIcon } from "./icons.js";

/**
 * Champ photo : téléversement depuis l'appareil (galerie iPhone) OU URL.
 * La photo est stockée en base64 (upload) ou en URL externe.
 *
 * ⚠️ Le téléversement consomme beaucoup d'egress Supabase.
 *    Préférer l'URL pour les photos publiques (Maps, Booking, etc.).
 */
export function PhotoField({ label = "Photo", value, onChange }) {
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErr("Image trop lourde (max 4 Mo). Réduis-la ou colle une URL.");
      return;
    }
    setErr("");
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.onerror = () => setErr("Lecture du fichier impossible.");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && <div style={{ fontSize: 12, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>{label}</div>}
      {value ? (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${T.line}` }}>
          <img src={value} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(28,26,23,.65)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <button
            type="button"
            onClick={() => inputRef.current && inputRef.current.click()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px",
              borderRadius: 12,
              border: `1.5px dashed ${T.line}`,
              background: T.paper,
              color: T.ink2,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            <ImageIcon size={17} /> Choisir une photo
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          <input
            type="url"
            value={value && value.startsWith("data:") ? "" : value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…ou colle une URL d'image (https://…)"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 11,
              border: `1px solid ${T.line}`,
              background: T.paper,
              fontSize: 13,
              color: T.ink,
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
      {err && <div style={{ color: T.vermilion, fontSize: 12, marginTop: 6 }}>{err}</div>}
    </div>
  );
}
