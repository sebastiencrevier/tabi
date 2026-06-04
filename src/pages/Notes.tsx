import { useState } from "react";
import { NotebookPen, Plus, Trash2 } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Empty, Field, Modal, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { uid } from "../lib/helpers";
import type { AppData } from "../types";

interface NotesProps {
  data: AppData;
  set: (d: AppData) => void;
}

interface NoteForm {
  title: string;
  date: string;
  body: string;
}

export function Notes({ data, set }: NotesProps) {
  const { notes } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm: NoteForm = { title: "", date: "", body: "" };
  const [form, setForm] = useState<NoteForm>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (n: AppData["notes"][0]) => {
    setEditingId(n.id);
    setForm({ ...emptyForm, ...n });
    setModal(true);
  };
  const save = () => {
    if (!form.title && !form.body) return;
    if (editingId) {
      set({ ...data, notes: notes.map((n) => (n.id === editingId ? { ...n, ...form } : n)) });
    } else {
      set({ ...data, notes: [{ id: uid(), ...form }, ...notes] });
    }
    setModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const del = (id: string) => set({ ...data, notes: notes.filter((n) => n.id !== id) });

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Carnet"
        title="Notes & journal"
        sub="Clique une note pour la modifier."
        right={
          <Btn variant="accent" onClick={openAdd}>
            <Plus size={16} /> Nouvelle entrée
          </Btn>
        }
      />

      <div style={{ columnWidth: 320, columnGap: 18 }}>
        {notes.map((n) => (
          <Card
            key={n.id}
            style={{
              padding: 22,
              marginBottom: 18,
              breakInside: "avoid",
              display: "inline-block",
              width: "100%",
              cursor: "pointer",
            }}
            hover
            onClick={() => openEdit(n)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                {n.title && <h3 className="m-0 font-serif text-[18px] text-ink">{n.title}</h3>}
                {n.date && (
                  <div className="text-[12px] text-ink3 mt-0.5">
                    {new Date(n.date).toLocaleDateString("fr-CA", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Supprimer cette note ?")) del(n.id);
                }}
                className="bg-transparent border-none text-ink3 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <p className="m-0 text-[14px] text-ink2 leading-relaxed whitespace-pre-wrap">
              {n.body}
            </p>
          </Card>
        ))}
      </div>
      {notes.length === 0 && (
        <Empty
          icon={NotebookPen}
          text="Ton carnet est vide."
          action={
            <Btn variant="soft" onClick={openAdd}>
              <Plus size={15} /> Écrire
            </Btn>
          }
        />
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Modifier l'entrée" : "Nouvelle entrée"}
        footer={
          <>
            {editingId && (
              <Btn
                variant="ghost"
                onClick={() => {
                  if (confirm("Supprimer cette note ?")) {
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
          placeholder="ex : Premier jour à Tokyo"
        />
        <Field
          label="Date (optionnel)"
          type="date"
          value={form.date}
          onChange={(v) => setForm({ ...form, date: v })}
        />
        <Field
          label="Texte"
          rows={6}
          value={form.body}
          onChange={(v) => setForm({ ...form, body: v })}
          placeholder="Raconte..."
        />
      </Modal>
    </div>
  );
}
