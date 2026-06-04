import { useState } from "react";
import { BedDouble, Camera, Edit3, Plus, Trash2 } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Field, Modal, Pill, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { uid } from "../lib/helpers";
import type { AppData } from "../types";

interface CitiesProps {
  data: AppData;
  set: (d: AppData) => void;
}

interface CityForm {
  name: string;
  jp: string;
  nights: number | string;
  note: string;
}

export function Cities({ data, set }: CitiesProps) {
  const { cities, activities, stays } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm: CityForm = { name: "", jp: "", nights: 2, note: "" };
  const [form, setForm] = useState<CityForm>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (c: (typeof cities)[0]) => {
    setEditingId(c.id);
    setForm({ ...emptyForm, ...c });
    setModal(true);
  };
  const save = () => {
    if (!form.name) return;
    if (editingId) {
      set({
        ...data,
        cities: cities.map((c) =>
          c.id === editingId ? { ...c, ...form, nights: parseInt(String(form.nights)) || 1 } : c
        ),
      });
    } else {
      set({
        ...data,
        cities: [
          ...cities,
          {
            id: uid(),
            jp: form.jp,
            note: form.note,
            name: form.name,
            nights: parseInt(String(form.nights)) || 1,
            lat: 35,
          },
        ],
      });
    }
    setModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const del = (id: string) => set({ ...data, cities: cities.filter((c) => c.id !== id) });
  const setNights = (id: string, n: number) =>
    set({
      ...data,
      cities: cities.map((c) => (c.id === id ? { ...c, nights: Math.max(1, n) } : c)),
    });

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Destinations"
        title="Villes"
        sub="Clique l'en-tête d'une carte pour modifier la ville."
        right={
          <Btn variant="accent" onClick={openAdd}>
            <Plus size={16} /> Ajouter une ville
          </Btn>
        }
      />

      <div
        className="grid gap-[18px]"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {cities.map((c, i) => {
          const acts = activities.filter((a) => a.cityId === c.id);
          const hotels = stays.filter((h) => h.cityId === c.id);
          return (
            <Card key={c.id} style={{ padding: 0, overflow: "hidden" }} hover>
              <div
                onClick={() => openEdit(c)}
                className="relative flex flex-col justify-end cursor-pointer"
                style={{
                  height: 88,
                  background: `linear-gradient(135deg, ${i % 2 ? T.indigo : T.vermilion} 0%, ${i % 2 ? "#2C3A4D" : "#A6362F"} 100%)`,
                  padding: 18,
                }}
              >
                <div
                  className="absolute right-3.5 top-2 font-serif text-white/[.18] leading-none select-none"
                  style={{ fontSize: 56 }}
                >
                  {c.jp}
                </div>
                <Edit3
                  size={14}
                  color="rgba(255,255,255,.5)"
                  className="absolute right-3.5 bottom-3.5"
                />
                <h3 className="m-0 text-white font-serif text-[24px]">{c.name}</h3>
              </div>
              <div className="p-[18px]">
                <p
                  onClick={() => openEdit(c)}
                  className="m-0 mb-3.5 text-[13px] text-ink2 leading-relaxed min-h-[38px] cursor-pointer"
                >
                  {c.note}
                </p>
                <div className="flex gap-2 flex-wrap mb-3.5">
                  <Pill icon={Camera} color={T.indigo} soft={T.indigoSoft}>
                    {acts.length} act.
                  </Pill>
                  <Pill icon={BedDouble} color={T.matcha} soft={T.matchaSoft}>
                    {hotels.length} héberg.
                  </Pill>
                </div>
                <div className="flex justify-between items-center pt-3.5 border-t border-line">
                  <span className="text-[12px] text-ink3">Nuits</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setNights(c.id, c.nights - 1)}
                      className="w-[26px] h-[26px] rounded-[8px] border border-line grid place-items-center text-ink2 text-[16px] leading-none cursor-pointer"
                      style={{ background: T.card }}
                    >
                      −
                    </button>
                    <span className="font-bold text-[16px] min-w-[18px] text-center">
                      {c.nights}
                    </span>
                    <button
                      onClick={() => setNights(c.id, c.nights + 1)}
                      className="w-[26px] h-[26px] rounded-[8px] border border-line grid place-items-center text-ink2 text-[16px] leading-none cursor-pointer"
                      style={{ background: T.card }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Supprimer cette ville ?")) del(c.id);
                      }}
                      className="bg-transparent border-none text-ink3 cursor-pointer ml-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Modifier la ville" : "Nouvelle ville"}
        footer={
          <>
            {editingId && (
              <Btn
                variant="ghost"
                onClick={() => {
                  if (confirm("Supprimer cette ville ?")) {
                    del(editingId);
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
        <div className="grid gap-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <Field
            label="Nom"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="ex : Sapporo"
          />
          <Field
            label="Kanji (optionnel)"
            value={form.jp}
            onChange={(v) => setForm({ ...form, jp: v })}
            placeholder="札幌"
          />
        </div>
        <Field
          label="Nuits"
          type="number"
          value={form.nights}
          onChange={(v) => setForm({ ...form, nights: v })}
        />
        <Field
          label="Note"
          rows={2}
          value={form.note}
          onChange={(v) => setForm({ ...form, note: v })}
          placeholder="Pourquoi cette ville ?"
        />
      </Modal>
    </div>
  );
}
