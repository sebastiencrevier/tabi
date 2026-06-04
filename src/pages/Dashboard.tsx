import { useState, useMemo } from "react";
import { ArrowRight, Calendar, Edit3, Quote, Star, TrendingUp, Wallet } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Field, Modal, Pill } from "../components/ui/index";
import { QUOTES, STATUS, T } from "../constants";
import { fmt } from "../lib/helpers";
import type { AppData } from "../types";
import type { IconComponent } from "../components/icons";

interface DashboardProps {
  data: AppData;
  set: (d: AppData) => void;
  daysLeft: number;
  totalSpent: number;
  setPage: (p: string) => void;
}

function StatCard({
  label,
  value,
  sub,
  color,
  Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  Icon: IconComponent;
}) {
  return (
    <Card className="p-[22px]" hover>
      <div className="flex justify-between items-start">
        <div className="text-xs font-semibold text-ink3 uppercase tracking-[0.8px]">{label}</div>
        <div
          className="w-[34px] h-[34px] rounded-[10px] grid place-items-center"
          style={{ background: color + "18", color }}
        >
          <Icon size={17} strokeWidth={2.2} />
        </div>
      </div>
      <div className="text-[30px] font-bold text-ink mt-3 font-serif tracking-[-1px]">{value}</div>
      {sub && <div className="text-[13px] text-ink2 mt-0.5">{sub}</div>}
    </Card>
  );
}

