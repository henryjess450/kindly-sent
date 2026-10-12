import type { ArtMap } from "./kit";
import { ART as school } from "./school";
import { ART as family } from "./family";
import { ART as care } from "./care";
import { ART as celebrate } from "./celebrate";
import { ART as milestones } from "./milestones";
import { ART as seasons } from "./seasons";

export const EXTRA_ART: ArtMap = { ...school, ...family, ...care, ...celebrate, ...milestones, ...seasons };
