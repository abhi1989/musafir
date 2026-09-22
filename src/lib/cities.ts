export const CITIES = [
  "Dharamshala",
  "McLeod Ganj",
  "Dharamkot",
  "Manali",
  "Old Manali",
  "Shimla",
  "Rishikesh",
  "Mussoorie",
  "Other",
] as const;

export type City = (typeof CITIES)[number];