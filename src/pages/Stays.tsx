import { useState } from "react";
import { ExternalLink } from "../components/ExternalLink";
import { PhotoField } from "../components/PhotoField";
import { BedDouble, Plus, Star, Trash2 } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Empty, Field, Modal, Pill, SectionTitle } from "../components/ui/index";
import { STATUS, T } from "../constants";
import { fmt, uid } from "../lib/helpers";
import type { AppData, Stay } from "../types";

interface StaysProps {
  data: AppData;
  set: (d: AppData) => void;
}

interface StayForm {
  id?: string;
  cityId: string;
  name: string;
  area: string;
  price: string | number;
  dist: string;
  rating: string | number;
  status: string;
  note: string;
  photo: string;
  url: string;
  days?: number[];
  day?: number;
}

function daysToString(form: StayForm): string {
  const ds: number[] = Array.isArray(form.days) ? form.days : form.day ? [form.day] : [];
  if (!ds.length) return "";
  const sorted = [...ds].sort((a, b) => a - b);
  const ranges: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    ranges.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return ranges.join(", ");
}

function parseDays(txt: string): number[] {
  const days: number[] = [];
  txt.split(",").forEach((part) => {
    const p = part.trim();
    if (!p) return;
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = parseInt(m[1]),
        b = parseInt(m[2]);
      for (let k = Math.min(a, b); k <= Math.max(a, b); k++) days.push(k);
    } else {
      const n = parseInt(p);
      if (!isNaN(n) && n > 0) days.push(n);
    }
  });
  return [...new Set(days)].sort((a, b) => a - b);
}

