import { useState } from "react";
import { ExternalLink } from "../components/ExternalLink";
import { PhotoField } from "../components/PhotoField";
import { Camera, Clock, Plus, Star, Trash2, Wallet } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Empty, Field, Modal, SectionTitle } from "../components/ui/index";
import { STATUS, T } from "../constants";
import { fmt, uid } from "../lib/helpers";
import type { AppData, Activity } from "../types";

interface ActivitiesProps {
  data: AppData;
  set: (d: AppData) => void;
}

interface ActivityForm {
  cityId: string;
  title: string;
  cost: string | number;
  hours: string | number;
  status: string;
  fav: boolean;
  note: string;
  photo: string;
  url: string;
}

export function Activities({ data, set }: ActivitiesProps) {
  const { activities, cities } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState("Toutes");
  const emptyForm: ActivityForm = {
    cityId: cities[0]?.id || "",
    title: "",
    cost: "",
    hours: "",
    status: "todo",
    fav: false,
    note: "",
    photo: "",
    url: "",
  };
  const [form, setForm] = useState<ActivityForm>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({ ...emptyForm, ...a, cost: String(a.cost ?? ""), hours: String(a.hours ?? "") });
    setModal(true);
  };

  const save = () => {
    if (!form.title) return;
    type ActivityStatus = Activity["status"];
    const status = form.status as ActivityStatus;
    if (editingId) {
      set({
        ...data,
        activities: activities.map((a) =>
          a.id === editingId
            ? {
                ...a,
                ...form,
                status,
                cost: parseFloat(String(form.cost)) || 0,
                hours: parseFloat(String(form.hours)) || 0,
              }
            : a
        ),
      });
    } else {
      set({
        ...data,
        activities: [
          ...activities,
          {
            id: uid(),
            ...form,
            status,
            cost: parseFloat(String(form.cost)) || 0,
            hours: parseFloat(String(form.hours)) || 0,
          },
        ],
      });
    }
    setModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const upd = (id: string, patch: Partial<Activity>) =>
    set({ ...data, activities: activities.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
  const del = (id: string) => set({ ...data, activities: activities.filter((a) => a.id !== id) });
  const cycleStatus = (a: Activity) => {
    const order: Activity["status"][] = ["todo", "reserved", "done"];
    upd(a.id, { status: order[(order.indexOf(a.status) + 1) % 3] });
  };

  const shown =
    filterCity === "Toutes" ? activities : activities.filter((a) => a.cityId === filterCity);
  const done = activities.filter((a) => a.status === "done").length;

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="À découvrir"
        title="Activités & attractions"
        sub={`${done}/${activities.length} complétées · clique une carte pour la modifier`}
        right={
          <Btn variant="accent" onClick={openAdd}>
            <Plus size={16} /> Ajouter
          </Btn>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {["Toutes", ...cities.map((c) => c.name)].map((name) => {
          const id =
            name === "Toutes" ? "Toutes" : (cities.find((c) => c.name === name)?.id ?? name);
          const active = filterCity === id;
          return (
            <button
              key={name}
              onClick={() => setFilterCity(id)}
              className="px-[14px] py-[7px] rounded-full border-none cursor-pointer text-[13px] font-semibold transition-all"
              style={{
                background: active ? T.ink : T.card,
                color: active ? "#fff" : T.ink2,
                boxShadow: active ? "none" : `inset 0 0 0 1px ${T.line}`,
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {shown.map((a) => {
          const city = cities.find((c) => c.id === a.cityId);
          const st = STATUS[a.status];
          return (
            <Card
              key={a.id}
              style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
              hover
              onClick={() => openEdit(a)}
            >
              {a.photo && (
                <img src={a.photo} alt="" className="w-full h-[150px] object-cover block" />
              )}
              <div className="p-[18px]">
                <div className="flex justify-between items-start mb-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cycleStatus(a);
                    }}
                    className="inline-flex items-center gap-[6px] px-[10px] py-1 rounded-full text-[12px] font-semibold border-none cursor-pointer"
                    style={{ color: st.color, background: st.soft }}
                  >
                    <st.icon size={13} /> {st.label}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      upd(a.id, { fav: !a.fav });
                    }}
                    className="bg-transparent border-none cursor-pointer p-0.5"
                  >
                    <Star
                      size={18}
                      fill={a.fav ? T.gold : "none"}
                      stroke={a.fav ? T.gold : T.ink3}
                    />
                  </button>
                </div>
                <h3 className="m-0 mb-1 text-[16px] font-bold text-ink">{a.title}</h3>
                <div className="text-[12px] text-ink3 mb-2.5">
                  {city?.name} {city?.jp}
                  {a.day ? ` · Jour ${a.day}` : ""}
                </div>
                {a.note && (
                  <p className="m-0 mb-3 text-[13px] text-ink2 leading-[1.45] italic">{a.note}</p>
                )}
                {a.url && (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink url={a.url} label="Site / réservation" />
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-line">
                  <div className="flex gap-3 text-[13px] text-ink2">
                    <span className="flex items-center gap-1">
                      <Wallet size={13} /> {a.cost ? fmt(a.cost) + " $" : "Gratuit"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {a.hours}h
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Supprimer cette activité ?")) del(a.id);
                    }}
                    className="bg-transparent border-none text-ink3 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {shown.length === 0 && (
        <Empty
          icon={Camera}
          text="Aucune activité pour ce filtre."
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
        title={editingId ? "Modifier l'activité" : "Nouvelle activité"}
        footer={
          <>
            {editingId && (
              <Btn
                variant="ghost"
                onClick={() => {
                  if (confirm("Supprimer cette activité ?")) {
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
          label="Titre"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          placeholder="ex : Mont Fuji 5e station"
        />
        <Field
          label="Ville"
          value={form.cityId}
          onChange={(v) => setForm({ ...form, cityId: v })}
          options={cities.map((c) => ({ value: c.id, label: c.name }))}
        />
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Field
            label="Coût ($)"
            type="number"
            value={form.cost}
            onChange={(v) => setForm({ ...form, cost: v })}
            placeholder="0"
          />
          <Field
            label="Durée (h)"
            type="number"
            value={form.hours}
            onChange={(v) => setForm({ ...form, hours: v })}
            placeholder="2"
          />
          <Field
            label="Statut"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={[
              { value: "todo", label: "À faire" },
              { value: "reserved", label: "Réservé" },
              { value: "done", label: "Complété" },
            ]}
          />
        </div>
        <Field
          label="Note personnelle"
          rows={2}
          value={form.note}
          onChange={(v) => setForm({ ...form, note: v })}
          placeholder="Conseil, horaire, astuce..."
        />
        <Field
          label="Lien (site, billetterie, réservation)"
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
          Marquer comme favori
        </label>
      </Modal>
    </div>
  );
}
