
import { Style } from "./StyleFilterButton";

export type EventType = "birthday" | "dateNight" | "party" | "workEvent" | "weekend" | null;
export type EventStylesRecord = Record<Exclude<EventType, null>, Style[]>;

export const EVENT_TO_STYLES: EventStylesRecord = {
  birthday: ["classic"],
  dateNight: ["romantic"],
  party: ["romantic", "boohoo", "minimalist"],
  workEvent: ["classic", "minimalist", "classic"],
  weekend: ["casual", "sporty", "minimalist"] // NEW!
};

export const EVENT_ICONS = {
  birthday: "🎂",
  dateNight: "💑",
  party: "🎉",
  workEvent: "💼",
  weekend: "🏖️", // NEW!
} as const;
