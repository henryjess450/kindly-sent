import { notFound } from "next/navigation";
import { JourneyPreview } from "./JourneyPreview";

// Development only: play the send and receive animations on their own.
export default function Journey() {
  if (process.env.NODE_ENV === "production") notFound();
  return <JourneyPreview />;
}
