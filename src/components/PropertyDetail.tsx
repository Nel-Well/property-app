import { useState, type FormEvent } from "react";
import { ArrowLeft, BedDouble, Building2, Check, Heart, MapPin, Send, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { submitInquiry, saveListing, type AuthUser, type Listing } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { useLanguage } from "../lib/i18n";

type Props = { listing: Listing; user: AuthUser | null; onBack: () => void; onSignIn: () => void };

export function PropertyDetail({ listing, user, onBack, onSignIn }: Props) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState(t("inquiryDefault"));
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const image = listing.media.find((item) => item.primary)?.url ?? listing.media[0]?.url;

  async function handleSave() {
    if (!user) { onSignIn(); return; }
    try { await saveListing(listing.id, !saved); setSaved(!saved); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : t("unableSave")); }
  }

  async function handleInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) { onSignIn(); return; }
    try { await submitInquiry(listing.id, message); setSent(true); setError(""); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : t("unableInquiry")); }
  }

  return <section className="detail-page">
    <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> {t("backProperties")}</button>
    <div className="detail-layout">
      <div>
        <div className="detail-hero"><img src={image} alt={listing.title} /><div className="detail-badges"><span className="pill pill-light">{listing.transactionType === "rent" ? t("forRent") : t("forSale")}</span>{listing.featured && <span className="pill pill-gold">{t("featured")}</span>}</div></div>
        <div className="detail-thumbs">{listing.media.slice(0, 4).map((media) => <img key={media.url} src={media.url} alt={media.altText ?? listing.title} />)}</div>
        <div className="detail-copy"><div className="eyebrow">{listing.property.category.name} · {listing.referenceCode}</div><h1>{listing.title}</h1><div className="listing-location"><MapPin size={16} /> {listing.property.location.name}, {listing.property.location.city}</div><p>{listing.description}</p></div>
        <div className="detail-facts"><div><span>{t("propertyFacts")}</span><strong>{listing.property.category.name}</strong></div>{listing.property.bedrooms !== null && <div><span>{t("bedrooms")}</span><strong><BedDouble size={16} /> {listing.property.bedrooms}</strong></div>}{listing.property.bathrooms !== null && <div><span>{t("bathrooms")}</span><strong>{listing.property.bathrooms}</strong></div>}{listing.property.floorArea !== null && <div><span>{t("floorArea")}</span><strong><Building2 size={16} /> {listing.property.floorArea.toLocaleString()} sqft</strong></div>}{listing.property.furnished !== null && <div><span>{t("furnishedLabel")}</span><strong>{listing.property.furnished ? t("yes") : t("no")}</strong></div>}</div>
        <div className="amenity-list"><h3>{t("whatOffers")}</h3><div>{listing.amenities.map((amenity) => <span key={amenity.slug}><Check size={15} /> {amenity.name}</span>)}</div></div>
      </div>
      <aside className="detail-aside"><Card className="contact-card"><div className="detail-price">{formatPrice(listing.price, listing.transactionType)}</div><div className="contact-person"><span className="contact-avatar">{(listing.contact.agent ?? listing.contact.owner ?? "P").slice(0, 1)}</span><div><strong>{listing.contact.agent ?? listing.contact.owner ?? t("contact")}</strong><small>{listing.contact.agent ? t("listingAgent") : t("propertyOwner")}</small></div></div><button className={`save-detail ${saved ? "is-saved" : ""}`} onClick={handleSave}><Heart size={17} fill={saved ? "currentColor" : "none"} /> {saved ? t("savedFavorites") : t("saveProperty")}</button><div className="contact-divider" /><form onSubmit={handleInquiry}><label>{t("inquiryLabel")}<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} /></label>{sent ? <div className="success-message"><Check size={16} /> {t("inquirySent")}</div> : <Button size="lg" className="full-button" type="submit"><Send size={16} /> {user ? t("sendInquiry") : t("signInToInquire")}</Button>}{error && <div className="auth-error">{error}</div>}</form><div className="trust-note"><ShieldCheck size={15} /> {t("reviewedListing")} · {listing.referenceCode}</div></Card></aside>
    </div>
  </section>;
}
