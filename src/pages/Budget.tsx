import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit3,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Donut, Empty, Field, Modal, Pill, Progress, SectionTitle } from "../components/ui/index";
import { CATS, PEOPLE, PERSON_COLOR, T } from "../constants";
import { fmt, uid } from "../lib/helpers";
import type { AppData, Expense } from "../types";

interface BudgetProps {
  data: AppData;
  set: (d: AppData) => void;
  totalSpent: number;
}

interface ExpenseForm {
  cat: string;
  label: string;
  amount: string;
  date: string;
  paidBy: string;
  split: boolean;
}

export function Budget({ data, set, totalSpent }: BudgetProps) {
  const { trip, expenses } = data;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string | number>(trip.budget);
  const emptyForm: ExpenseForm = {
    cat: "Activités",
    label: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paidBy: PEOPLE[0],
    split: false,
  };
  const [form, setForm] = useState<ExpenseForm>(emptyForm);

  const remaining = trip.budget - totalSpent;
  const over = remaining < 0;

  const byCat = Object.keys(CATS)
    .map((cat) => ({
      cat,
      value: expenses.filter((e) => e.cat === cat).reduce((s, e) => s + e.amount, 0),
      color: CATS[cat].color,
    }))
    .filter((x) => x.value > 0);

  const tally = useMemo(() => {
    const paid: Record<string, number> = { Filou: 0, Kathou: 0 };
    const owed: Record<string, number> = { Filou: 0, Kathou: 0 };
    expenses.forEach((e) => {
      const payer = (PEOPLE as readonly string[]).includes(e.paidBy) ? e.paidBy : PEOPLE[0];
      paid[payer] += e.amount;
      if (e.split) {
        owed["Filou"] += e.amount / 2;
        owed["Kathou"] += e.amount / 2;
      } else {
        owed[payer] += e.amount;
      }
    });
    const balFilou = paid["Filou"] - owed["Filou"];
    let settle: { from: string; to: string; amount: number } | null = null;
    const amt = Math.abs(balFilou);
    if (amt >= 0.5)
      settle =
        balFilou > 0
          ? { from: "Kathou", to: "Filou", amount: amt }
          : { from: "Filou", to: "Kathou", amount: amt };
    return { paid, owed, settle };
  }, [expenses]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, paidBy: form.paidBy });
    setModal(true);
  };
  const openEdit = (e: Expense) => {
    setEditingId(e.id);
    setForm({ ...emptyForm, ...e, amount: String(e.amount), split: !!e.split });
    setModal(true);
  };
  const save = () => {
    if (!form.label || !form.amount) return;
    if (editingId) {
      set({
        ...data,
        expenses: expenses.map((e) =>
          e.id === editingId ? { ...e, ...form, amount: parseFloat(form.amount) } : e
        ),
      });
    } else {
      set({
        ...data,
        expenses: [{ id: uid(), ...form, amount: parseFloat(form.amount) }, ...expenses],
      });
    }
    setModal(false);
    setEditingId(null);
  };
  const del = (id: string) => set({ ...data, expenses: expenses.filter((e) => e.id !== id) });
  const saveBudget = () => {
    set({ ...data, trip: { ...trip, budget: parseFloat(String(budgetInput)) || 0 } });
    setEditBudget(false);
  };

  const balanceBg = tally.settle
    ? `linear-gradient(135deg, ${PERSON_COLOR[tally.settle.to]} 0%, ${PERSON_COLOR[tally.settle.to]}E6 100%)`
    : `linear-gradient(135deg, ${T.matcha} 0%, #5A6B4D 100%)`;

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Finances"
        title="Budget"
        sub="Suis tes dépenses, par catégorie et par personne."
        right={
          <Btn variant="accent" onClick={openAdd}>
            <Plus size={16} /> Ajouter une dépense
          </Btn>
        }
      />

      {over && (
        <Card
          className="px-[18px] py-[14px] flex gap-3 items-center"
          style={{ background: T.vermSoft, border: `1px solid ${T.vermilion}33` }}
        >
          <AlertTriangle size={20} color={T.vermilion} />
          <div className="text-vermilion font-semibold text-sm">
            Tu dépasses ton budget de {fmt(Math.abs(remaining))} $. Ajuste tes dépenses ou augmente
            le budget.
          </div>
        </Card>
      )}

      {/* Balance banner */}
      <Card style={{ padding: 0, overflow: "hidden", background: balanceBg, color: "#fff" }}>
        <div className="px-6 py-[22px] flex items-center gap-[18px] flex-wrap">
          <div
            className="w-[52px] h-[52px] rounded-[14px] grid place-items-center shrink-0"
            style={{ background: "rgba(255,255,255,.18)" }}
          >
            <TrendingUp size={26} color="#fff" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[11px] font-bold tracking-[1.5px] uppercase opacity-85 mb-1">
              Balance actuelle
            </div>
            {tally.settle ? (
              <>
                <div className="font-serif text-[24px] font-semibold leading-tight">
                  {tally.settle.from} doit{" "}
                  <span className="text-[32px]">{fmt(tally.settle.amount)} $</span> à{" "}
                  {tally.settle.to}
                </div>
                <div className="text-[13px] opacity-90 mt-1">
                  pour équilibrer les dépenses du voyage
                </div>
              </>
            ) : (
              <>
                <div className="font-serif text-[26px] font-semibold">Tout est équilibré ✨</div>
                <div className="text-[13px] opacity-90 mt-1">
                  Filou et Kathou sont à zéro l'un envers l'autre.
                </div>
              </>
            )}
          </div>
        </div>
        <div
          className="flex gap-6 flex-wrap text-[13px] px-6 py-3"
          style={{ background: "rgba(0,0,0,.18)" }}
        >
          {PEOPLE.map((p) => {
            const net = tally.paid[p] - tally.owed[p];
            const sign = net > 0.5 ? "+" : net < -0.5 ? "−" : "";
            return (
              <div key={p} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white opacity-85" />
                <span className="opacity-85">
                  {p} a payé <strong>{fmt(tally.paid[p])} $</strong>
                </span>
                {Math.abs(net) >= 0.5 && (
                  <span className="opacity-70 text-xs">
                    ({sign}
                    {fmt(Math.abs(net))} $)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Splitwise detail */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} color={T.indigo} />
          <h3 className="m-0 font-serif text-[18px] text-ink">Détail du partage</h3>
        </div>
        <div className="grid gap-[14px] tabi-cardgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {PEOPLE.map((p) => (
            <div
              key={p}
              className="p-4 rounded-[14px] border border-line"
              style={{ background: T.paper }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-[30px] h-[30px] rounded-full grid place-items-center font-bold text-[13px] text-white"
                  style={{ background: PERSON_COLOR[p] }}
                >
                  {p[0]}
                </div>
                <span className="font-bold text-[15px] text-ink">{p}</span>
              </div>
              <div className="text-xs text-ink3">A payé</div>
              <div className="font-serif text-[24px] font-semibold text-ink leading-tight">
                {fmt(tally.paid[p])} $
              </div>
              <div className="text-xs text-ink3 mt-2">Sa part réelle : {fmt(tally.owed[p])} $</div>
            </div>
          ))}
        </div>
        <div className="text-[11.5px] text-ink3 mt-[14px] leading-relaxed">
          Par défaut chaque dépense est <strong>personnelle</strong> (100 % au payeur). Coche «
          Partager 50/50 » à l'ajout pour les dépenses communes.
        </div>
      </Card>

      <div className="grid gap-[22px] tabi-2col" style={{ gridTemplateColumns: "1fr 1.3fr" }}>
        {/* Donut */}
        <Card className="p-7 grid gap-5 justify-items-center">
          <Donut
            size={190}
            stroke={22}
            segments={byCat.length ? byCat : [{ value: 1, color: T.paper2 }]}
            center={
              <div>
                <div className="text-[11px] text-ink3 font-semibold uppercase">Dépensé</div>
                <div
                  className="text-[26px] font-bold font-serif"
                  style={{ color: over ? T.vermilion : T.ink }}
                >
                  {fmt(totalSpent)}$
                </div>
              </div>
            }
          />
          <div className="w-full">
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-ink2">
                Budget {editBudget ? "" : fmt(trip.budget) + " $"}
              </span>
              {!editBudget && (
                <button
                  onClick={() => {
                    setBudgetInput(trip.budget);
                    setEditBudget(true);
                  }}
                  className="bg-transparent border-none text-vermilion text-xs font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Edit3 size={12} /> Modifier
                </button>
              )}
            </div>
            {editBudget ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="flex-1 px-[10px] py-2 rounded-[10px] border border-line text-sm"
                />
                <Btn size="sm" onClick={saveBudget}>
                  <Check size={14} />
                </Btn>
              </div>
            ) : (
              <>
                <Progress
                  value={totalSpent}
                  max={trip.budget}
                  color={over ? T.vermilion : T.matcha}
                  height={10}
                />
                <div className="flex justify-between mt-2 text-[13px]">
                  <span className="text-ink2">Restant</span>
                  <span className="font-bold" style={{ color: over ? T.vermilion : T.matcha }}>
                    {fmt(remaining)} $
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* By category */}
        <Card className="p-6">
          <h3 className="m-0 mb-4 font-serif text-[18px] text-ink">Dépenses par catégorie</h3>
          <div className="grid gap-[14px]">
            {Object.keys(CATS).map((cat) => {
              const v = expenses.filter((e) => e.cat === cat).reduce((s, e) => s + e.amount, 0);
              const C = CATS[cat];
              const maxVal = Math.max(
                ...Object.keys(CATS).map((c) =>
                  expenses.filter((e) => e.cat === c).reduce((s, e) => s + e.amount, 0)
                ),
                1
              );
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <Pill color={C.color} soft={C.soft} icon={C.icon}>
                      {cat}
                    </Pill>
                    <span className="font-semibold text-sm text-ink">{fmt(v)} $</span>
                  </div>
                  <Progress value={v} max={maxVal} color={C.color} height={6} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Expense list */}
      <Card className="p-6">
        <h3 className="m-0 mb-4 font-serif text-[18px] text-ink">Historique ({expenses.length})</h3>
        {expenses.length === 0 ? (
          <Empty icon={Wallet} text="Aucune dépense enregistrée." />
        ) : (
          <div className="grid gap-2">
            {expenses.map((e) => {
              const C = CATS[e.cat] || CATS["Autres"];
              const payer = (PEOPLE as readonly string[]).includes(e.paidBy) ? e.paidBy : PEOPLE[0];
              return (
                <div
                  key={e.id}
                  className="tabi-row flex items-center gap-[14px] px-[14px] py-3 rounded-xl cursor-pointer"
                  style={{ background: T.paper }}
                  onClick={() => openEdit(e)}
                >
                  <div
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={{ background: C.soft, color: C.color }}
                  >
                    <C.icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink">{e.label}</div>
                    <div className="text-xs text-ink3 flex items-center gap-1.5 flex-wrap">
                      <span>
                        {e.cat} ·{" "}
                        {new Date(e.date).toLocaleDateString("fr-CA", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-px rounded-full bg-white border border-line">
                        <span
                          className="w-[7px] h-[7px] rounded-full"
                          style={{ background: PERSON_COLOR[payer] }}
                        />{" "}
                        {payer}
                        {e.split ? " · partagé" : ""}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[15px] text-ink">{fmt(e.amount)} $</span>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (confirm("Supprimer cette dépense ?")) del(e.id);
                    }}
                    className="tabi-del bg-transparent border-none text-ink3 cursor-pointer p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Modifier la dépense" : "Nouvelle dépense"}
        footer={
          <>
            {editingId && (
              <Btn
                variant="ghost"
                onClick={() => {
                  if (confirm("Supprimer cette dépense ?")) {
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
        <Field
          label="Description"
          value={form.label}
          onChange={(v) => setForm({ ...form, label: v })}
          placeholder="ex : Billet Shinkansen Tokyo-Kyoto"
        />
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field
            label="Montant ($)"
            type="number"
            value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })}
            placeholder="0"
          />
          <Field
            label="Catégorie"
            value={form.cat}
            onChange={(v) => setForm({ ...form, cat: v })}
            options={Object.keys(CATS)}
          />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field
            label="Payé par"
            value={form.paidBy}
            onChange={(v) => setForm({ ...form, paidBy: v })}
            options={[...PEOPLE]}
          />
          <Field
            label="Date"
            type="date"
            value={form.date}
            onChange={(v) => setForm({ ...form, date: v })}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-ink2 py-1">
          <input
            type="checkbox"
            checked={form.split}
            onChange={(e) => setForm({ ...form, split: e.target.checked })}
          />
          Partager 50/50 entre Filou et Kathou (sinon : 100 % pour {form.paidBy})
        </label>
      </Modal>
    </div>
  );
}
