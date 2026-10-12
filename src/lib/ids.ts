import { createHash, randomBytes } from "node:crypto";

export const newId = () => randomBytes(12).toString("base64url");
export const newToken = () => randomBytes(24).toString("base64url");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
