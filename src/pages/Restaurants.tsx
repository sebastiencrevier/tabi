import { useState } from "react";
import { ExternalLink } from "../components/ExternalLink";
import { PhotoField } from "../components/PhotoField";
import { Heart, MapPin, Plus, Trash2, UtensilsCrossed } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Empty, Field, Modal, Pill, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { fmt, uid } from "../lib/helpers";
import type { AppData, Restaurant } from "../types";

interface RestaurantsProps {
  data: AppData;
  set: (d: AppData) => void;
}

interface RestaurantForm {
  cityId: string;
  name: string;
  cuisine: string;
  budget: string;
  avg: string | number;
  note: string;
  fav: boolean;
  photo: string;
  url: string;
}

const BUDGETS: Record<string, string> = {
  Économique: T.matcha,
  Moyen: T.gold,
  "Haut de gamme": T.vermilion,
};

export function Restaurants({ data, set }: RestaurantsProps) {
  const { restaurants, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm: RestaurantForm = {
    cityId: cities[0]?.id || "",
    name: "",
    cuisine: "",
    budget: "Moyen",
    avg: "",
    note: "",
    fav: false,
    photo: "",
    url: "",
  };
  const [form, setForm] = useState<RestaurantForm>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (r: Restaurant) => {
    setEditingId(r.id);
    setForm({ ...emptyForm, ...r, avg: String(r.avg ?? "") });
    setModal(true);
  };
  const save = () => {
    if (!form.name) return;
    if (editingId) {
      set({
        ...data,
        restaurants: restaurants.map((r) =>
          r.id === editingId ? { ...r, ...form, avg: parseFloat(String(form.avg)) || 0 } : r
        ),
      });
    } else {
      set({
        ...data,
        restaurants: [
          ...restaurants,
          { id: uid(), ...form, avg: parseFloat(String(form.avg)) || 0 },
        ],
      });
    }
    setModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const upd = (id: string, patch: Partial<Restaurant>) =>
    set({ ...data, restaurants: restaurants.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const del = (id: string) => set({ ...data, restaurants: restaurants.filter((r) => r.id !== id) });

  const favs = restaurants.filter((r) => r.fav);

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Gastronomie"
        title="Restaurants"
        sub={`${restaurants.length} adresses · clique une carte pour la modifier`}
        right={
          <Btn variant="accent" onClick={openAdd}>
            <Plus size={16} /> Ajouter
          </Btn>
        }
      />

      {favs.length > 0 && (
        <Card
          className="p-5"
          style={{ background: `linear-gradient(160deg, ${T.card}, ${T.vermSoft})` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart size={17} fill={T.vermilion} stroke={T.vermilion} />
            <h3 className="m-0 font-serif text-[17px] text-ink">Wishlist foodie</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {favs.map((r) => (
              <Pill key={r.id} color={T.vermilion} soft="#fff" style={{ boxShadow: T.shadowSm }}>
                {r.name}
              </Pill>
            ))}
          </div>
        </Card>
      )}

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {restaurants.map((r) => {
          const city = cities.find((c) => c.id === r.cityId);
          return (
            <Card
              key={r.id}
              style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
              hover
              onClick={() => openEdit(r)}
            >
              {r.photo && (
                <img src={r.photo} alt="" className="w-full h-[150px] object-cover block" />
              )}
              <div className="p-[18px]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="m-0 mb-[3px] text-[16px] font-bold text-ink">{r.name}</h3>
                    <div className="text-[12px] text-ink3">
                      <MapPin size={11} className="inline mr-[3px]" />
                      {city?.name} · {r.cuisine}
                      {r.day ? ` · Jour ${r.day}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      upd(r.id, { fav: !r.fav });
                    }}
                    className="bg-transparent border-none cursor-pointer"
                  >
                    <Heart
                      size={18}
                      fill={r.fav ? T.vermilion : "none"}
                      stroke={r.fav ? T.vermilion : T.ink3}
                    />
                  </button>
                </div>
                {r.note && (
                  <p className="my-2.5 text-[13px] text-ink2 italic leading-[1.45]">{r.note}</p>
                )}
                {r.url && (
                  <div className="my-2.5" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink url={r.url} label="Site / réservation" />
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-line">
                  <Pill
                    color={BUDGETS[r.budget ?? "Moyen"] ?? T.ink3}
                    soft={(BUDGETS[r.budget ?? "Moyen"] ?? T.ink3) + "1A"}
                  >
                    {r.budget}
                  </Pill>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[14px] text-ink">~{fmt(r.avg ?? 0)} $</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Supprimer ce restaurant ?")) del(r.id);
                      }}
                      className="bg-transparent border-none text-ink3 cursor-pointer"
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
      {restaurants.length === 0 && (
        <Empty
          icon={UtensilsCrossed}
          text="Aucun restaurant enregistré."
          action={
            <Btn variant="soft" onClick={openAdd}>
              <Plus size={15} /> Ajouter
            </Btn>
          }
        />
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Modifier le restaurant" : "Nouveau restaurant"}
        footer={
          <>
            {editingId && (
              <Btn
                variant="ghost"
                onClick={() => {
                  if (confirm("Supprimer ce restaurant ?")) {
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
          placeholder="ex : Afuri Ramen"
        />
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field
            label="Ville"
            value={form.cityId}
            onChange={(v) => setForm({ ...form, cityId: v })}
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Field
            label="Cuisine"
            value={form.cuisine}
            onChange={(v) => setForm({ ...form, cuisine: v })}
            placeholder="ex : Ramen yuzu"
          />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field
            label="Gamme de prix"
            value={form.budget}
            onChange={(v) => setForm({ ...form, budget: v })}
            options={["Économique", "Moyen", "Haut de gamme"]}
          />
          <Field
            label="Prix moyen ($)"
            type="number"
            value={form.avg}
            onChange={(v) => setForm({ ...form, avg: v })}
            placeholder="0"
          />
        </div>
        <Field
          label="Note personnelle"
          rows={2}
          value={form.note}
          onChange={(v) => setForm({ ...form, note: v })}
          placeholder="Plat à essayer, conseil de réservation..."
        />
        <Field
          label="Lien (site, menu, réservation)"
          type="url"
          value={form.url}
          onChange={(v) => setForm({ ...form, url: v })}
          placeholder="https://..."
        />
        <PhotoField
          label="Photo"
          value={form.photo}
          onChange={(v) => setForm({ ...form, photo: v })}
        />
        <label className="flex items-center gap-2 cursor-pointer text-sm text-ink2">
          <input
            type="checkbox"
            checked={form.fav}
            onChange={(e) => setForm({ ...form, fav: e.target.checked })}
          />{" "}
          Ajouter à la wishlist foodie
        </label>
      </Modal>
    </div>
  );
}