export function Dashboard({ data, set, daysLeft, totalSpent, setPage }: DashboardProps) {
  const { trip, cities, activities } = data;
  const remaining = trip.budget - totalSpent;
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);
  const upcoming = activities.filter((a) => a.status !== "done").slice(0, 4);
  const quote = QUOTES[Math.abs(daysLeft) % QUOTES.length];
  const pctSpent = trip.budget ? (totalSpent / trip.budget) * 100 : 0;

  const [editTrip, setEditTrip] = useState(false);
  const [tripForm, setTripForm] = useState({
    title: trip.title,
    subtitle: trip.subtitle,
    startDate: trip.startDate,
  });
  const openEdit = () => {
    setTripForm({ title: trip.title, subtitle: trip.subtitle, startDate: trip.startDate });
    setEditTrip(true);
  };
  const saveTrip = () => {
    set({ ...data, trip: { ...trip, ...tripForm } });
    setEditTrip(false);
  };

  return (
    <div className="grid gap-[22px]">
      {/* Hero */}
      <Card style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        <div
          className="relative overflow-hidden px-[34px] py-[38px] text-white"
          style={{
            background: `linear-gradient(135deg, ${T.ink} 0%, #2C2925 55%, ${T.indigo} 130%)`,
          }}
        >
          <div className="absolute right-[-30px] top-[-40px] text-[220px] font-serif leading-none select-none opacity-[0.06]">
            旅
          </div>
          <button
            onClick={openEdit}
            title="Modifier le voyage"
            className="absolute right-[18px] top-[18px] z-[2] inline-flex items-center gap-1.5 border border-white/20 text-white rounded-full px-[13px] py-[7px] text-[13px] font-semibold cursor-pointer font-sans"
            style={{ background: "rgba(255,255,255,.14)", backdropFilter: "blur(4px)" }}
          >
            <Edit3 size={14} /> Modifier
          </button>
          <div
            className="text-[13px] font-semibold tracking-[2px] uppercase mb-2.5"
            style={{ color: "#E8B4AE" }}
          >
            Voyage à venir
          </div>
          <h1 className="m-0 font-serif font-semibold text-[44px] tracking-[-1px]">
            {trip.title} <span className="opacity-50 text-[30px]">日本</span>
          </h1>
          <p className="mt-2 mb-[22px] opacity-80 text-[15px]">
            {trip.subtitle} · {totalNights} nuits · {cities.length} villes
          </p>
          <div className="flex gap-7 flex-wrap">
            <div>
              <div className="text-[40px] font-bold font-serif leading-none">
                {daysLeft > 0 ? daysLeft : 0}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {daysLeft > 0 ? "jours avant le départ" : "en voyage !"}
              </div>
            </div>
            <div className="w-px" style={{ background: "rgba(255,255,255,.15)" }} />
            <button
              onClick={openEdit}
              className="bg-transparent border-0 p-0 text-left cursor-pointer text-white font-sans"
            >
              <div className="text-[40px] font-bold font-serif leading-none flex items-center gap-2">
                {new Date(trip.startDate + "T00:00").toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "short",
                })}
                <Edit3 size={15} style={{ opacity: 0.55 }} />
              </div>
              <div className="text-xs opacity-70 mt-1">
                date de départ · {new Date(trip.startDate + "T00:00").getFullYear()}
              </div>
            </button>
          </div>
        </div>
      </Card>

      <Modal
        open={editTrip}
        onClose={() => setEditTrip(false)}
        title="Modifier le voyage"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setEditTrip(false)}>
              Annuler
            </Btn>
            <Btn variant="accent" onClick={saveTrip}>
              Enregistrer
            </Btn>
          </>
        }
      >
        <Field
          label="Date de départ"
          type="date"
          value={tripForm.startDate}
          onChange={(v) => setTripForm({ ...tripForm, startDate: v })}
        />
        <Field
          label="Titre du voyage"
          value={tripForm.title}
          onChange={(v) => setTripForm({ ...tripForm, title: v })}
          placeholder="ex : Japon"
        />
        <Field
          label="Sous-titre"
          value={tripForm.subtitle}
          onChange={(v) => setTripForm({ ...tripForm, subtitle: v })}
          placeholder="ex : Trois semaines"
        />
        <div className="text-xs text-ink3 leading-relaxed bg-paper px-3 py-2.5 rounded-[10px]">
          La date de départ met à jour le compte à rebours et toutes les dates de l'itinéraire
          automatiquement.
        </div>
      </Modal>

      {/* Stats */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        <StatCard
          label="Budget total"
          value={fmt(trip.budget) + " $"}
          sub="défini pour le séjour"
          color={T.gold}
          Icon={Wallet}
        />
        <StatCard
          label="Dépensé"
          value={fmt(totalSpent) + " $"}
          sub={`${Math.round(pctSpent)}% du budget`}
          color={T.vermilion}
          Icon={TrendingUp}
        />
        <StatCard
          label="Restant"
          value={fmt(remaining) + " $"}
          sub={remaining < 0 ? "dépassement !" : "à dépenser"}
          color={remaining < 0 ? T.vermilion : T.matcha}
          Icon={Wallet}
        />
        <StatCard
          label="Par jour"
          value={fmt(remaining > 0 ? remaining / Math.max(totalNights, 1) : 0) + " $"}
          sub="budget journalier restant"
          color={T.indigo}
          Icon={Calendar}
        />
      </div>

      <div className="grid gap-[22px] tabi-2col" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        {/* Timeline */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-[18px]">
            <h3 className="m-0 font-serif text-[18px] text-ink">Timeline du voyage</h3>
            <Btn variant="ghost" size="sm" onClick={() => setPage("itinerary")}>
              Détails <ArrowRight size={14} />
            </Btn>
          </div>
          <div className="grid gap-0.5">
            {cities.map((c, i) => (
              <div key={c.id} className="flex gap-[14px] items-stretch">
                <div className="flex flex-col items-center">
                  <div
                    className="w-[11px] h-[11px] rounded-full mt-1 shrink-0"
                    style={{ background: T.vermilion, boxShadow: `0 0 0 4px ${T.vermSoft}` }}
                  />
                  {i < cities.length - 1 && (
                    <div className="w-0.5 flex-1 my-0.5" style={{ background: T.line }} />
                  )}
                </div>
                <div className="pb-[18px] flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-ink text-[15px]">
                      {c.name} <span className="text-ink3 font-normal text-[13px]">{c.jp}</span>
                    </span>
                    <Pill color={T.indigo} soft={T.indigoSoft}>
                      {c.nights} {c.nights > 1 ? "nuits" : "nuit"}
                    </Pill>
                  </div>
                  <div className="text-[13px] text-ink2 mt-0.5">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="grid gap-[22px] content-start">
          <Card className="p-6">
            <h3 className="m-0 mb-4 font-serif text-[18px] text-ink">Prochaines activités</h3>
            <div className="grid gap-2.5">
              {upcoming.map((a) => {
                const city = cities.find((c) => c.id === a.cityId);
                const st = STATUS[a.status];
                return (
                  <div
                    key={a.id}
                    className="flex gap-3 items-center px-3 py-2.5 rounded-xl"
                    style={{ background: T.paper }}
                  >
                    <div style={{ color: st.color }}>
                      <st.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-ink truncate">{a.title}</div>
                      <div className="text-xs text-ink3">
                        {city?.name} · {a.hours}h
                      </div>
                    </div>
                    {a.fav && <Star size={15} fill={T.gold} stroke={T.gold} />}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            className="p-6"
            style={{ background: `linear-gradient(160deg, ${T.paper} 0%, ${T.goldSoft} 120%)` }}
          >
            <Quote size={22} color={T.gold} style={{ marginBottom: 10 }} />
            <div className="font-serif text-[26px] text-ink leading-tight">{quote.jp}</div>
            <div className="text-[13px] text-ink3 italic my-1">{quote.romaji}</div>
            <div className="text-sm text-ink2 leading-relaxed">« {quote.fr} »</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
