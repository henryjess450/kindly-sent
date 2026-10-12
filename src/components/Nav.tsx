import Link from "next/link";
import { site } from "@/config/site";
import { getUser } from "@/lib/session";

export function BrandMark() {
  return (
    <Link href="/" className="brand" aria-label={`${site.name} home`}>
      <span className="brand-seal">K</span>
      {site.name}
    </Link>
  );
}

export async function Nav() {
  const user = await getUser();
  return (
    <header className="nav">
      <div className="nav-inner">
        <BrandMark />
        <nav className="nav-links">
          <Link href="/#cards" className="nav-hide-sm">Cards</Link>
          <Link href="/#how" className="nav-hide-sm">How it works</Link>
          {user ? <Link href="/cards">Your cards</Link> : <Link href="/signin">Sign in</Link>}
          <Link href="/send" className="btn btn-primary btn-small">Send a card</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>© {new Date().getFullYear()} {site.name}. Made in {site.location}.</span>
        <span>
          <Link href="/privacy" className="link" style={{ color: "inherit" }}>Privacy</Link>
          {"  ·  "}
          <a href={`mailto:${site.contactEmail}`} className="link" style={{ color: "inherit" }}>{site.contactEmail}</a>
        </span>
      </div>
    </footer>
  );
}
