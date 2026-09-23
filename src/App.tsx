import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BedDouble, Building2, ChevronDown, Heart, MapPin, Menu, Moon, Search, ShieldCheck, Sparkles, Sun, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dashboard } from "./components/Dashboard";
import { ListingForm } from "./components/ListingForm";
import { PropertyDetail } from "./components/PropertyDetail";
import { demoListings } from "./data/demo";
import { fetchListings, login, type AuthUser, type Listing } from "./lib/api";
import { formatPrice } from "./lib/utils";
import { useLanguage } from "./lib/i18n";
import "./index.css";

const categories = ["All property types", "Apartment", "House", "Land", "Condominium", "Room", "Commercial"];
const cities = ["All locations", "Yangon", "Mandalay"];
const demoAccounts = [
  { label: "Buyer / renter", email: "demo19@property-portal.local" },
  { label: "Owner", email: "demo9@property-portal.local" },
  { label: "Agent", email: "demo1@property-portal.local" },
  { label: "Staff", email: "demo17@property-portal.local" },
  { label: "Admin", email: "demo18@property-portal.local" },
];

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("property-portal-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: (listing: Listing) => void }) {
  const { t, language } = useLanguage();
  const [saved, setSaved] = useState(false);
  const image = listing.media.find((item) => item.primary)?.url ?? listing.media[0]?.url;
  return (
    <Card className="listing-card">
      <div className="listing-image-wrap">
        <img className="listing-image" src={image} alt={listing.media[0]?.altText ?? listing.title} />
        <div className="image-badges"><span className="pill pill-light">{listing.transactionType === "rent" ? t("forRent") : t("forSale")}</span>{listing.featured && <span className="pill pill-gold">{t("featured")}</span>}</div>
        <button className={`save-button ${saved ? "is-saved" : ""}`} aria-label={saved ? t("savedListing") : t("saveListing")} title={saved ? t("savedListing") : t("saveListing")} onClick={() => setSaved(!saved)}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="listing-content">
        <div className="eyebrow">{listing.property.category.name} · {listing.referenceCode}</div>
        <h3>{listing.title}</h3>
        <div className="listing-location"><MapPin size={15} /> {listing.property.location.name}, {listing.property.location.city}</div>
        <div className="listing-stats">
          {listing.property.bedrooms !== null && <span><BedDouble size={16} /> {listing.property.bedrooms} {t("beds")}</span>}
          {listing.property.floorArea !== null && <span><Building2 size={15} /> {listing.property.floorArea.toLocaleString(language === "my" ? "my-MM" : "en-US")} sqft</span>}
        </div>
        <div className="listing-footer"><strong>{formatPrice(listing.price, listing.transactionType)}</strong><button className="text-button" onClick={() => onOpen(listing)}>{t("viewDetails")} <ArrowRight size={15} /></button></div>
      </div>
    </Card>
  );
}

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mode, setMode] = useState<"buy" | "rent">("buy");
  const [city, setCity] = useState("All locations");
  const [category, setCategory] = useState("All property types");
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"home" | "dashboard" | "create" | "detail">("home");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(demoAccounts[0]);
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cached = localStorage.getItem("property-portal-user");
    return cached ? JSON.parse(cached) as AuthUser : null;
  });
  const [authError, setAuthError] = useState("");
  const visibleListings = useMemo(() => listings.filter((listing) => listing.transactionType === mode || listing.featured), [listings, mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("property-portal-theme", theme);
  }, [theme]);

  useEffect(() => {
    const params = { transactionType: mode, city: city === "All locations" ? "" : city.toLowerCase(), category: category === "All property types" ? "" : category.toLowerCase(), pageSize: "12" };
    setLoading(true);
    fetchListings(params).then((result) => setListings(result.data)).catch(() => setListings(demoListings)).finally(() => setLoading(false));
  }, [mode, city, category]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    try {
      const session = await login(selectedAccount.email, "demo-password");
      localStorage.setItem("property-portal-token", session.token);
      localStorage.setItem("property-portal-user", JSON.stringify(session.user));
      setUser(session.user);
      setSignInOpen(false);
      setView("dashboard");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t("unableSignIn"));
    }
  }

  function signOut() {
    localStorage.removeItem("property-portal-token");
    localStorage.removeItem("property-portal-user");
    setUser(null);
    setView("home");
  }

  function openListing(listing: Listing) {
    setSelectedListing(listing);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="wordmark" href="#top"><span className="wordmark-mark">T</span><span>thiri<span className="wordmark-muted">properties</span></span></a>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"}><a href="#properties">{t("buy")}</a><a href="#properties">{t("rent")}</a><a href="#how-it-works">{t("sellWithUs")}</a><a href="#about">{t("about")}</a></nav>
        <div className="nav-actions">{user ? <div className="user-menu"><span className="user-avatar">{user.displayName.slice(0, 1)}</span><span className="user-role">{user.displayName}<small>{user.role === "buyer_renter" ? t("roleBuyer") : t(user.role === "owner" ? "roleOwner" : user.role === "agent" ? "roleAgent" : user.role === "staff" ? "roleStaff" : "roleAdmin")}</small></span><button className="nav-login" onClick={() => setView("dashboard")}>{t("dashboard")}</button><button className="nav-login" onClick={signOut}>{t("signOut")}</button></div> : <button className="nav-login" onClick={() => setSignInOpen(true)}>{t("signIn")}</button>}<label className="language-select"><span className="sr-only">{t("language")}</span><select aria-label={t("language")} value={language} onChange={(event) => setLanguage(event.target.value as "en" | "my")}><option value="en">EN</option><option value="my">မြန်မာ</option></select></label><button className="theme-toggle" type="button" aria-label={t("themeMode")} title={t("themeMode")} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button><Button size="sm" onClick={() => user && ["owner", "agent"].includes(user.role) ? setView("create") : setSignInOpen(true)}>{t("listProperty")}</Button><button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </header>

      <main id="top">
        {view === "home" ? <>
        <section className="hero">
          <div className="hero-copy"><div className="hero-kicker"><Sparkles size={15} /> {t("heroKicker")}</div><h1>{t("heroTitle")} <em>{language === "my" ? "အိမ်။" : "home."}</em></h1><p>{t("heroDescription")}</p></div>
          <div className="search-panel">
            <div className="mode-tabs"><button className={mode === "buy" ? "active" : ""} onClick={() => setMode("buy")}>{t("buy")}</button><button className={mode === "rent" ? "active" : ""} onClick={() => setMode("rent")}>{t("rent")}</button></div>
            <div className="search-fields"><label><span>{t("location")}</span><div className="select-wrap"><MapPin size={16} /><select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item} value={item}>{item === "All locations" ? t("allLocations") : item}</option>)}</select><ChevronDown size={15} /></div></label><label><span>{t("propertyType")}</span><div className="select-wrap"><Building2 size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item === "All property types" ? t("allPropertyTypes") : t(item.toLowerCase() as "apartment" | "house" | "land" | "condominium" | "room" | "commercial")}</option>)}</select><ChevronDown size={15} /></div></label><Button size="lg" className="search-button"><Search size={18} /> {t("search")}</Button></div>
          </div>
          <div className="hero-note"><ShieldCheck size={16} /> {t("reviewedListings")}</div>
        </section>

        <section className="trust-strip"><div><strong>2,400+</strong><span>{t("propertiesListed")}</span></div><div><strong>Yangon · Mandalay</strong><span>{t("growingMonthly")}</span></div><div><strong>{t("humanReviewed")}</strong><span>{t("searchConfidence")}</span></div></section>

        <section className="section" id="properties"><div className="section-heading"><div><div className="section-kicker">{t("curatedForYou")}</div><h2>{t("placesWorthLooking")}</h2><p>{t("freshListings")}</p></div><button className="outline-button">{t("seeAll")} <ArrowRight size={16} /></button></div><div className="listing-grid">{loading ? <div className="loading-state">{t("findingPlaces")}<span>•••</span></div> : visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} onOpen={openListing} />)}</div></section>

        <section className="city-section" id="about"><div className="city-copy"><div className="section-kicker">{t("startLocal")}</div><h2>{t("madeForMyanmar")}</h2><p>{t("cityDescription")}</p><button className="text-button large">{t("exploreYangon")} <ArrowRight size={16} /></button></div><div className="city-cards"><div className="city-card city-yangon"><span>Yangon</span><small>1,640 {t("listings")}</small></div><div className="city-card city-mandalay"><span>Mandalay</span><small>760 {t("listings")}</small></div></div></section>

        <section className="how-section" id="how-it-works"><div className="section-kicker">{t("simpleStart")}</div><h2>{t("journeyTitle")}</h2><div className="steps"><div><span>01</span><h3>{t("searchClearly")}</h3><p>{t("searchClearlyText")}</p></div><div><span>02</span><h3>{t("seeFullPicture")}</h3><p>{t("seeFullPictureText")}</p></div><div><span>03</span><h3>{t("confidentMove")}</h3><p>{t("confidentMoveText")}</p></div></div></section>
        </> : view === "detail" && selectedListing ? <PropertyDetail listing={selectedListing} user={user} onBack={() => setView("home")} onSignIn={() => setSignInOpen(true)} /> : view === "create" && user ? <ListingForm onBack={() => setView("dashboard")} onCreated={() => setView("dashboard")} /> : view === "dashboard" && user ? <Dashboard user={user} onAddProperty={() => setView("create")} onBack={() => setView("home")} /> : null}
      </main>
      {signInOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSignInOpen(false)}><div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="sign-in-title"><button className="modal-close" onClick={() => setSignInOpen(false)} aria-label={t("closeSignIn")}><X size={18} /></button><div className="section-kicker">{t("demoAccess")}</div><h2 id="sign-in-title">{t("signInTitle")}</h2><p className="modal-intro">{t("signInIntro")} <code>demo-password</code>.</p><form onSubmit={handleSignIn}><label>{t("testAccount")}<select value={selectedAccount.email} onChange={(event) => setSelectedAccount(demoAccounts.find((account) => account.email === event.target.value) ?? demoAccounts[0])}>{demoAccounts.map((account) => <option key={account.email} value={account.email}>{t(account.label === "Buyer / renter" ? "buyerRenter" : account.label.toLowerCase() as "owner" | "agent" | "staff" | "admin")} — {account.email}</option>)}</select></label><div className="auth-preview"><strong>{t(selectedAccount.label === "Buyer / renter" ? "buyerRenter" : selectedAccount.label.toLowerCase() as "owner" | "agent" | "staff" | "admin")}</strong><span>{selectedAccount.email}</span></div>{authError && <div className="auth-error">{authError}</div>}<Button size="lg" className="full-button" type="submit">{t("continueAs")} {t(selectedAccount.label === "Buyer / renter" ? "buyerRenter" : selectedAccount.label.toLowerCase() as "owner" | "agent" | "staff" | "admin")}</Button></form></div></div>}
      <footer className="footer"><div className="wordmark"><span className="wordmark-mark">T</span><span>thiri<span className="wordmark-muted">properties</span></span></div><span>{t("footerTagline")}</span><span>© 2026 Thiri Properties</span></footer>
    </div>
  );
}
