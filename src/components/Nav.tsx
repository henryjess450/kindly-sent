import Link from "next/link";
import { site } from "@/config/site";
import { getUser, isAdmin } from "@/lib/session";
import { getCartId } from "@/lib/cart";
import { cartCount } from "@/lib/groups";

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
  const inCart = cartCount(await getCartId());
  return (
    <header className="nav">
      <div className="nav-inner">
        <BrandMark />
        <nav className="nav-links">
          <Link href="/#cards" className="nav-hide-sm">Cards</Link>
          <Link href="/#how" className="nav-hide-sm">How it works</Link>
          <Link href="/group">Group cards</Link>
          {inCart > 0 && (
            <Link href="/cart" className="nav-cart" aria-label={`Cart, ${inCart} ${inCart === 1 ? "card" : "cards"}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="19" r="1.4" fill="currentColor" /><circle cx="17" cy="19" r="1.4" fill="currentColor" /></svg>
              <span>{inCart}</span>
            </Link>
          )}
          {isAdmin(user) && <Link href="/admin" className="nav-hide-sm">Admin</Link>}
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
