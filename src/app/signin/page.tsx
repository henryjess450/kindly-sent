import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { SignInForm } from "./SignInForm";
import { getUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ expired?: string; next?: string }> }) {
  const { expired, next: raw } = await searchParams;
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;
  if (await getUser()) redirect(next ?? "/cards");
  return (
    <>
      <Nav />
      <main style={{ minHeight: "calc(100vh - 52px)", display: "grid", placeItems: "center", padding: "40px 22px", background: "var(--bg-alt)" }}>
        <SignInForm expired={!!expired} next={next} />
      </main>
    </>
  );
}
