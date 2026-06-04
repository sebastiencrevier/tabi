import { useState, useRef } from "react";
import { T } from "../constants";
import { X, ImageIcon } from "./icons";

interface PhotoFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}

export function PhotoField({ label = "Photo", value, onChange }: PhotoFieldProps) {
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    reader.onload = () => onChange(reader.result as string);
    reader.onerror = () => setErr("Lecture du fichier impossible.");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && <div className="text-xs font-semibold text-ink2 mb-1.5">{label}</div>}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-line">
          <img src={value} alt="" className="w-full h-[150px] object-cover block" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 border-none rounded-lg w-[30px] h-[30px] cursor-pointer grid place-items-center text-white"
            style={{ background: "rgba(28,26,23,.65)" }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-xl font-semibold font-sans text-sm cursor-pointer border-0"
            style={{ border: `1.5px dashed ${T.line}`, background: T.paper, color: T.ink2 }}
          >
            <ImageIcon size={17} /> Choisir une photo
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <input
            type="url"
            value={value && value.startsWith("data:") ? "" : value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…ou colle une URL d'image (https://…)"
            className="w-full px-3 py-[10px] rounded-[11px] border border-line bg-paper text-[13px] text-ink font-sans outline-none"
          />
        </div>
      )}
      {err && <div className="text-vermilion text-xs mt-1.5">{err}</div>}
    </div>
  );
}