export function Stays({ data, set }: StaysProps) {
  const { stays, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm: StayForm = {
    cityId: cities[0]?.id || "",
    name: "",
    area: "",
    price: "",
    dist: "",
    rating: "",
    status: "todo",
    note: "",
    photo: "",
    url: "",
  };
  const [form, setForm] = useState<StayForm>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (h: Stay) => {
    setEditingId(h.id);
    setForm({ ...emptyForm, ...h, price: String(h.price ?? ""), rating: String(h.rating ?? "") });
    setModal(true);
  };
  const save = () => {
    if (!form.name) return;
    if (editingId) {
      set({
        ...data,
        stays: stays.map((h) =>
          h.id === editingId
            ? {
                ...h,
                ...form,
                price: parseFloat(String(form.price)) || 0,
                rating: parseFloat(String(form.rating)) || 0,
              }
            : h
        ),
      });
    } else {
      set({
        ...data,
        stays: [
          ...stays,
          {
            id: uid(),
            ...form,
            price: parseFloat(String(form.price)) || 0,
            rating: parseFloat(String(form.rating)) || 0,
          } as Stay,
        ],
      });
    }
    setModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const upd = (id: string, patch: Partial<Stay>) =>
    set({ ...data, stays: stays.map((h) => (h.id === id ? { ...h, ...patch } : h)) });
  const del = (id: string) => set({ ...data, stays: stays.filter((h) => h.id !== id) });

  const statusOrder = ["todo", "reserved", "done"] as const;

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Où dormir"
        title="Hébergements"
        sub="Clique une ligne pour modifier l'hébergement."
        right={
          <Btn variant="accent" onClick={openAdd}>
            <Plus size={16} /> Ajouter
          </Btn>
        }
      />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="tabi-table">
          <div
            className="tabi-thead grid gap-3 px-5 py-[14px] text-[12px] font-bold text-ink2 uppercase tracking-[0.5px]"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr 40px", background: T.paper2 }}
          >
            <span>Hébergement</span>
            <span>Quartier</span>
            <span>Distance</span>
            <span>Note</span>
            <span>Statut</span>
            <span></span>
          </div>
          {stays.map((h) => {
            const city = cities.find((c) => c.id === h.cityId);
            const st = STATUS[h.status ?? "todo"];
            const ds: number[] = Array.isArray(h.days) ? h.days : h.day ? [h.day] : [];
            const sorted = [...ds].sort((a, b) => a - b);
            return (
              <div
                key={h.id}
                className="tabi-trow grid gap-3 px-5 py-4 items-center cursor-pointer"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr 40px",
                  borderTop: `1px solid ${T.line}`,
                }}
                onClick={() => openEdit(h)}
              >
                <div className="flex items-center gap-2.5">
                  {h.photo && (
                    <img
                      src={h.photo}
                      alt=""
                      className="w-11 h-11 rounded-[9px] object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px] text-ink">{h.name}</div>
                    <div className="text-[12px] text-ink3 flex items-center flex-wrap gap-1">
                      <span>
                        {city?.name} · {fmt(h.price)} $/nuit{h.note ? ` — ${h.note}` : ""}
                      </span>
                      {ds.length > 0 && (
                        <span
                          className="px-[7px] py-px rounded-full font-semibold text-[11px]"
                          style={{ background: T.matchaSoft, color: T.matcha }}
                        >
                          📅{" "}
                          {sorted.length === 1
                            ? `Jour ${sorted[0]}`
                            : `${sorted.length} nuits (J${sorted[0]}–J${sorted[sorted.length - 1]})`}
                        </span>
                      )}
                    </div>
                    {h.url && (
                      <div className="mt-[3px]" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink url={h.url} label="Réserver / voir" />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[13px] text-ink2">{h.area}</span>
                <span className="text-[13px] text-ink2">{h.dist}</span>
                <span>
                  <Pill color={T.gold} soft={T.goldSoft} icon={Star}>
                    {h.rating}
                  </Pill>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next =
                      statusOrder[
                        (statusOrder.indexOf(h.status as (typeof statusOrder)[number]) + 1) % 3
                      ];
                    upd(h.id, { status: next });
                  }}
                  className="inline-flex items-center gap-[5px] px-[10px] py-1 rounded-full text-[12px] font-semibold border-none cursor-pointer w-fit"
                  style={{ color: st.color, background: st.soft }}
                >
                  <st.icon size={12} /> {st.label}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Supprimer cet hébergement ?")) del(h.id);
                  }}
                  className="bg-transparent border-none text-ink3 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
        {stays.length === 0 && <Empty icon={BedDouble} text="Aucun hébergement enregistré." />}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Modifier l'hébergement" : "Nouvel hébergement"}
        footer={
          <>
            {editingId && (
              <Btn
                variant="ghost"
                onClick={() => {
                  if (confirm("Supprimer cet hébergement ?")) {
                    del(editingId!);
                    setModal(false);
                  }
                }}
                style={{ color: T.vermilion, marginRight: "auto" }}
              >
                <Trash2 size={14} /> Supprimer
              </Btn>
            )}
            <Btn variant="ghost" onClick={() => setModal(false)}>
              Annuler
            </Btn>
            <Btn variant="accent" onClick={save}>
              {editingId ? "Enregistrer" : "Ajouter"}
            </Btn>
          </>
        }
      >
        <Field
          label="Nom"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="ex : The Tokyo Station Hotel"
        />
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field
            label="Ville"
            value={form.cityId}
            onChange={(v) => setForm({ ...form, cityId: v })}
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Field
            label="Quartier"
            value={form.area}
            onChange={(v) => setForm({ ...form, area: v })}
            placeholder="ex : Marunouchi"
          />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Field
            label="Prix/nuit ($)"
            type="number"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
            placeholder="0"
          />
          <Field
            label="Note /10"
            type="number"
            value={form.rating}
            onChange={(v) => setForm({ ...form, rating: v })}
            placeholder="9.0"
          />
          <Field
            label="Statut"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={[
              { value: "todo", label: "À faire" },
              { value: "reserved", label: "Réservé" },
              { value: "done", label: "Confirmé" },
            ]}
          />
        </div>
        <Field
          label="Distance des attractions"
          value={form.dist}
          onChange={(v) => setForm({ ...form, dist: v })}
          placeholder="ex : 5 min à pied de la gare"
        />
        <Field
          label="Note personnelle"
          value={form.note}
          onChange={(v) => setForm({ ...form, note: v })}
          placeholder="Petit-déj inclus, vue..."
        />
        <Field
          label="Lien (réservation, Booking, site)"
          type="url"
          value={form.url}
          onChange={(v) => setForm({ ...form, url: v })}
          placeholder="https://..."
        />
        <div>
          <div className="text-[12px] font-semibold text-ink2 mb-1.5">
            Nuits assignées (numéros de jours)
          </div>
          <input
            type="text"
            value={daysToString(form)}
            onChange={(e) => setForm({ ...form, days: parseDays(e.target.value), day: undefined })}
            placeholder="ex : 3-7 (du jour 3 au jour 7) ou 1, 4, 9"
            className="w-full px-3 py-[10px] rounded-[11px] border border-line text-[14px] text-ink outline-none font-sans"
            style={{ background: T.paper, boxSizing: "border-box" }}
          />
          <div className="text-[11px] text-ink3 mt-1 leading-relaxed">
            Tu peux aussi assigner les nuits directement depuis l'onglet « Par jour ».
          </div>
        </div>
        <PhotoField
          label="Photo"
          value={form.photo}
          onChange={(v) => setForm({ ...form, photo: v })}
        />
      </Modal>
    </div>
  );
}
