import type { ComponentType, CSSProperties } from "react";

export interface Trip {
  title: string;
  subtitle: string;
  startDate: string;
  budget: number;
  style?: string[];
  pace?: string;
}

export interface City {
  id: string;
  name: string;
  jp: string;
  nights: number;
  season?: string;
  temp?: number;
  lat?: number;
  note?: string;
}

export interface Activity {
  id: string;
  cityId: string;
  title: string;
  cost: number;
  hours: number;
  status: "todo" | "reserved" | "done";
  fav: boolean;
  note?: string;
  photo?: string;
  url?: string;
  day?: number | null;
}

export interface Restaurant {
  id: string;
  cityId: string;
  name: string;
  cuisine?: string;
  budget?: string;
  avg: number;
  note?: string;
  fav?: boolean;
  photo?: string;
  url?: string;
  day?: number | null;
}

export interface Stay {
  id: string;
  cityId: string;
  name: string;
  area?: string;
  price: number;
  dist?: string;
  rating?: number;
  status?: string;
  note?: string;
  photo?: string;
  url?: string;
  day?: number;
  days?: number[];
}

export interface Expense {
  id: string;
  cat: string;
  label: string;
  amount: number;
  date: string;
  paidBy: string;
  split?: boolean | string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  section?: string;
}

export interface NoteItem {
  id: string;
  title?: string;
  date?: string;
  body?: string;
}

export interface Souvenir {
  id: string;
  text: string;
  done: boolean;
  who?: string;
}

export interface AppData {
  trip: Trip;
  cities: City[];
  activities: Activity[];
  restaurants: Restaurant[];
  stays: Stay[];
  expenses: Expense[];
  checklist: ChecklistItem[];
  notes: NoteItem[];
  souvenirs: Souvenir[];
}

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  style?: CSSProperties;
  className?: string;
  [key: string]: unknown;
};

export type IconComponent = ComponentType<IconProps>;

export type CloudStatusState = "checking" | "online" | "offline" | "error";

export interface CloudStatus {
  status: CloudStatusState;
  detail: string;
}

export interface Category {
  label: string;
  icon: IconComponent;
  color: string;
  soft?: string;
}

export interface StatusDef {
  label: string;
  icon: IconComponent;
  color: string;
  soft: string;
}
