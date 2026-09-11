import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BedDouble, Building2, ChevronDown, Heart, MapPin, Menu, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { demoListings } from "./data/demo";
import { fetchListings, type Listing } from "./lib/api";
import { formatPrice } from "./lib/utils";
import "./index.css";

const categories = ["All property types", "Apartment", "House", "Land", "Condominium", "Room", "Commercial"];
const cities = ["All locations", "Yangon", "Mandalay"];

function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false);
  const image = listing.media.find((item) => item.primary)?.url ?? listing.media[0]?.url;
  return (
    <Card className="listing-card">
      <div className="listing-image-wrap">
        <img className="listing-image" src={image} alt={listing.media[0]?.altText ?? listing.title} />
        <div className="image-badges"><span className="pill pill-light">{listing.transactionType === "rent" ? "For rent" : "For sale"}</span>{listing.featured && <span className="pill pill-gold">Featured</span>}</div>
        <button className={`save-button ${saved ? "is-saved" : ""}`} aria-label="Save listing" onClick={() => setSaved(!saved)}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="listing-content">
        <div className="eyebrow">{listing.property.category.name} · {listing.referenceCode}</div>
        <h3>{listing.title}</h3>
        <div className="listing-location"><MapPin size={15} /> {listing.property.location.name}, {listing.property.location.city}</div>
        <div className="listing-stats">
          {listing.property.bedrooms !== null && <span><BedDouble size={16} /> {listing.property.bedrooms} beds</span>}
          {listing.property.floorArea !== null && <span><Building2 size={15} /> {listing.property.floorArea.toLocaleString()} sqft</span>}
        </div>
        <div className="listing-footer"><strong>{formatPrice(listing.price, listing.transactionType)}</strong><button className="text-button">View details <ArrowRight size={15} /></button></div>
      </div>
    </Card>
  );
}

export default function App() {
  const [mode, setMode] = useState<"buy" | "rent">("buy");
  const [city, setCity] = useState("All locations");
  const [category, setCategory] = useState("All property types");
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleListings = useMemo(() => listings.filter((listing) => listing.transactionType === mode || listing.featured), [listings, mode]);

  useEffect(() => {
    const params = { transactionType: mode, city: city === "All locations" ? "" : city.toLowerCase(), category: category === "All property types" ? "" : category.toLowerCase(), pageSize: "12" };
    setLoading(true);
    fetchListings(params).then((result) => setListings(result.data)).catch(() => setListings(demoListings)).finally(() => setLoading(false));
  }, [mode, city, category]);

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="wordmark" href="#top"><span className="wordmark-mark">T</span><span>thiri<span className="wordmark-muted">properties</span></span></a>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"}><a href="#properties">Buy</a><a href="#properties">Rent</a><a href="#how-it-works">Sell with us</a><a href="#about">About</a></nav>
        <div className="nav-actions"><button className="nav-login">Sign in</button><Button size="sm">List your property</Button><button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy"><div className="hero-kicker"><Sparkles size={15} /> A better way to find your place</div><h1>Find a place that feels like <em>home.</em></h1><p>Explore thoughtfully listed homes, land, and spaces across Yangon and Mandalay.</p></div>
          <div className="search-panel">
            <div className="mode-tabs"><button className={mode === "buy" ? "active" : ""} onClick={() => setMode("buy")}>Buy</button><button className={mode === "rent" ? "active" : ""} onClick={() => setMode("rent")}>Rent</button></div>
            <div className="search-fields"><label><span>Location</span><div className="select-wrap"><MapPin size={16} /><select value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div></label><label><span>Property type</span><div className="select-wrap"><Building2 size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div></label><Button size="lg" className="search-button"><Search size={18} /> Search</Button></div>
          </div>
          <div className="hero-note"><ShieldCheck size={16} /> Every listing is reviewed before it goes live</div>
        </section>

        <section className="trust-strip"><div><strong>2,400+</strong><span>properties listed</span></div><div><strong>Yangon · Mandalay</strong><span>and growing every month</span></div><div><strong>100% human-reviewed</strong><span>so you can search with confidence</span></div></section>

        <section className="section" id="properties"><div className="section-heading"><div><div className="section-kicker">Curated for you</div><h2>Places worth looking at</h2><p>Fresh listings from owners and trusted local agents.</p></div><button className="outline-button">See all properties <ArrowRight size={16} /></button></div><div className="listing-grid">{loading ? <div className="loading-state">Finding the right places<span>•••</span></div> : visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div></section>

        <section className="city-section" id="about"><div className="city-copy"><div className="section-kicker">Start local</div><h2>Made for the way Myanmar finds property.</h2><p>Search by the neighborhoods you know, understand the details that matter, and connect directly with the people behind each listing.</p><button className="text-button large">Explore Yangon <ArrowRight size={16} /></button></div><div className="city-cards"><div className="city-card city-yangon"><span>Yangon</span><small>1,640 listings</small></div><div className="city-card city-mandalay"><span>Mandalay</span><small>760 listings</small></div></div></section>

        <section className="how-section" id="how-it-works"><div className="section-kicker">Simple from start to finish</div><h2>A more considered property journey.</h2><div className="steps"><div><span>01</span><h3>Search with clarity</h3><p>Use real neighborhood names and filters that reflect what you actually need.</p></div><div><span>02</span><h3>See the full picture</h3><p>Compare transparent details, photos, amenities, and who you are contacting.</p></div><div><span>03</span><h3>Make a confident move</h3><p>Save your shortlist and reach out directly when something feels right.</p></div></div></section>
      </main>
      <footer className="footer"><div className="wordmark"><span className="wordmark-mark">T</span><span>thiri<span className="wordmark-muted">properties</span></span></div><span>Property search, with a little more care.</span><span>© 2026 Thiri Properties</span></footer>
    </div>
  );
}
