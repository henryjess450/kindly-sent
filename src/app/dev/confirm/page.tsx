import { notFound } from "next/navigation";
import { ConfirmPreview } from "./ConfirmPreview";

// Development only: compare the payment-confirmed animations.
export default function Confirm() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ConfirmPreview />;
}
