/** "Love, Henry" -> "Henry", for subject lines, seals and "From ..." labels. */
export const plainName = (signOff: string) =>
  signOff.trim().replace(/^(with love|lots of love|love|from|xo+|xoxo|cheers|best|yours|hugs|warmly|sincerely)[,!.\s]+/i, "").trim() || signOff.trim();

export const sealLetter = (signOff: string) => (plainName(signOff)[0] ?? "K").toUpperCase();
