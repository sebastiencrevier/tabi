import { useMemo, useState } from "react";
import { ExternalLink } from "../components/ExternalLink";
import { StayAssignRow } from "../components/StayAssignRow";
import { BedDouble, Calendar, Camera, MapPin, Plus, UtensilsCrossed, X } from "../components/icons";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { Empty, SectionTitle } from "../components/ui/index";
import { T } from "../constants";
import { fmt } from "../lib/helpers";
import type { AppData } from "../types";

interface ByDayProps {
  data: AppData;
  set: (d: AppData) => void;
}

interface DayInfo {
  day: number;
  date: Date;
  city: AppData["cities"][0];
  cityIndex: number;
  isFirstInCity: boolean;
  isReturn?: boolean;
}

export function ByDay({ data, set }: ByDayProps) {
  const { trip, cities, activities, restaurants, stays } = data;
  const [selectedDay, setSelectedDay] = useState(1);
  const totalNights = cities.reduce((s, c) => s + c.nights, 0);
  const totalDays = totalNights + 1;

  const dayInfo = useMemo((): DayInfo[] => {
    const start = new Date(trip.startDate + "T00:00");
    const info: DayInfo[] = [];
    let nightCounter = 0;
    cities.forEach((c, ci) => {
      for (let n = 0; n < c.nights; n++) {
        const dt = new Date(start);
        dt.setDate(dt.getDate() + nightCounter);
        info.push({
          day: nightCounter + 1,
          date: dt,
          city: c,
          cityIndex: ci,
          isFirstInCity: n === 0,
        });
        nightCounter++;
      }
    });
    const dtLast = new Date(start);
    dtLast.setDate(dtLast.getDate() + nightCounter);
    info.push({
      day: nightCounter + 1,
      date: dtLast,
      city: cities[cities.length - 1],
      cityIndex: cities.length - 1,
      isFirstInCity: false,
      isReturn: true,
    });
    return info;
  }, [trip.startDate, cities]);

  const current = dayInfo.find((d) => d.day === selectedDay) || dayInfo[0];

  const stayDays = (h: AppData["stays"][0]): number[] =>
    Array.isArray(h.days) ? h.days : h.day ? [h.day] : [];
  const dayActs = activities.filter((a) => a.day === selectedDay);
  const dayRestos = restaurants.filter((r) => r.day === selectedDay);
  const dayStays = stays.filter((h) => stayDays(h).includes(selectedDay));
  const cityActs = activities.filter((a) => a.cityId === current?.city.id && !a.day);
  const cityRestos = restaurants.filter((r) => r.cityId === current?.city.id && !r.day);
  const cityStays = stays.filter(
    (h) => h.cityId === current?.city.id && !stayDays(h).includes(selectedDay)
  );

  const assignActivity = (id: string) =>
    set({
      ...data,
      activities: activities.map((a) => (a.id === id ? { ...a, day: selectedDay } : a)),
    });
  const unassignActivity = (id: string) =>
    set({
      ...data,
      activities: activities.map((a) => (a.id === id ? { ...a, day: undefined } : a)),
    });
  const assignResto = (id: string) =>
    set({
      ...data,
      restaurants: restaurants.map((r) => (r.id === id ? { ...r, day: selectedDay } : r)),
    });
  const unassignResto = (id: string) =>
    set({
      ...data,
      restaurants: restaurants.map((r) => (r.id === id ? { ...r, day: undefined } : r)),
    });
  const assignStay = (id: string, nbNights = 1) => {
    const target = stays.find((h) => h.id === id);
    if (!target) return;
    const existing = stayDays(target);
    const toAdd: number[] = [];
    for (let i = 0; i < nbNights; i++) {
      const d = selectedDay + i;
      if (!existing.includes(d) && d <= totalDays) toAdd.push(d);
    }
    const newDays = [...existing, ...toAdd].sort((a, b) => a - b);
    set({
      ...data,
      stays: stays.map((h) => (h.id === id ? { ...h, days: newDays, day: undefined } : h)),
    });
  };
  const unassignStay = (id: string) => {
    const target = stays.find((h) => h.id === id);
    if (!target) return;
    const newDays = stayDays(target).filter((d) => d !== selectedDay);
    set({
      ...data,
      stays: stays.map((h) => (h.id === id ? { ...h, days: newDays, day: undefined } : h)),
    });
  };

  if (!current)
    return (
      <Empty
        icon={Calendar}
        text="Aucune journée à afficher. Définis ta date de départ et tes villes d'abord."
      />
    );

  return (
    <div className="grid gap-[22px]">
      <SectionTitle
        kicker="Déroulé"
        title="Par jour"
        sub={`${totalDays} journées · clique sur un jour pour voir ce qui s'y passe`}
      />

      {/* Day selector */}
      <Card style={{ padding: 14, overflow: "hidden" }}>
        <div
          className="flex gap-[6px] overflow-x-auto pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {dayInfo.map((d) => {
            const active = d.day === selectedDay;
            const cityChange = d.isFirstInCity || d.isReturn;
            return (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d.day)}
                className="shrink-0 min-w-[64px] px-2 py-[10px] rounded-[12px] border-none cursor-pointer font-sans text-center transition-all"
                style={{
                  background: active ? T.ink : cityChange ? T.vermSoft : T.paper2,
                  color: active ? "#fff" : cityChange ? T.vermilion : T.ink2,
                  boxShadow: active ? T.shadowMd : "none",
                }}
              >
                <div className="text-[10px] font-semibold opacity-80 uppercase tracking-[0.5px]">
                  Jour
                </div>
                <div className="text-[18px] font-bold font-serif leading-none">{d.day}</div>
                <div className="text-[10px] mt-1 opacity-85">
                  {d.date.toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}
                </div>
                {cityChange && (
                  <div className="text-[9px] mt-0.5 font-semibold">
                    {d.isReturn ? "Retour" : d.city.name}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected day header */}
      <Card
        style={{
          padding: 22,
          background: `linear-gradient(135deg, ${T.card} 0%, ${current.cityIndex % 2 ? T.indigoSoft : T.vermSoft} 130%)`,
        }}
      >
        <div
          className="text-[12px] font-bold tracking-[1.5px] uppercase mb-1"
          style={{ color: T.vermilion }}
        >
          Jour {current.day} {current.isReturn ? "— Départ" : ""}
        </div>
        <h2 className="m-0 font-serif text-[28px] text-ink tracking-[-0.5px]">
          {current.date.toLocaleDateString("fr-CA", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>
        <div className="text-[14px] text-ink2 mt-1.5 flex items-center gap-1.5">
          <MapPin size={14} color={T.vermilion} /> {current.city.name}{" "}
          <span className="text-ink3">{current.city.jp}</span>
        </div>
      </Card>

      {/* Accommodation */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <BedDouble size={18} color={T.matcha} />
          <h3 className="m-0 font-serif text-[17px] text-ink">Hébergement de la nuit</h3>
        </div>
        {dayStays.length > 0 ? (
          <div className="grid gap-2">
            {dayStays.map((h) => {
              const nights = stayDays(h);
              const sorted = [...nights].sort((a, b) => a - b);
              const isRange = sorted.length > 1;
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-3.5 p-3 rounded-[12px]"
                  style={{ background: T.paper }}
                >
                  {h.photo && (
                    <img
                      src={h.photo}
                      alt=""
                      className="w-14 h-14 rounded-[10px] object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] text-ink">{h.name}</div>
                    <div className="text-[12px] text-ink3">
                      {h.area} · {fmt(h.price)} $/nuit
                      {isRange
                        ? ` · ${nights.length} nuits (J${sorted[0]} → J${sorted[sorted.length - 1]})`
                        : ""}
                    </div>
                    {h.url && (
                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink url={h.url} label="Voir / réserver" />
                      </div>
                    )}
                  </div>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => unassignStay(h.id)}
                    title="Retirer de cette nuit"
                  >
                    <X size={14} />
                  </Btn>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[13px] text-ink3 mb-2.5">Aucun hébergement assigné à ce jour.</div>
        )}
        {cityStays.length > 0 && (
          <div className="grid gap-1.5 mt-3.5">
            <div className="text-[11px] font-semibold text-ink3 uppercase tracking-[0.5px]">
              {dayStays.length > 0
                ? "Ajouter un autre hôtel"
                : "Hôtels disponibles à " + current.city.name}
            </div>
            {cityStays.map((h) => (
              <StayAssignRow
                key={h.id}
                stay={h}
                maxNights={totalDays - selectedDay + 1}
                onAssign={(n) => assignStay(h.id, n)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Activities */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Camera size={18} color={T.gold} />
          <h3 className="m-0 font-serif text-[17px] text-ink">
            Activités du jour ({dayActs.length})
          </h3>
        </div>
        {dayActs.length > 0 && (
          <div className="grid gap-2 mb-3.5">
            {dayActs.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-[12px]"
                style={{ background: T.paper }}
              >
                {a.photo && (
                  <img
                    src={a.photo}
                    alt=""
                    className="w-12 h-12 rounded-[9px] object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-ink">{a.title}</div>
                  <div className="text-[12px] text-ink3">
                    {a.hours ? a.hours + "h · " : ""}
                    {a.cost ? fmt(a.cost) + " $" : "Gratuit"}
                    {a.url ? " · " : ""}
                    {a.url && <ExternalLink url={a.url} label="lien" />}
                  </div>
                </div>
                <button
                  onClick={() => unassignActivity(a.id)}
                  className="bg-transparent border-none text-ink3 cursor-pointer p-1"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        {cityActs.length > 0 ? (
          <div className="grid gap-1.5">
            <div className="text-[11px] font-semibold text-ink3 uppercase tracking-[0.5px]">
              À assigner à ce jour (à {current.city.name})
            </div>
            {cityActs.map((a) => (
              <button
                key={a.id}
                onClick={() => assignActivity(a.id)}
                className="flex items-center gap-2.5 p-2.5 border border-dashed border-line rounded-[10px] cursor-pointer text-left font-sans"
                style={{ background: T.paper }}
              >
                <Plus size={14} color={T.gold} />
                <span className="flex-1 text-[14px] text-ink">{a.title}</span>
                <span className="text-[12px] text-ink3">{a.hours}h</span>
              </button>
            ))}
          </div>
        ) : (
          dayActs.length === 0 && (
            <div className="text-[13px] text-ink3">
              Aucune activité prévue. Ajoute-en dans l'onglet « Activités ».
            </div>
          )
        )}
      </Card>

      {/* Restaurants */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <UtensilsCrossed size={18} color={T.vermilion} />
          <h3 className="m-0 font-serif text-[17px] text-ink">
            Restaurants du jour ({dayRestos.length})
          </h3>
        </div>
        {dayRestos.length > 0 && (
          <div className="grid gap-2 mb-3.5">
            {dayRestos.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-[12px]"
                style={{ background: T.paper }}
              >
                {r.photo && (
                  <img
                    src={r.photo}
                    alt=""
                    className="w-12 h-12 rounded-[9px] object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-ink">{r.name}</div>
                  <div className="text-[12px] text-ink3">
                    {r.cuisine} · {fmt(r.avg ?? 0)} $
                  </div>
                </div>
                <button
                  onClick={() => unassignResto(r.id)}
                  className="bg-transparent border-none text-ink3 cursor-pointer p-1"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        {cityRestos.length > 0 ? (
          <div className="grid gap-1.5">
            <div className="text-[11px] font-semibold text-ink3 uppercase tracking-[0.5px]">
              À assigner à ce jour (à {current.city.name})
            </div>
            {cityRestos.map((r) => (
              <button
                key={r.id}
                onClick={() => assignResto(r.id)}
                className="flex items-center gap-2.5 p-2.5 border border-dashed border-line rounded-[10px] cursor-pointer text-left font-sans"
                style={{ background: T.paper }}
              >
                <Plus size={14} color={T.vermilion} />
                <span className="flex-1 text-[14px] text-ink">{r.name}</span>
                <span className="text-[12px] text-ink3">{r.cuisine}</span>
              </button>
            ))}
          </div>
        ) : (
          dayRestos.length === 0 && (
            <div className="text-[13px] text-ink3">
              Aucun restaurant prévu. Ajoute-en dans l'onglet « Restaurants ».
            </div>
          )
        )}
      </Card>
    </div>
  );
}
