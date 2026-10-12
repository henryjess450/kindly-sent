// One place for the brand. Rename the business here.
export const site = {
  name: "Kindly Sent",
  short: "Kindly",
  tagline: "Cards that arrive on the day.",
  description:
    "Write a card today and choose the exact minute it arrives. Birthdays, thank yous and just because, delivered on time, every time.",
  url: (process.env.SITE_URL ?? "http://localhost:3200").replace(/\/$/, ""),
  contactEmail: "hello@kindlysent.ca",
  location: "Victoria, British Columbia",
  limits: {
    messageChars: 1200,
    cardsPerDay: 25,
    maxScheduleYears: 5,
  },
};
