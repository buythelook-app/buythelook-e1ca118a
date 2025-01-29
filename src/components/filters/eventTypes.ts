import { Style } from "./StyleFilterButton";

export type EventType = "birthday" | "dateNight" | "party" | "workEvent" | null;
export type EventStylesRecord = Record<Exclude<EventType, null>, Style[]>;

export const EVENT_TO_STYLES: EventStylesRecord = {
  birthday: ["classic"],
  dateNight: ["romantic"],
  party: ["romantic", "boohoo", "minimalist"],
  workEvent: ["classic", "minimalist", "classic"],
};

export const EVENT_ICONS = {
  birthday: "🎂",
  dateNight: "💑",
  party: "🎉",
  workEvent: "💼",
} as const;